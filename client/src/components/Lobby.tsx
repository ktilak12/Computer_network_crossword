import React from 'react';
import { RoomState } from '../types.js';
import { Users, Play, Copy, Check, QrCode, Timer, Trophy, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface LobbyProps {
  room: RoomState;
  qrCode?: string;
  isTeacher: boolean;
  onStartGame: () => void;
  onShowQRModal: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  room,
  qrCode,
  isTeacher,
  onStartGame,
  onShowQRModal,
}) => {
  const [copied, setCopied] = React.useState(false);
  const players = Object.values(room.players);
  const joinUrl = `${window.location.origin}/join/${room.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    sound.playSpeedBonus();
    onStartGame();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pop-in">
      {/* Hero Waiting Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden text-center shadow-2xl">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>CLASSROOM BATTLE LOBBY</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 tracking-tight font-sans">
          {room.settings.roomName}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto mt-2">
          Real-time multiplayer 20-question Computer Networks crossword competition.
        </p>

        {/* Room Code Showcase */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="px-6 py-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 hud-glow-cyan">
            <span className="text-[11px] font-mono uppercase text-slate-400 block tracking-widest">
              ROOM CODE
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-cyan-400">
              {room.code}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'LINK COPIED' : 'COPY JOIN LINK'}</span>
            </button>

            <button
              onClick={onShowQRModal}
              className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <QrCode className="w-4 h-4 text-violet-400" />
              <span>SHOW QR CODE</span>
            </button>
          </div>
        </div>

        {/* Settings Pill Row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
            <Timer className="w-4 h-4 text-amber-400" />
            <span>Duration: {room.settings.durationMinutes} Minutes</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>+{room.settings.pointsPerWord} Pts / Word</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>+{room.settings.completionBonus} Pts Bonus</span>
          </div>
        </div>
      </div>

      {/* Participants Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                Connected Students
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {players.length} / 60 Racers ready in lobby
              </p>
            </div>
          </div>

          {/* Teacher Launch Button OR Student Waiting Pulse */}
          {isTeacher ? (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START RACE</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Waiting for teacher to start...</span>
            </div>
          )}
        </div>

        {/* Players Avatar Grid */}
        {players.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-mono text-slate-400">
              No students have joined yet.
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Ask students to scan the QR code or go to {joinUrl}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 border border-white/5 hover:border-cyan-500/30 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                  {p.avatar || '🧑‍💻'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                    <span>Ready</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
