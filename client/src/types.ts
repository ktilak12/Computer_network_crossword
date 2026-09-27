export type Direction = 'across' | 'down';

export interface CluePublic {
  id: number;
  number: number;
  direction: Direction;
  clue: string;
  length: number;
  row: number;
  col: number;
}

export interface GridCell {
  row: number;
  col: number;
  clueNumber?: number;
  isPlayable: boolean;
  acrossClueId?: number;
  downClueId?: number;
}

export interface GameSettings {
  roomName: string;
  durationMinutes: number;
  pointsPerWord: number;
  speedBonus: number;
  completionBonus: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  progress: number; // 0 - 100
  solvedClues: number[];
  incorrectAttempts: number;
  isOnline: boolean;
  joinedAt: number;
  completedAt?: number;
  rank?: number;
}

export type RoomStatus = 'lobby' | 'in_progress' | 'paused' | 'ended';

export interface RoomState {
  code: string;
  status: RoomStatus;
  settings: GameSettings;
  startedAt?: number;
  timeRemaining: number;
  players: Record<string, Player>;
  totalWords: number;
}

export interface SubmissionResult {
  clueId: number;
  correct: boolean;
  pointsEarned: number;
  isSpeedBonus: boolean;
  isCompletionBonus: boolean;
  totalScore: number;
  progress: number;
  allSolved: boolean;
  word?: string;
  message?: string;
  error?: string;
}

export interface AnalyticsReport {
  roomCode: string;
  totalParticipants: number;
  completedParticipants: number;
  completionRate: number;
  averageScore: number;
  averageCompletionTimeSec: number;
  highestScore: number;
  fastestCompletionTimeSec: number;
  fastestPlayerName?: string;
  highestScorePlayerName?: string;
  difficultClues: Array<{
    id: number;
    number: number;
    direction: Direction;
    clue: string;
    answer: string;
    failCount: number;
    solveCount: number;
    accuracy: number;
  }>;
  frequentMistakes: Array<{
    clueId: number;
    clueNumber: number;
    clueText: string;
    submittedAnswer: string;
    count: number;
  }>;
  finalLeaderboard: Array<Player & { rank: number }>;
}

export interface RoomDetailsResponse {
  room: RoomState;
  qrCode?: string;
  grid: {
    rows: number;
    cols: number;
    cells: GridCell[][];
    clues: CluePublic[];
  };
}
