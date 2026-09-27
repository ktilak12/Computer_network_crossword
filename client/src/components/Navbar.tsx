import React from 'react';
import { Network, Volume2, VolumeX, Maximize2, Minimize2, Copy, Check, Users, Shield } from 'lucide-react';
import { RoomState } from '../types.js';
import { sound } from '../utils/sound.js';

interface NavbarProps {
  room?: RoomState;
  role: 'teacher' | 'student';
  isOnline: boolean;
  onToggleRole?: () => void;
  isProjectorMode?: boolean;
  onToggleProjector?: () => void;
  onLeaveRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  room,
  role,
  isOnline,
  onToggleRole,
  isProjectorMode,
  onToggleProjector,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(sound.isSoundEnabled());

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/30 border border-cyan-500/30 text-cyan-400 hud-glow-cyan">
            <Network className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#05070f] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#05070f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-lg sm:text-xl font-sans">
                NETCROSSWORD
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Real-Time Computer Networks Multiplayer Arena
            </p>
          </div>
        </div>

        {/* Room Telemetry */}
        {room && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Room Code Badge */}
            <button
              onClick={handleCopyCode}
              title="Click to copy room code"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 transition-all hover:scale-105 active:scale-95 group"
            >
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">ROOM</span>
              <span className="font-mono font-bold text-cyan-400 tracking-wider text-sm sm:text-base">
                {room.code}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
              )}
            </button>

            {/* Students Connected Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-mono text-slate-300">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <span>{Object.keys(room.players).length} / 60</span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                }`}
              />
              <span className="text-[11px] text-slate-300 uppercase tracking-wider hidden sm:inline">
                {isOnline ? 'ONLINE' : 'SYNCING'}
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Projector Mode toggle (for teacher) */}
          {role === 'teacher' && onToggleProjector && (
            <button
              onClick={onToggleProjector}
              title={isProjectorMode ? 'Exit Projector View' : 'Classroom Projector Mode'}
              className={`p-2 rounded-xl border transition-all ${
                isProjectorMode
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900/60 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-cyan-300'
              }`}
            >
              {isProjectorMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Leave / Exit Room Button */}
          {room && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              title="Leave Room"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 font-mono text-xs transition-all"
            >
              Exit
            </button>
          )}

          {/* Role badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-900/40 to-cyan-900/40 border border-violet-500/30 text-xs font-semibold text-violet-300">
            <Shield className="w-3.5 h-3.5 text-violet-400" />
            <span className="capitalize text-[11px] tracking-wider">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
