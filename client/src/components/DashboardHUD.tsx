import React from 'react';
import { Timer, Trophy, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Player } from '../types.js';

interface DashboardHUDProps {
  timeRemaining: number;
  totalDuration: number;
  player?: Player;
  totalWords: number;
  rank?: number;
  totalPlayers?: number;
  gameStatus: string;
}

export const DashboardHUD: React.FC<DashboardHUDProps> = ({
  timeRemaining,
  totalDuration,
  player,
  totalWords,
  rank,
  totalPlayers,
  gameStatus,
}) => {
  // Format MM:SS
  const minutes = Math.floor(Math.max(0, timeRemaining) / 60);
  const seconds = Math.max(0, timeRemaining) % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Timer percentage for gauge
  const progressRatio = totalDuration > 0 ? Math.max(0, Math.min(1, timeRemaining / totalDuration)) : 1;
  const strokeDashoffset = 283 * (1 - progressRatio); // circumference of r=45 is 2*PI*45 ≈ 282.7

  // Alert level
  const isCritical = timeRemaining <= 30 && gameStatus === 'in_progress';
  const isWarning = timeRemaining <= 60 && !isCritical && gameStatus === 'in_progress';

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div
        className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isCritical ? 'bg-rose-500/25' : isWarning ? 'bg-amber-500/20' : 'bg-cyan-500/15'
        }`}
      />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        {/* Speedometer Gauge: Server-Synchronized Timer */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                fill="transparent"
                className="text-slate-800/80"
              />
              {/* Animated Progress Gauge */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 * (1 - progressRatio)}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-1000 ease-linear ${
                  isCritical
                    ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : isWarning
                    ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                    : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer
                className={`w-5 h-5 ${
                  isCritical
                    ? 'text-rose-400 animate-bounce'
                    : isWarning
                    ? 'text-amber-400 animate-pulse'
                    : 'text-cyan-400'
                }`}
              />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              TIME REMAINING
            </span>
            <div
              className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isCritical
                  ? 'text-rose-400 animate-pulse'
                  : isWarning
                  ? 'text-amber-300'
                  : 'text-slate-100'
              }`}
            >
              {timeFormatted}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {gameStatus === 'in_progress' ? '🟢 SERVER SYNCED' : gameStatus === 'paused' ? '⏸️ PAUSED' : '🏁 LOCKED'}
            </div>
          </div>
        </div>

        {/* Telemetry Meter: Live Score */}
        <div className="flex items-center gap-3.5 border-l border-white/10 pl-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              TOTAL SCORE
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              {String(player?.score ?? 0).padStart(4, '0')}
              <span className="text-xs font-normal text-amber-400/80 ml-1">PTS</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Speed bonus active</span>
            </div>
          </div>
        </div>

        {/* Telemetry Dial: Rank & Position */}
        <div className="flex items-center gap-3.5 border-l border-white/10 pl-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/25 to-indigo-700/30 border border-violet-500/30 flex items-center justify-center text-violet-300 flex-shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <span className="font-mono font-black text-lg">
              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank || '-'}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              CLASS POSITION
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-violet-300">
              #{rank || 1}
              <span className="text-xs font-normal text-slate-400 ml-1">/ {totalPlayers || 1}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {rank && rank <= 3 ? '🏆 TOP RUNNER' : '🚀 IN RACING PACK'}
            </div>
          </div>
        </div>

        {/* Telemetry Progress Bar: Fuel / Progress Gauge */}
        <div className="border-l border-white/10 pl-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              PUZZLE SOLVED
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {player?.progress ?? 0}%
            </span>
          </div>
          {/* Gauge bar */}
          <div className="w-full h-3 rounded-full bg-slate-800/90 border border-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-500"
              style={{ width: `${player?.progress ?? 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              {player?.solvedClues.length ?? 0} / {totalWords} Words
            </span>
            {player?.incorrectAttempts ? (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="w-3 h-3" />
                {player.incorrectAttempts} Misses
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
