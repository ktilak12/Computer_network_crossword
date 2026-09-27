import { GameSettings, RoomDetailsResponse, SubmissionResult, AnalyticsReport } from '../types.js';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');
const API_BASE = `${SERVER_URL}/api`;

export const api = {
  // Create room
  async createRoom(settings: Partial<GameSettings>): Promise<{ code: string; qrCode: string; state: any }> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, hostUrl: window.location.origin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create game room');
    }
    return res.json();
  },

  // Get room & public grid
  async getRoom(code: string): Promise<RoomDetailsResponse> {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load room details');
    }
    return res.json();
  },

  // Join room
  async joinRoom(code: string, name: string, avatar: string, playerId?: string) {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar, playerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to join game room');
    }
    return res.json();
  },

  // Submit word
  async submitAnswer(code: string, playerId: string, clueId: number, answer: string): Promise<SubmissionResult> {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, clueId, answer }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit answer');
    }
    return res.json();
  },

  // Teacher Controls
  async startGame(code: string) {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/start`, { method: 'POST' });
    return res.json();
  },

  async pauseGame(code: string) {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/pause`, { method: 'POST' });
    return res.json();
  },

  async resumeGame(code: string) {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/resume`, { method: 'POST' });
    return res.json();
  },

  async endGame(code: string): Promise<{ success: boolean; report: AnalyticsReport }> {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/end`, { method: 'POST' });
    return res.json();
  },

  async kickPlayer(code: string, playerId: string) {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/kick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(code: string): Promise<AnalyticsReport> {
    const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}/analytics`);
    return res.json();
  },

  // Export CSV URL
  getExportCSVUrl(code: string): string {
    return `${API_BASE}/rooms/${code.toUpperCase()}/export-csv`;
  },
};
