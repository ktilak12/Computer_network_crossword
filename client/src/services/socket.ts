import { io, Socket } from 'socket.io-client';
import { RoomState, Player, SubmissionResult, AnalyticsReport } from '../types.js';

let socket: Socket | null = null;
let lastJoinParams: { roomCode: string; playerId?: string; isHost?: boolean } | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const serverUrl = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '') || '/';
    socket = io(serverUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      if (lastJoinParams) {
        socket?.emit('join_room', lastJoinParams);
      }
    });
  }
  return socket;
}

export function initSocketConnection(roomCode: string, playerId?: string, isHost?: boolean) {
  const s = getSocket();
  lastJoinParams = {
    roomCode: roomCode.toUpperCase(),
    playerId,
    isHost,
  };

  if (!s.connected) {
    s.connect();
  } else {
    s.emit('join_room', lastJoinParams);
  }

  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    lastJoinParams = null;
  }
}

export interface SocketEvents {
  onRoomState: (state: RoomState) => void;
  onTimerTick: (data: { timeRemaining: number; totalDuration: number }) => void;
  onLeaderboardUpdate: (leaderboard: Player[]) => void;
  onGameStarted: (data: { startedAt: number; durationSeconds: number }) => void;
  onGamePaused: () => void;
  onGameResumed: () => void;
  onGameOver: (data: { report: AnalyticsReport }) => void;
  onSubmissionResponse: (result: SubmissionResult) => void;
  onKicked: (data: { message: string }) => void;
}

export function subscribeToGameEvents(callbacks: Partial<SocketEvents>) {
  const s = getSocket();

  if (callbacks.onRoomState) {
    s.on('room_state_update', (d: { state: RoomState }) => callbacks.onRoomState!(d.state));
  }
  if (callbacks.onTimerTick) {
    s.on('timer_tick', callbacks.onTimerTick);
  }
  if (callbacks.onLeaderboardUpdate) {
    s.on('leaderboard_update', (d: { leaderboard: Player[] }) => callbacks.onLeaderboardUpdate!(d.leaderboard));
  }
  if (callbacks.onGameStarted) {
    s.on('game_started', callbacks.onGameStarted);
  }
  if (callbacks.onGamePaused) {
    s.on('game_paused', callbacks.onGamePaused);
  }
  if (callbacks.onGameResumed) {
    s.on('game_resumed', callbacks.onGameResumed);
  }
  if (callbacks.onGameOver) {
    s.on('game_over', callbacks.onGameOver);
  }
  if (callbacks.onSubmissionResponse) {
    s.on('submission_response', callbacks.onSubmissionResponse);
  }
  if (callbacks.onKicked) {
    s.on('player_kicked', callbacks.onKicked);
  }

  return () => {
    s.off('room_state_update');
    s.off('timer_tick');
    s.off('leaderboard_update');
    s.off('game_started');
    s.off('game_paused');
    s.off('game_resumed');
    s.off('game_over');
    s.off('submission_response');
    s.off('player_kicked');
  };
}
