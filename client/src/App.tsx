import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api.js';
import { initSocketConnection, subscribeToGameEvents, disconnectSocket } from './services/socket.js';
import { RoomState, Player, GridCell, CluePublic, Direction, AnalyticsReport, SubmissionResult } from './types.js';
import { Navbar } from './components/Navbar.js';
import { DashboardHUD } from './components/DashboardHUD.js';
import { CrosswordGrid } from './components/CrosswordGrid.js';
import { ClueList } from './components/ClueList.js';
import { LiveLeaderboard } from './components/LiveLeaderboard.js';
import { Lobby } from './components/Lobby.js';
import { TeacherDashboard } from './components/TeacherDashboard.js';
import { StudentJoin } from './components/StudentJoin.js';
import { AnalyticsModal } from './components/AnalyticsModal.js';
import { QRCodeModal } from './components/QRCodeModal.js';
import { ProjectorView } from './components/ProjectorView.js';
import { CreateRoomModal } from './components/CreateRoomModal.js';
import { MobileKeypad } from './components/MobileKeypad.js';
import { sound } from './utils/sound.js';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // App Navigation State
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(undefined);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Crossword Data
  const [gridCells, setGridCells] = useState<GridCell[][]>([]);
  const [clues, setClues] = useState<CluePublic[]>([]);
  const [userLetters, setUserLetters] = useState<Record<string, string>>({});

  // Student State
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<Direction>('across');
  const [shakeClueId, setShakeClueId] = useState<number | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<Array<{ id: string; text: string; row: number; col: number; isBonus?: boolean }>>([]);

  // Modals & Views
  const [mobileTab, setMobileTab] = useState<'puzzle' | 'clues' | 'leaderboard'>('puzzle');
  const [showVirtualKeypad, setShowVirtualKeypad] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [analyticsReport, setAnalyticsReport] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const restoreSolvedWords = useCallback((solvedWords: Record<number, string>, clueList: CluePublic[]) => {
    const updates: Record<string, string> = {};
    for (const [clueIdStr, word] of Object.entries(solvedWords)) {
      const clueId = Number(clueIdStr);
      const clue = clueList.find((c) => c.id === clueId);
      if (clue && word) {
        for (let i = 0; i < clue.length; i++) {
          const cr = clue.row + (clue.direction === 'down' ? i : 0);
          const cc = clue.col + (clue.direction === 'across' ? i : 0);
          updates[`${cr}_${cc}`] = word[i];
        }
      }
    }
    setUserLetters((prev) => ({ ...prev, ...updates }));
  }, []);

  // Fetch Room & Grid Data
  const loadRoomData = useCallback(async (code: string, playerId?: string, isHost?: boolean) => {
    setIsLoading(true);
    try {
      const data = await api.getRoom(code);
      setRoom(data.room);
      setQrCodeUrl(data.qrCode);
      setGridCells(data.grid.cells);
      setClues(data.grid.clues);

      // Connect real-time socket with explicit playerId and role
      const effectivePlayerId = playerId !== undefined ? playerId : currentPlayer?.id;
      const effectiveIsHost = isHost !== undefined ? isHost : role === 'teacher';
      initSocketConnection(code, effectivePlayerId, effectiveIsHost);
      return data;
    } catch (err: any) {
      console.error('Error loading room:', err);
      showToast(err.message || 'Failed to load room details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentPlayer?.id, role, showToast]);

  // Monitor network connectivity & auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('🟢 Back online! Re-syncing quiz telemetry...');
      if (room?.code) {
        loadRoomData(room.code, currentPlayer?.id);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('⚠️ Wi-Fi/cellular connection lost. Reconnecting...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [room?.code, currentPlayer?.id, loadRoomData, showToast]);

  // Keep phone screen awake during active quiz (Screen Wake Lock API)
  useEffect(() => {
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && room?.status === 'in_progress') {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request error or not supported:', err);
      }
    };

    if (room?.status === 'in_progress') {
      requestWakeLock();
    }

    const handleVisibilityChange = () => {
      if (wakeLockSentinel !== null && document.visibilityState === 'visible' && room?.status === 'in_progress') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [room?.status]);

  // Parse Initial URL & handle Session Reconnection
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    const joinMatch = path.match(/\/join\/([A-Za-z0-9]+)/);
    const roomFromUrl = joinMatch ? joinMatch[1] : urlParams.get('room');
    const roleFromUrl = urlParams.get('role');

    if (roleFromUrl === 'teacher') {
      setRole('teacher');
    }

    const savedSession = localStorage.getItem('netcrossword_player_session');
    let parsedStudentSession: { roomCode: string; id: string; name: string; avatar: string } | null = null;
    if (savedSession) {
      try {
        parsedStudentSession = JSON.parse(savedSession);
      } catch (e) {
        localStorage.removeItem('netcrossword_player_session');
      }
    }

    const targetRoomCode = roomFromUrl ? roomFromUrl.toUpperCase() : parsedStudentSession?.roomCode;

    if (targetRoomCode) {
      setInitialRoomCode(targetRoomCode);

      if (roleFromUrl === 'teacher') {
        loadRoomData(targetRoomCode, undefined, true);
      } else if (parsedStudentSession && parsedStudentSession.roomCode === targetRoomCode) {
        // Attempt seamless student reconnection
        api.joinRoom(targetRoomCode, parsedStudentSession.name, parsedStudentSession.avatar, parsedStudentSession.id)
          .then(async (res) => {
            setCurrentPlayer(res.player);
            setRole('student');
            const data = await loadRoomData(targetRoomCode, res.player.id, false);
            if (res.solvedWords && data?.grid?.clues) {
              restoreSolvedWords(res.solvedWords, data.grid.clues);
            }
          })
          .catch(() => {
            localStorage.removeItem('netcrossword_player_session');
            loadRoomData(targetRoomCode);
          });
      } else {
        // Pre-fetch room metadata for student join screen
        loadRoomData(targetRoomCode);
      }
    } else if (roleFromUrl === 'teacher') {
      setIsCreateModalOpen(true);
    }
  }, [loadRoomData, restoreSolvedWords]);

  // Socket event subscriptions
  useEffect(() => {
    if (!room?.code) return;

    const unsubscribe = subscribeToGameEvents({
      onRoomState: (updatedState) => {
        setRoom(updatedState);
        if (currentPlayer && updatedState.players[currentPlayer.id]) {
          setCurrentPlayer(updatedState.players[currentPlayer.id]);
        }
      },
      onTimerTick: ({ timeRemaining }) => {
        setRoom((prev) => (prev ? { ...prev, timeRemaining } : null));
      },
      onLeaderboardUpdate: (leaderboard) => {
        setRoom((prev) => {
          if (!prev) return null;
          const playerMap: Record<string, Player> = {};
          leaderboard.forEach((p) => (playerMap[p.id] = p));
          return { ...prev, players: playerMap };
        });
      },
      onGameStarted: () => {
        sound.playSpeedBonus();
      },
      onGameOver: ({ report }) => {
        setAnalyticsReport(report);
        setIsAnalyticsOpen(true);
      },
      onKicked: ({ message }) => {
        alert(message);
        localStorage.removeItem('netcrossword_player_session');
        setCurrentPlayer(null);
        setRoom(null);
        disconnectSocket();
      },
    });

    return () => unsubscribe();
  }, [room?.code, currentPlayer?.id]);

  // Set default initial active cell when grid is loaded
  useEffect(() => {
    if (gridCells.length > 0 && !activeCell) {
      // Find first playable cell
      for (let r = 0; r < gridCells.length; r++) {
        for (let c = 0; c < gridCells[r].length; c++) {
          if (gridCells[r][c].isPlayable) {
            setActiveCell({ row: r, col: c });
            return;
          }
        }
      }
    }
  }, [gridCells, activeCell]);

  // Handle Create Room as Teacher
  const handleCreateRoom = async (settings: any) => {
    setIsLoading(true);
    try {
      const res = await api.createRoom(settings);
      setRole('teacher');
      window.history.replaceState({}, '', `?room=${res.code}&role=teacher`);
      localStorage.setItem('netcrossword_teacher_room', res.code);
      await loadRoomData(res.code, undefined, true);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Student Join
  const handleStudentJoin = async (roomCode: string, name: string, avatar: string) => {
    setIsLoading(true);
    try {
      const cleanCode = roomCode.trim().toUpperCase();
      const res = await api.joinRoom(cleanCode, name, avatar);
      setCurrentPlayer(res.player);
      setRole('student');

      localStorage.setItem(
        'netcrossword_player_session',
        JSON.stringify({
          roomCode: cleanCode,
          id: res.player.id,
          name: res.player.name,
          avatar: res.player.avatar,
        })
      );

      window.history.replaceState({}, '', `/join/${cleanCode}`);

      const data = await loadRoomData(cleanCode, res.player.id, false);
      if (res.solvedWords && data?.grid?.clues) {
        restoreSolvedWords(res.solvedWords, data.grid.clues);
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave room and reset
  const handleLeaveRoom = () => {
    disconnectSocket();
    localStorage.removeItem('netcrossword_player_session');
    localStorage.removeItem('netcrossword_teacher_room');
    setCurrentPlayer(null);
    setRoom(null);
    setUserLetters({});
    setActiveCell(null);
    setInitialRoomCode('');
    setRole('student');
    window.history.replaceState({}, '', '/');
  };

  // Cell Selection
  const handleSelectCell = (row: number, col: number) => {
    sound.playClick();
    const cell = gridCells[row]?.[col];
    if (!cell || !cell.isPlayable) return;

    setActiveCell({ row, col });

    // Choose appropriate direction if cell only belongs to one clue
    if (cell.acrossClueId && !cell.downClueId) {
      setActiveDirection('across');
    } else if (cell.downClueId && !cell.acrossClueId) {
      setActiveDirection('down');
    }
  };

  // Direction toggle
  const handleToggleDirection = useCallback(() => {
    if (!activeCell) return;
    const cell = gridCells[activeCell.row]?.[activeCell.col];
    if (cell?.acrossClueId && cell?.downClueId) {
      setActiveDirection((prev) => (prev === 'across' ? 'down' : 'across'));
      sound.playClick();
    }
  }, [activeCell, gridCells]);

  // Letter input
  const handleLetterChange = (row: number, col: number, letter: string) => {
    setUserLetters((prev) => ({
      ...prev,
      [`${row}_${col}`]: letter.toUpperCase(),
    }));
  };

  // Clue select from panel
  const handleSelectClue = (clue: CluePublic) => {
    sound.playClick();
    setActiveDirection(clue.direction);
    setActiveCell({ row: clue.row, col: clue.col });
    setMobileTab('puzzle'); // switch to puzzle tab immediately so mobile user can see grid and type
  };

  // Next word jump
  const handleNextWord = () => {
    if (!activeCell || clues.length === 0) return;
    const cell = gridCells[activeCell.row]?.[activeCell.col];
    const currentClueId = activeDirection === 'across' ? cell?.acrossClueId : cell?.downClueId;
    const currentIndex = clues.findIndex((c) => c.id === currentClueId);
    const nextClue = clues[(currentIndex + 1) % clues.length];
    if (nextClue) {
      handleSelectClue(nextClue);
    }
  };

  // Previous word jump
  const handlePrevWord = () => {
    if (!activeCell || clues.length === 0) return;
    const cell = gridCells[activeCell.row]?.[activeCell.col];
    const currentClueId = activeDirection === 'across' ? cell?.acrossClueId : cell?.downClueId;
    const currentIndex = clues.findIndex((c) => c.id === currentClueId);
    const prevIndex = (currentIndex - 1 + clues.length) % clues.length;
    const prevClue = clues[prevIndex];
    if (prevClue) {
      handleSelectClue(prevClue);
    }
  };

  // Submit Answer
  const handleSubmitWord = async (clueId: number, word: string) => {
    if (!room || !currentPlayer || !word) return;

    try {
      const res: SubmissionResult = await api.submitAnswer(room.code, currentPlayer.id, clueId, word);

      if (res.correct) {
        if (res.isSpeedBonus) {
          sound.playSpeedBonus();
        } else {
          sound.playCorrect();
        }

        // Float score banner
        const clue = clues.find((c) => c.id === clueId);
        if (clue) {
          const ptId = String(Date.now());
          setFloatingPoints((prev) => [
            ...prev,
            {
              id: ptId,
              text: `+${res.pointsEarned} PTS ${res.isSpeedBonus ? '⚡ SPEED!' : ''}`,
              row: clue.row,
              col: clue.col,
              isBonus: res.isSpeedBonus,
            },
          ]);
          setTimeout(() => {
            setFloatingPoints((prev) => prev.filter((p) => p.id !== ptId));
          }, 1200);

          // Lock answer letters on grid
          if (res.word) {
            const updates: Record<string, string> = {};
            for (let i = 0; i < clue.length; i++) {
              const cr = clue.row + (clue.direction === 'down' ? i : 0);
              const cc = clue.col + (clue.direction === 'across' ? i : 0);
              updates[`${cr}_${cc}`] = res.word[i];
            }
            setUserLetters((prev) => ({ ...prev, ...updates }));
          }
        }

        // All solved victory!
        if (res.allSolved) {
          sound.playVictory();
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }

        // Advance to next unsolved clue
        handleNextWord();
      } else {
        // Incorrect attempt
        sound.playIncorrect();
        setShakeClueId(clueId);
        setTimeout(() => setShakeClueId(null), 500);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      showToast(err.message || 'Submission error. Please retry.');
    }
  };

  // Teacher Controls
  const handleTeacherStart = async () => {
    if (!room) return;
    await api.startGame(room.code);
  };

  const handleTeacherPause = async () => {
    if (!room) return;
    await api.pauseGame(room.code);
  };

  const handleTeacherResume = async () => {
    if (!room) return;
    await api.resumeGame(room.code);
  };

  const handleTeacherEnd = async () => {
    if (!room) return;
    const res = await api.endGame(room.code);
    if (res.report) {
      setAnalyticsReport(res.report);
      setIsAnalyticsOpen(true);
    }
  };

  const handleKickPlayer = async (playerId: string) => {
    if (!room) return;
    await api.kickPlayer(room.code, playerId);
  };

  const handleExportCSV = () => {
    if (!room) return;
    window.location.href = api.getExportCSVUrl(room.code);
  };

  // Fullscreen Projector Mode
  if (isProjectorMode && room) {
    return (
      <ProjectorView
        room={room}
        qrCodeUrl={qrCodeUrl}
        onExitProjector={() => setIsProjectorMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Offline Status Alert */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-rose-950/95 border border-rose-500 text-rose-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>⚠️ Connection Lost! Reconnecting... Your answers and score are preserved.</span>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-2xl animate-fade-in flex items-center gap-2">
          <span>⚠️ {toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        room={room || undefined}
        role={role}
        isOnline={isOnline}
        isProjectorMode={isProjectorMode}
        onToggleProjector={() => setIsProjectorMode(true)}
        onLeaveRoom={room ? handleLeaveRoom : undefined}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* State 1: Student not yet registered/joined as a player */}
        {(!room || (role === 'student' && !currentPlayer)) && (
          <StudentJoin
            initialRoomCode={initialRoomCode || room?.code || ''}
            onJoin={handleStudentJoin}
            onCreateRoomAsTeacher={() => {
              setRole('teacher');
              setIsCreateModalOpen(true);
            }}
            isLoading={isLoading}
          />
        )}

        {/* State 2: Room exists & is in Lobby (either teacher or registered student) */}
        {room && room.status === 'lobby' && (role === 'teacher' || currentPlayer) && (
          <Lobby
            room={room}
            qrCode={qrCodeUrl}
            isTeacher={role === 'teacher'}
            onStartGame={handleTeacherStart}
            onShowQRModal={() => setIsQRModalOpen(true)}
          />
        )}

        {/* State 3: Teacher View during active game or ended game */}
        {room && role === 'teacher' && room.status !== 'lobby' && (
          <TeacherDashboard
            room={room}
            onStartGame={handleTeacherStart}
            onPauseGame={handleTeacherPause}
            onResumeGame={handleTeacherResume}
            onEndGame={handleTeacherEnd}
            onKickPlayer={handleKickPlayer}
            onShowQRModal={() => setIsQRModalOpen(true)}
            onShowAnalytics={() => setIsAnalyticsOpen(true)}
            onExportCSV={handleExportCSV}
            onToggleProjector={() => setIsProjectorMode(true)}
          />
        )}

        {/* State 4: Student View during Game Play */}
        {room && role === 'student' && currentPlayer && room.status !== 'lobby' && (
          <div className="space-y-4 sm:space-y-6 animate-pop-in">
            {/* Driving Dashboard Telemetry HUD */}
            <DashboardHUD
              timeRemaining={room.timeRemaining}
              totalDuration={room.settings.durationMinutes * 60}
              player={currentPlayer || undefined}
              totalWords={clues.length}
              rank={currentPlayer?.rank}
              totalPlayers={Object.keys(room.players).length}
              gameStatus={room.status}
            />

            {/* Mobile Segmented Tab Switcher (Visible on Phones & Tablets) */}
            <div className="flex lg:hidden items-center justify-between p-1 bg-slate-900/90 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMobileTab('puzzle')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === 'puzzle'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🧩 Puzzle</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('clues')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === 'clues'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📋 Clues</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    mobileTab === 'clues'
                      ? 'bg-slate-950/20 text-slate-950 font-black'
                      : 'bg-slate-800 text-cyan-400'
                  }`}
                >
                  {currentPlayer?.solvedClues.length || 0}/{clues.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('leaderboard')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === 'leaderboard'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏆 Ranks</span>
                {currentPlayer?.rank && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      mobileTab === 'leaderboard'
                        ? 'bg-slate-950/20 text-slate-950 font-black'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    #{currentPlayer.rank}
                  </span>
                )}
              </button>
            </div>

            {/* Crossword & Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Center: Interactive Crossword Grid */}
              <div
                className={`lg:col-span-8 flex flex-col items-center ${
                  mobileTab !== 'puzzle' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <CrosswordGrid
                  gridCells={gridCells}
                  clues={clues}
                  userLetters={userLetters}
                  solvedClues={currentPlayer?.solvedClues || []}
                  activeCell={activeCell}
                  activeDirection={activeDirection}
                  onSelectCell={handleSelectCell}
                  onLetterChange={handleLetterChange}
                  onToggleDirection={handleToggleDirection}
                  onSubmitWord={handleSubmitWord}
                  shakeClueId={shakeClueId}
                  floatingPoints={floatingPoints}
                  onNextWord={handleNextWord}
                  onPrevWord={handlePrevWord}
                />

                {/* Mobile System Keyboard Note & Virtual Keypad Toggle */}
                <div className="w-full mt-2 lg:hidden">
                  <div className="flex items-center justify-between px-2 py-1 mb-1 text-xs font-mono">
                    <span className="text-cyan-400 text-[11px] flex items-center gap-1.5">
                      <span>⌨️ System Keyboard Ready</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowVirtualKeypad(!showVirtualKeypad)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10 hover:border-cyan-500/30 text-slate-300 text-xs transition-colors"
                    >
                      {showVirtualKeypad ? '📱 Hide On-Screen Pad' : '📱 Show On-Screen Pad'}
                    </button>
                  </div>

                  {showVirtualKeypad && (
                    <MobileKeypad
                      onKeyPress={(ch) => {
                        if (activeCell) {
                          handleLetterChange(activeCell.row, activeCell.col, ch);
                        }
                      }}
                      onBackspace={() => {
                        if (activeCell) {
                          handleLetterChange(activeCell.row, activeCell.col, '');
                        }
                      }}
                      onSubmit={() => {
                        if (activeCell) {
                          const cell = gridCells[activeCell.row]?.[activeCell.col];
                          const clueId = activeDirection === 'across' ? cell?.acrossClueId : cell?.downClueId;
                          const clue = clues.find((c) => c.id === clueId);
                          if (clue) {
                            let str = '';
                            for (let i = 0; i < clue.length; i++) {
                              const cr = clue.row + (clue.direction === 'down' ? i : 0);
                              const cc = clue.col + (clue.direction === 'across' ? i : 0);
                              str += userLetters[`${cr}_${cc}`] || '';
                            }
                            handleSubmitWord(clue.id, str);
                          }
                        }
                      }}
                      onToggleDirection={handleToggleDirection}
                      onNextWord={handleNextWord}
                      activeDirection={activeDirection}
                    />
                  )}
                </div>
              </div>

              {/* Right: Tabbed Clues & Live Leaderboard */}
              <div className="lg:col-span-4 space-y-6">
                <div className={mobileTab !== 'clues' ? 'hidden lg:block' : 'block'}>
                  <ClueList
                    clues={clues}
                    solvedClues={currentPlayer?.solvedClues || []}
                    activeClueId={
                      activeCell
                        ? activeDirection === 'across'
                          ? gridCells[activeCell.row]?.[activeCell.col]?.acrossClueId || null
                          : gridCells[activeCell.row]?.[activeCell.col]?.downClueId || null
                        : null
                    }
                    onSelectClue={handleSelectClue}
                  />
                </div>

                <div className={mobileTab !== 'leaderboard' ? 'hidden lg:block' : 'block'}>
                  <LiveLeaderboard
                    players={Object.values(room.players)}
                    currentPlayerId={currentPlayer?.id}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
        isLoading={isLoading}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        roomCode={room?.code || ''}
        qrCodeUrl={qrCodeUrl}
      />

      {analyticsReport && (
        <AnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          report={analyticsReport}
          onDownloadCSV={handleExportCSV}
        />
      )}
    </div>
  );
};
