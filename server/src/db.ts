import pg from 'pg';
import { GameSettings, Player, AnalyticsReport } from '../../shared/types.js';

const { Pool } = pg;

// Database interface
export interface IDatabase {
  saveRoom(code: string, settings: GameSettings): Promise<void>;
  updateRoomStatus(code: string, status: string, startedAt?: number, endedAt?: number): Promise<void>;
  savePlayer(roomCode: string, player: Player): Promise<void>;
  updatePlayerScore(roomCode: string, playerId: string, score: number, progress: number, solvedClues: number[], completedAt?: number): Promise<void>;
  recordSubmission(roomCode: string, playerId: string, clueId: number, submittedAnswer: string, isCorrect: boolean, points: number): Promise<void>;
  saveAnalytics(report: AnalyticsReport): Promise<void>;
  getAnalytics(roomCode: string): Promise<AnalyticsReport | null>;
}

// In-Memory persistent fallback implementation
class MemoryDatabase implements IDatabase {
  private rooms = new Map<string, any>();
  private players = new Map<string, Map<string, Player>>();
  private submissions: Array<{
    roomCode: string;
    playerId: string;
    clueId: number;
    submittedAnswer: string;
    isCorrect: boolean;
    points: number;
    timestamp: number;
  }> = [];
  private analytics = new Map<string, AnalyticsReport>();

  async saveRoom(code: string, settings: GameSettings): Promise<void> {
    this.rooms.set(code, {
      code,
      settings,
      status: 'lobby',
      createdAt: Date.now(),
    });
    if (!this.players.has(code)) {
      this.players.set(code, new Map());
    }
  }

  async updateRoomStatus(code: string, status: string, startedAt?: number, endedAt?: number): Promise<void> {
    const room = this.rooms.get(code);
    if (room) {
      room.status = status;
      if (startedAt) room.startedAt = startedAt;
      if (endedAt) room.endedAt = endedAt;
    }
  }

  async savePlayer(roomCode: string, player: Player): Promise<void> {
    if (!this.players.has(roomCode)) {
      this.players.set(roomCode, new Map());
    }
    this.players.get(roomCode)!.set(player.id, { ...player });
  }

  async updatePlayerScore(
    roomCode: string,
    playerId: string,
    score: number,
    progress: number,
    solvedClues: number[],
    completedAt?: number
  ): Promise<void> {
    const roomPlayers = this.players.get(roomCode);
    if (roomPlayers && roomPlayers.has(playerId)) {
      const p = roomPlayers.get(playerId)!;
      p.score = score;
      p.progress = progress;
      p.solvedClues = solvedClues;
      if (completedAt) p.completedAt = completedAt;
    }
  }

  async recordSubmission(
    roomCode: string,
    playerId: string,
    clueId: number,
    submittedAnswer: string,
    isCorrect: boolean,
    points: number
  ): Promise<void> {
    this.submissions.push({
      roomCode,
      playerId,
      clueId,
      submittedAnswer,
      isCorrect,
      points,
      timestamp: Date.now(),
    });
  }

  async saveAnalytics(report: AnalyticsReport): Promise<void> {
    this.analytics.set(report.roomCode, report);
  }

  async getAnalytics(roomCode: string): Promise<AnalyticsReport | null> {
    return this.analytics.get(roomCode) || null;
  }
}

