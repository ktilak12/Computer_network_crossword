import React from 'react';
import { RoomState } from '../types.js';
import { Trophy, Timer, Minimize2, Users, Flame, QrCode } from 'lucide-react';

interface ProjectorViewProps {
  room: RoomState;
  qrCodeUrl?: string;
  onExitProjector: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({
  room,
  qrCodeUrl,
  onExitProjector,
}) => {
  const players = Object.values(room.players);
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.progress !== a.progress) return b.progress - a.progress;
    return (a.completedAt || Infinity) - (b.completedAt || Infinity);
  });

  const remainingTime = Math.max(0, room.timeRemaining);
  const mins = Math.floor(remainingTime / 60);
  const secs = remainingTime % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isCritical = room.timeRemaining <= 30 && room.status === 'in_progress';
  const isWarning = room.timeRemaining <= 60 && !isCritical && room.status === 'in_progress';

  return (
    <div className="fixed inset-0 z-50 bg-[#05070f] text-slate-100 flex flex-col p-6 sm:p-10 select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              CLASSROOM PROJECTOR HUD
            </span>
            <span className="text-xs font-mono text-slate-400">
              {room.status === 'in_progress' ? '🟢 RACE IN PROGRESS' : room.status.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-50 font-sans tracking-tight mt-1">
            {room.settings.roomName}
          </h1>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExitProjector}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-2 font-mono text-xs"
        >
          <Minimize2 className="w-5 h-5 text-cyan-400" />
          <span className="hidden sm:inline">EXIT FULLSCREEN</span>
        </button>
      </div>

      {/* Main Grid: Left Giant Timer & Join QR, Right Top Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto relative z-10 py-6">
        {/* Left Column: Big Timer & Join Telemetry */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-6">
          {/* Giant Countdown Instrument */}
          <div className="p-8 rounded-3xl glass-panel border border-cyan-500/30 hud-glow-cyan w-full max-w-md">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5 mb-2">
              <Timer className="w-4 h-4 text-cyan-400" />
              SESSION TIME REMAINING
            </span>
            <div
              className={`font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tight ${
                isCritical
                  ? 'text-rose-400 animate-pulse'
                  : isWarning
                  ? 'text-amber-300'
                  : 'text-cyan-300'
              }`}
            >
              {timeFormatted}
            </div>
            <p className="text-xs font-mono text-slate-400 mt-2">
              Server-Synchronized Master Clock
            </p>
          </div>

          {/* Join Badge with mini QR */}
          <div className="p-5 rounded-3xl glass-panel border border-white/10 w-full max-w-md flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                JOIN VIA PHONE
              </span>
              <span className="text-3xl font-mono font-black text-cyan-400 tracking-wider">
                {room.code}
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Scan QR or enter room code
              </p>
            </div>
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-20 h-20 rounded-xl bg-slate-950 p-1 border border-cyan-500/40"
              />
            )}
          </div>
        </div>

        {/* Right Column: Live Leaderboard Top 8 */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col max-h-[65vh] overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold font-mono text-slate-100">
                Classroom Leaderboard
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Users className="w-4 h-4 text-violet-400" />
              <span>{players.length} Students</span>
            </div>
          </div>

          {/* Roster list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
            {sortedPlayers.length === 0 ? (
              <div className="py-16 text-center text-sm font-mono text-slate-500">
                Waiting for students to join...
              </div>
            ) : (
              sortedPlayers.slice(0, 10).map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    idx === 0
                      ? 'bg-amber-500/15 border-amber-400/50 text-slate-100 hud-glow-cyan'
                      : idx === 1
                      ? 'bg-slate-800/80 border-slate-400/30 text-slate-200'
                      : idx === 2
                      ? 'bg-amber-950/40 border-amber-700/30 text-slate-200'
                      : 'bg-slate-900/60 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="text-xl select-none">{p.avatar || '🧑‍💻'}</span>
                    <div>
                      <span className="text-base font-bold text-slate-100">{p.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {p.progress}% ({p.solvedClues.length}/20)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-xl font-black text-amber-300">
                    {p.score} <span className="text-xs font-normal text-amber-400/70">PTS</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
