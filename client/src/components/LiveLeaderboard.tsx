import React from 'react';
import { Player } from '../types.js';
import { Trophy, Medal, Flame } from 'lucide-react';

interface LiveLeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  maxDisplay?: number;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  players,
  currentPlayerId,
  maxDisplay = 15,
}) => {
  // Sort players by score, then progress, then completedAt
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.progress !== a.progress) return b.progress - a.progress;
    return (a.completedAt || Infinity) - (b.completedAt || Infinity);
  });

  const displayList = sorted.slice(0, maxDisplay);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col h-full max-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 font-mono">
              Live Standings
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              {players.length} Active Racers
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
          Live Real-Time
        </span>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {displayList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No participants yet. Share room code to begin!
          </div>
        ) : (
          displayList.map((player, idx) => {
            const rank = idx + 1;
            const isMe = player.id === currentPlayerId;
            const isTop3 = rank <= 3;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                  isMe
                    ? 'bg-cyan-950/70 border-cyan-400/70 text-cyan-100 hud-glow-cyan scale-[1.01]'
                    : isTop3
                    ? 'bg-slate-900/80 border-amber-500/30 text-slate-200'
                    : 'bg-slate-900/50 border-white/5 text-slate-300'
                }`}
              >
                {/* Rank & Student Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs flex-shrink-0 ${
                      rank === 1
                        ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                        : rank === 2
                        ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950'
                        : rank === 3
                        ? 'bg-gradient-to-br from-amber-700 to-yellow-800 text-amber-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base select-none">{player.avatar || '🧑‍💻'}</span>
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isMe ? 'text-cyan-300 font-bold' : 'text-slate-200'
                        }`}
                      >
                        {player.name} {isMe && '(You)'}
                      </span>
                    </div>

                    {/* Progress Bar under name */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${player.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {player.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Finished Badge */}
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-mono font-extrabold text-sm sm:text-base text-amber-300">
                    {player.score}
                    <span className="text-[10px] font-normal text-amber-400/70 ml-0.5">PTS</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-end gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        player.isOnline ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span>{player.solvedClues.length}/20</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