// PostgreSQL Implementation
class PostgresDatabase implements IDatabase {
  private pool: pg.Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/netcrossword',
      connectionTimeoutMillis: 3000,
    });
  }

  async init(): Promise<void> {
    // Run schema creation
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS rooms (
          code VARCHAR(16) PRIMARY KEY,
          settings JSONB NOT NULL,
          status VARCHAR(32) NOT NULL,
          started_at BIGINT,
          ended_at BIGINT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS players (
          id VARCHAR(64) PRIMARY KEY,
          room_code VARCHAR(16) REFERENCES rooms(code) ON DELETE CASCADE,
          name VARCHAR(64) NOT NULL,
          avatar VARCHAR(32),
          score INT DEFAULT 0,
          progress INT DEFAULT 0,
          solved_clues JSONB DEFAULT '[]'::jsonb,
          incorrect_attempts INT DEFAULT 0,
          completed_at BIGINT,
          joined_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          room_code VARCHAR(16) REFERENCES rooms(code) ON DELETE CASCADE,
          player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
          clue_id INT NOT NULL,
          submitted_answer VARCHAR(64) NOT NULL,
          is_correct BOOLEAN NOT NULL,
          points INT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS game_analytics (
          room_code VARCHAR(16) PRIMARY KEY REFERENCES rooms(code) ON DELETE CASCADE,
          report JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('✅ PostgreSQL Schema initialized successfully');
    } finally {
      client.release();
    }
  }

  async saveRoom(code: string, settings: GameSettings): Promise<void> {
    await this.pool.query(
      `INSERT INTO rooms (code, settings, status)
       VALUES ($1, $2, 'lobby')
       ON CONFLICT (code) DO UPDATE SET settings = $2`,
      [code, JSON.stringify(settings)]
    );
  }

  async updateRoomStatus(code: string, status: string, startedAt?: number, endedAt?: number): Promise<void> {
    await this.pool.query(
      `UPDATE rooms SET status = $1, started_at = COALESCE($2, started_at), ended_at = COALESCE($3, ended_at)
       WHERE code = $4`,
      [status, startedAt || null, endedAt || null, code]
    );
  }

  async savePlayer(roomCode: string, player: Player): Promise<void> {
    await this.pool.query(
      `INSERT INTO players (id, room_code, name, avatar, score, progress, solved_clues, incorrect_attempts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = $3, avatar = $4, score = $5, progress = $6, solved_clues = $7, incorrect_attempts = $8`,
      [
        player.id,
        roomCode,
        player.name,
        player.avatar,
        player.score,
        player.progress,
        JSON.stringify(player.solvedClues),
        player.incorrectAttempts,
      ]
    );
  }

  async updatePlayerScore(
    roomCode: string,
    playerId: string,
    score: number,
    progress: number,
    solvedClues: number[],
    completedAt?: number
  ): Promise<void> {
    await this.pool.query(
      `UPDATE players SET score = $1, progress = $2, solved_clues = $3, completed_at = COALESCE($4, completed_at)
       WHERE id = $5 AND room_code = $6`,
      [score, progress, JSON.stringify(solvedClues), completedAt || null, playerId, roomCode]
    );
  }

  async recordSubmission(
    roomCode: string,
    playerId: string,
    clueId: number,
    submittedAnswer: string,
    isCorrect: boolean,
    points: number
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO submissions (room_code, player_id, clue_id, submitted_answer, is_correct, points)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [roomCode, playerId, clueId, submittedAnswer, isCorrect, points]
    );
  }

  async saveAnalytics(report: AnalyticsReport): Promise<void> {
    await this.pool.query(
      `INSERT INTO game_analytics (room_code, report)
       VALUES ($1, $2)
       ON CONFLICT (room_code) DO UPDATE SET report = $2`,
      [report.roomCode, JSON.stringify(report)]
    );
  }

  async getAnalytics(roomCode: string): Promise<AnalyticsReport | null> {
    const res = await this.pool.query(`SELECT report FROM game_analytics WHERE room_code = $1`, [roomCode]);
    return res.rows[0]?.report || null;
  }
}

// Database factory: Attempts PostgreSQL, auto-falls back to MemoryDatabase if unreachable
let dbInstance: IDatabase;

export async function getDatabase(): Promise<IDatabase> {
  if (dbInstance) return dbInstance;

  const pgDb = new PostgresDatabase();
  try {
    await pgDb.init();
    console.log('📦 Connected to PostgreSQL storage.');
    dbInstance = pgDb;
  } catch (err: any) {
    console.log('ℹ️  PostgreSQL not actively running. Activated resilient In-Memory persistent fallback storage.');
    dbInstance = new MemoryDatabase();
  }

  return dbInstance;
}
