import React, { useState } from 'react';
import { RoomState, Player } from '../types.js';
import {
  Play,
  Pause,
  StopCircle,
  QrCode,
  Download,
  Users,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Search,
  Maximize2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/sound.js';

interface TeacherDashboardProps {
  room: RoomState;
  onStartGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  onEndGame: () => void;
  onKickPlayer: (playerId: string) => void;
  onShowQRModal: () => void;
  onShowAnalytics: () => void;
  onExportCSV: () => void;
  onToggleProjector: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  room,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onEndGame,
  onKickPlayer,
  onShowQRModal,
  onShowAnalytics,
  onExportCSV,
  onToggleProjector,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'progress' | 'name'>('score');

  const players = Object.values(room.players);
  const totalCount = players.length;
  const completedCount = players.filter((p) => p.progress === 100).length;
  const avgScore = totalCount > 0 ? Math.round(players.reduce((sum, p) => sum + p.score, 0) / totalCount) : 0;
  const avgProgress = totalCount > 0 ? Math.round(players.reduce((sum, p) => sum + p.progress, 0) / totalCount) : 0;

  // Filter & sort
  const filteredPlayers = players
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'progress') return b.progress - a.progress;
      return a.name.localeCompare(b.name);
    });

  // Timer format
  const remainingTime = Math.max(0, room.timeRemaining);
  const mins = Math.floor(remainingTime / 60);
  const secs = remainingTime % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Top HUD: Teacher Control Panel */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Room Summary & Status */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                TEACHER COMMAND COCKPIT
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  room.status === 'in_progress'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : room.status === 'paused'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : room.status === 'ended'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {room.status === 'in_progress' ? '🟢 LIVE RACE' : room.status.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-sans tracking-tight">
              {room.settings.roomName}
            </h1>

            {/* Timer countdown readout */}
            <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-200">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-lg font-mono text-cyan-300">{timeFormatted}</span>
              </div>
              <span>•</span>
              <span>Room: <strong className="text-cyan-400">{room.code}</strong></span>
              <span>•</span>
              <span>Max: 60 Students</span>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Start / Resume */}
            {room.status === 'lobby' && (
              <button
                onClick={() => {
                  sound.playSpeedBonus();
                  onStartGame();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Game</span>
              </button>
            )}

            {room.status === 'in_progress' && (
              <button
                onClick={onPauseGame}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            {room.status === 'paused' && (
              <button
                onClick={onResumeGame}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
            )}

            {/* End Game */}
            {room.status !== 'ended' && room.status !== 'lobby' && (
              <button
                onClick={() => {
                  sound.playVictory();
                  onEndGame();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <StopCircle className="w-4 h-4" />
                <span>End Game</span>
              </button>
            )}

            {/* Show QR Modal */}
            <button
              onClick={onShowQRModal}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-mono text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <QrCode className="w-4 h-4 text-violet-400" />
              <span>QR Code</span>
            </button>

            {/* Projector Mode */}
            <button
              onClick={onToggleProjector}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-mono text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>Projector</span>
            </button>

            {/* Analytics Modal */}
            <button
              onClick={onShowAnalytics}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-mono text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              STUDENTS
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 mt-1">
              {totalCount} <span className="text-xs font-normal text-slate-400">/ 60</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              AVG SCORE
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-1">
              {avgScore} <span className="text-xs font-normal text-amber-400/70">PTS</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              AVG PROGRESS
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 mt-1">
              {avgProgress}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" />
              FINISHED PUZZLES
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-violet-300 mt-1">
              {completedCount} <span className="text-xs font-normal text-slate-400">Finishes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Student Monitoring Matrix */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
        {/* Table Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Classroom Live Monitoring
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Live tracking individual student telemetry and progress
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Sort Switcher */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="score">Sort by Score</option>
              <option value="progress">Sort by Progress</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Monitoring Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Rank & Student</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Words Solved</th>
                <th className="py-2.5 px-3">Misses</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No students currently matched.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Rank & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-300 flex-shrink-0">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <span className="text-base select-none">{p.avatar || '🧑‍💻'}</span>
                        <span className="font-sans font-semibold text-slate-200 text-sm truncate max-w-[140px] sm:max-w-none">
                          {p.name}
                        </span>
                        {p.progress === 100 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            FINISHED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Online status */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-white/5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-rose-500'
                          }`}
                        />
                        <span className={p.isOnline ? 'text-emerald-300' : 'text-rose-400'}>
                          {p.isOnline ? 'Active' : 'Offline'}
                        </span>
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-slate-200 font-bold">{p.progress}%</span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 font-bold text-amber-300 text-sm">
                      {p.score} PTS
                    </td>

                    {/* Words Solved */}
                    <td className="py-3 px-3 text-slate-300">
                      <span className="text-emerald-400 font-bold">{p.solvedClues.length}</span> / 20
                    </td>

                    {/* Incorrect */}
                    <td className="py-3 px-3 text-slate-400">
                      {p.incorrectAttempts > 0 ? (
                        <span className="text-rose-400 font-bold">{p.incorrectAttempts}</span>
                      ) : (
                        '0'
                      )}
                    </td>

                    {/* Kick Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onKickPlayer(p.id)}
                        title="Remove student from classroom"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
