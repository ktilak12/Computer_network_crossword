import { Server, Socket } from 'socket.io';
import { gameEngine } from './gameEngine.js';

export function setupSocketHandlers(io: Server) {
  gameEngine.setIO(io);

  io.on('connection', (socket: Socket) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;
    let isTeacher = false;

    // Join Room as Student or Teacher
    socket.on('join_room', async ({ roomCode, playerId, isHost }: { roomCode: string; playerId?: string; isHost?: boolean }) => {
      const code = roomCode.toUpperCase();
      const room = gameEngine.getRoom(code);

      if (!room) {
        socket.emit('error_message', { message: 'Room not found' });
        return;
      }

      currentRoomCode = code;
      isTeacher = !!isHost;
      socket.join(code);

      if (playerId) {
        currentPlayerId = playerId;
        socket.join(playerId); // individual room for targeted messages
        gameEngine.setPlayerStatus(code, playerId, true);
      }

      // Send initial room state
      socket.emit('room_state_update', { state: room });
    });

    // Student Word Submission
    socket.on('submit_word', async ({ clueId, answer }: { clueId: number; answer: string }) => {
      if (!currentRoomCode || !currentPlayerId) {
        socket.emit('submission_response', { error: 'Not joined in a room' });
        return;
      }

      const result = await gameEngine.submitAnswer(currentRoomCode, currentPlayerId, clueId, answer);
      socket.emit('submission_response', result);
    });

    // Teacher Controls
    socket.on('teacher_start', async () => {
      if (!currentRoomCode) return;
      await gameEngine.startGame(currentRoomCode);
    });

    socket.on('teacher_pause', () => {
      if (!currentRoomCode) return;
      gameEngine.pauseGame(currentRoomCode);
    });

    socket.on('teacher_resume', () => {
      if (!currentRoomCode) return;
      gameEngine.resumeGame(currentRoomCode);
    });

    socket.on('teacher_end', async () => {
      if (!currentRoomCode) return;
      await gameEngine.endGame(currentRoomCode);
    });

    socket.on('teacher_kick', async ({ playerId }: { playerId: string }) => {
      if (!currentRoomCode) return;
      await gameEngine.kickPlayer(currentRoomCode, playerId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (currentRoomCode && currentPlayerId) {
        gameEngine.setPlayerStatus(currentRoomCode, currentPlayerId, false);
      }
    });
  });
}
