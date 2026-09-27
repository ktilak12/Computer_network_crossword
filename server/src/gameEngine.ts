import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  GameSettings,
  Player,
  RoomState,
  RoomStatus,
  SubmissionResult,
  AnalyticsReport,
} from '../../shared/types.js';
import { COMPUTER_NETWORKS_CLUES } from '../../shared/crosswordData.js';
import { getDatabase } from './db.js';
import { Server } from 'socket.io';

export class GameEngine {
  private rooms = new Map<string, RoomState>();
  private roomTimers = new Map<string, NodeJS.Timeout>();
  private qrCodes = new Map<string, string>();
  private submissionRecords: Array<{
    roomCode: string;
    playerId: string;
    clueId: number;
    answer: string;
    correct: boolean;
    timestamp: number;
  }> = [];
  private playerRateLimits = new Map<string, number>(); // playerId -> last submission timestamp
  private io?: Server;

  setIO(io: Server) {
    this.io = io;
  }

  // Generate unique room code like NET42 or NET89
  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NET';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }
    return code;
  }

  // Create room
  async createRoom(settings: Partial<GameSettings>, hostUrl?: string): Promise<{ code: string; qrCode: string; state: RoomState }> {
    const code = this.generateRoomCode();
    const fullSettings: GameSettings = {
      roomName: settings.roomName || `Computer Networks Battle - Room ${code}`,
      durationMinutes: settings.durationMinutes || 10,
      pointsPerWord: settings.pointsPerWord ?? 100,
      speedBonus: settings.speedBonus ?? 25,
      completionBonus: settings.completionBonus ?? 500,
    };

    const roomState: RoomState = {
      code,
      status: 'lobby',
      settings: fullSettings,
      timeRemaining: fullSettings.durationMinutes * 60,
      players: {},
      totalWords: COMPUTER_NETWORKS_CLUES.length,
    };

    this.rooms.set(code, roomState);

    // Generate QR Code linking to join URL
    const baseUrl = hostUrl || 'http://localhost:5173';
    const joinUrl = `${baseUrl}/join/${code}`;
    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      margin: 1,
      color: {
        dark: '#06b6d4',
        light: '#030712',
      },
      width: 320,
    });

    this.qrCodes.set(code, qrDataUrl);

    // Save to Database
    const db = await getDatabase();
    await db.saveRoom(code, fullSettings);

    return { code, qrCode: qrDataUrl, state: roomState };
  }

  getRoom(code: string): RoomState | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getQRCode(code: string): string | undefined {
    return this.qrCodes.get(code.toUpperCase());
  }

  // Add or reconnect player
  async joinPlayer(
    roomCode: string,
    playerName: string,
    avatar?: string,
    existingPlayerId?: string
  ): Promise<{ player: Player; isReconnection: boolean; solvedWords?: Record<number, string> } | { error: string }> {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { error: 'Room not found' };
    }

    const cleanCode = room.code;

    // Helper to get solved words for a player
    const getSolvedWords = (p: Player) => {
      const solved: Record<number, string> = {};
      for (const cid of p.solvedClues) {
        const c = COMPUTER_NETWORKS_CLUES.find((clue) => clue.id === cid);
        if (c) solved[cid] = c.answer;
      }
      return solved;
    };

    // Check reconnection
    if (existingPlayerId && room.players[existingPlayerId]) {
      const existing = room.players[existingPlayerId];
      existing.isOnline = true;
      existing.name = playerName || existing.name;
      if (avatar) existing.avatar = avatar;

      this.broadcastRoomUpdate(cleanCode);
      return { player: existing, isReconnection: true, solvedWords: getSolvedWords(existing) };
    }

    // Limit to 60 students per classroom
    if (Object.keys(room.players).length >= 60) {
      return { error: 'Classroom room is full (maximum 60 students)' };
    }

    const playerId = uuidv4();
    const newPlayer: Player = {
      id: playerId,
      name: playerName.trim().slice(0, 30) || `Student ${Object.keys(room.players).length + 1}`,
      avatar: avatar || '🧑‍💻',
      score: 0,
      progress: 0,
      solvedClues: [],
      incorrectAttempts: 0,
      isOnline: true,
      joinedAt: Date.now(),
    };

    room.players[playerId] = newPlayer;

    const db = await getDatabase();
    await db.savePlayer(cleanCode, newPlayer);

    this.broadcastRoomUpdate(cleanCode);
    return { player: newPlayer, isReconnection: false, solvedWords: {} };
  }

  // Kick player
  async kickPlayer(roomCode: string, playerId: string): Promise<boolean> {
    const room = this.getRoom(roomCode);
    if (!room || !room.players[playerId]) return false;

    delete room.players[playerId];
    if (this.io) {
      this.io.to(playerId).emit('player_kicked', { message: 'You were removed from the room by the teacher.' });
    }
    this.broadcastRoomUpdate(room.code);
    return true;
  }

  // Set student online/offline
  setPlayerStatus(roomCode: string, playerId: string, isOnline: boolean) {
    const room = this.getRoom(roomCode);
    if (room && room.players[playerId]) {
      room.players[playerId].isOnline = isOnline;
      this.broadcastRoomUpdate(room.code);
    }
  }

  // Start game
  async startGame(roomCode: string): Promise<boolean> {
    const room = this.getRoom(roomCode);
    if (!room || room.status === 'in_progress') return false;

    room.status = 'in_progress';
    room.startedAt = Date.now();
    room.timeRemaining = room.settings.durationMinutes * 60;

    const db = await getDatabase();
    await db.updateRoomStatus(room.code, 'in_progress', room.startedAt);

    // Start timer interval
    this.startTimer(room.code);

    if (this.io) {
      this.io.to(room.code).emit('game_started', {
        startedAt: room.startedAt,
        durationSeconds: room.timeRemaining,
      });
    }

    this.broadcastRoomUpdate(room.code);
    return true;
  }

  // Pause game
  pauseGame(roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'in_progress') return false;

    room.status = 'paused';
    this.clearTimer(room.code);

    if (this.io) {
      this.io.to(room.code).emit('game_paused');
    }
    this.broadcastRoomUpdate(room.code);
    return true;
  }

  // Resume game
  resumeGame(roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'paused') return false;

    room.status = 'in_progress';
    this.startTimer(room.code);

    if (this.io) {
      this.io.to(room.code).emit('game_resumed');
    }
    this.broadcastRoomUpdate(room.code);
    return true;
  }

  // End game
  async endGame(roomCode: string): Promise<AnalyticsReport | null> {
    const room = this.getRoom(roomCode);
    if (!room || room.status === 'ended') return null;

    room.status = 'ended';
    this.clearTimer(room.code);

    const report = this.generateAnalyticsReport(room.code);

    const db = await getDatabase();
    await db.updateRoomStatus(room.code, 'ended', undefined, Date.now());
    await db.saveAnalytics(report);

    if (this.io) {
      this.io.to(room.code).emit('game_over', {
        report,
      });
    }
    this.broadcastRoomUpdate(room.code);
    return report;
  }

  // Timer loop
  private startTimer(roomCode: string) {
    this.clearTimer(roomCode);

    const timer = setInterval(async () => {
      const room = this.getRoom(roomCode);
      if (!room || room.status !== 'in_progress') {
        this.clearTimer(roomCode);
        return;
      }

      room.timeRemaining -= 1;

      if (this.io) {
        this.io.to(roomCode).emit('timer_tick', {
          timeRemaining: room.timeRemaining,
          totalDuration: room.settings.durationMinutes * 60,
        });
      }

      if (room.timeRemaining <= 0) {
        this.clearTimer(roomCode);
        await this.endGame(roomCode);
      }
    }, 1000);

    this.roomTimers.set(roomCode, timer);
  }

  private clearTimer(roomCode: string) {
    if (this.roomTimers.has(roomCode)) {
      clearInterval(this.roomTimers.get(roomCode)!);
      this.roomTimers.delete(roomCode);
    }
  }

  // Validate answer & calculate score
  async submitAnswer(
    roomCode: string,
    playerId: string,
    clueId: number,
    answer: string
  ): Promise<SubmissionResult | { error: string }> {
    const room = this.getRoom(roomCode);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'in_progress') return { error: 'Game is not currently active' };

    const player = room.players[playerId];
    if (!player) return { error: 'Player not found in room' };

    // Rate Limiting: 400ms between attempts
    const lastSub = this.playerRateLimits.get(playerId) || 0;
    const now = Date.now();
    if (now - lastSub < 400) {
      return { error: 'Submitting too fast. Please wait a moment.' };
    }
    this.playerRateLimits.set(playerId, now);

    // If already solved, ignore
    if (player.solvedClues.includes(clueId)) {
      return {
        clueId,
        correct: true,
        pointsEarned: 0,
        isSpeedBonus: false,
        isCompletionBonus: false,
        totalScore: player.score,
        progress: player.progress,
        allSolved: player.solvedClues.length >= room.totalWords,
        word: answer,
        message: 'Already solved!',
      };
    }

    const clue = COMPUTER_NETWORKS_CLUES.find((c) => c.id === clueId);
    if (!clue) return { error: 'Invalid clue ID' };

    const cleanSubmitted = answer.trim().toUpperCase();
    const isCorrect = cleanSubmitted === clue.answer.toUpperCase();

    let pointsEarned = 0;
    let isSpeedBonus = false;
    let isCompletionBonus = false;

    if (isCorrect) {
      pointsEarned += room.settings.pointsPerWord;

      // Speed bonus: If answered within first 25% of game or within 60s
      const elapsed = room.startedAt ? (now - room.startedAt) / 1000 : 0;
      const totalDurationSec = room.settings.durationMinutes * 60;
      if (elapsed <= 60 || elapsed <= totalDurationSec * 0.25) {
        pointsEarned += room.settings.speedBonus;
        isSpeedBonus = true;
      }

      player.solvedClues.push(clueId);
      player.score += pointsEarned;
      player.progress = Math.round((player.solvedClues.length / room.totalWords) * 100);

      // Check puzzle completion bonus
      if (player.solvedClues.length >= room.totalWords) {
        player.score += room.settings.completionBonus;
        pointsEarned += room.settings.completionBonus;
        isCompletionBonus = true;
        player.completedAt = now;
      }
    } else {
      player.incorrectAttempts += 1;
    }

    // Save record for analytics
    this.submissionRecords.push({
      roomCode: room.code,
      playerId,
      clueId,
      answer: cleanSubmitted,
      correct: isCorrect,
      timestamp: now,
    });

    // Save to Database
    const db = await getDatabase();
    await db.updatePlayerScore(
      room.code,
      playerId,
      player.score,
      player.progress,
      player.solvedClues,
      player.completedAt
    );
    await db.recordSubmission(room.code, playerId, clueId, cleanSubmitted, isCorrect, pointsEarned);

    // Update ranks & broadcast full room telemetry to all participants & teacher
    this.broadcastRoomUpdate(room.code);

    return {
      clueId,
      correct: isCorrect,
      pointsEarned,
      isSpeedBonus,
      isCompletionBonus,
      totalScore: player.score,
      progress: player.progress,
      allSolved: player.solvedClues.length >= room.totalWords,
      word: isCorrect ? clue.answer : undefined,
    };
  }

  // Update ranks
  private updateLeaderboard(roomCode: string) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    const sortedPlayers = Object.values(room.players).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.progress !== a.progress) return b.progress - a.progress;
      return (a.completedAt || Infinity) - (b.completedAt || Infinity);
    });

    sortedPlayers.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    if (this.io) {
      this.io.to(room.code).emit('leaderboard_update', {
        leaderboard: sortedPlayers,
      });
    }
  }

  private broadcastRoomUpdate(roomCode: string) {
    const room = this.getRoom(roomCode);
    if (!room || !this.io) return;

    this.updateLeaderboard(roomCode);
    this.io.to(roomCode).emit('room_state_update', {
      state: room,
    });
  }

  // Generate comprehensive analytics report
  generateAnalyticsReport(roomCode: string): AnalyticsReport {
    const room = this.getRoom(roomCode);
    const players = room ? Object.values(room.players) : [];
    const totalParticipants = players.length;

    const completedPlayers = players.filter((p) => p.progress === 100);
    const completedParticipants = completedPlayers.length;
    const completionRate = totalParticipants > 0 ? Math.round((completedParticipants / totalParticipants) * 100) : 0;

    const totalScore = players.reduce((sum, p) => sum + p.score, 0);
    const averageScore = totalParticipants > 0 ? Math.round(totalScore / totalParticipants) : 0;

    // Average completion time among finishers
    let avgCompTime = 0;
    if (completedParticipants > 0 && room?.startedAt) {
      const totalTimeSec = completedPlayers.reduce((sum, p) => {
        return sum + ((p.completedAt || Date.now()) - room.startedAt!) / 1000;
      }, 0);
      avgCompTime = Math.round(totalTimeSec / completedParticipants);
    }

    // Leaderboard
    const sortedPlayers = [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.progress !== a.progress) return b.progress - a.progress;
      return (a.completedAt || Infinity) - (b.completedAt || Infinity);
    });

    sortedPlayers.forEach((p, i) => (p.rank = i + 1));

    const highestScorePlayer = sortedPlayers[0];
    const highestScore = highestScorePlayer?.score || 0;

    // Fastest completion
    let fastestPlayer: Player | undefined;
    let fastestTimeSec = 0;
    if (completedPlayers.length > 0 && room?.startedAt) {
      completedPlayers.sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));
      fastestPlayer = completedPlayers[0];
      fastestTimeSec = Math.round(((fastestPlayer.completedAt || Date.now()) - room.startedAt) / 1000);
    }

    // Clue difficulty analytics
    const roomSubs = this.submissionRecords.filter((s) => s.roomCode === roomCode);
    const difficultClues = COMPUTER_NETWORKS_CLUES.map((clue) => {
      const clueSubs = roomSubs.filter((s) => s.clueId === clue.id);
      const failCount = clueSubs.filter((s) => !s.correct).length;
      const solveCount = clueSubs.filter((s) => s.correct).length;
      const totalAttempts = failCount + solveCount;
      const accuracy = totalAttempts > 0 ? Math.round((solveCount / totalAttempts) * 100) : 100;

      return {
        id: clue.id,
        number: clue.number,
        direction: clue.direction,
        clue: clue.clue,
        answer: clue.answer,
        failCount,
        solveCount,
        accuracy,
      };
    }).sort((a, b) => b.failCount - a.failCount);

    // Frequent mistakes
    const mistakeMap = new Map<string, number>();
    for (const sub of roomSubs) {
      if (!sub.correct && sub.answer) {
        const key = `${sub.clueId}:::${sub.answer}`;
        mistakeMap.set(key, (mistakeMap.get(key) || 0) + 1);
      }
    }

    const frequentMistakes = Array.from(mistakeMap.entries())
      .map(([key, count]) => {
        const [clueIdStr, ans] = key.split(':::');
        const clueId = parseInt(clueIdStr, 10);
        const clue = COMPUTER_NETWORKS_CLUES.find((c) => c.id === clueId);
        return {
          clueId,
          clueNumber: clue?.number || clueId,
          clueText: clue?.clue || '',
          submittedAnswer: ans,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      roomCode,
      totalParticipants,
      completedParticipants,
      completionRate,
      averageScore,
      averageCompletionTimeSec: avgCompTime,
      highestScore,
      highestScorePlayerName: highestScorePlayer?.name,
      fastestCompletionTimeSec: fastestTimeSec,
      fastestPlayerName: fastestPlayer?.name,
      difficultClues,
      frequentMistakes,
      finalLeaderboard: sortedPlayers.map((p, i) => ({ ...p, rank: i + 1 })),
    };
  }

  // Generate CSV for export
  generateCSVReport(roomCode: string): string {
    const report = this.generateAnalyticsReport(roomCode);
    const lines: string[] = [];

    lines.push(`NetCrossword Live - Game Report: ${roomCode}`);
    lines.push(`Generated at: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('OVERVIEW METRICS');
    lines.push(`Total Participants,${report.totalParticipants}`);
    lines.push(`Completed Students,${report.completedParticipants}`);
    lines.push(`Completion Rate,${report.completionRate}%`);
    lines.push(`Average Score,${report.averageScore}`);
    lines.push(`Average Completion Time,${report.averageCompletionTimeSec}s`);
    lines.push(`Highest Score,${report.highestScore} (${report.highestScorePlayerName || 'N/A'})`);
    lines.push(`Fastest Completion,${report.fastestCompletionTimeSec}s (${report.fastestPlayerName || 'N/A'})`);
    lines.push('');
    lines.push('FINAL LEADERBOARD');
    lines.push('Rank,Student Name,Score,Progress,Solved Words,Incorrect Attempts,Status');
    for (const p of report.finalLeaderboard) {
      lines.push(
        `${p.rank},"${p.name.replace(/"/g, '""')}",${p.score},${p.progress}%,${p.solvedClues.length}/20,${p.incorrectAttempts},${p.progress === 100 ? 'Completed' : 'Participating'}`
      );
    }
    lines.push('');
    lines.push('CLUE DIFFICULTY BREAKDOWN');
    lines.push('Number,Direction,Clue,Correct Answer,Failed Attempts,Solves,Accuracy');
    for (const c of report.difficultClues) {
      lines.push(
        `${c.number},${c.direction.toUpperCase()},"${c.clue.replace(/"/g, '""')}",${c.answer},${c.failCount},${c.solveCount},${c.accuracy}%`
      );
    }

    return lines.join('\n');
  }
}

export const gameEngine = new GameEngine();
