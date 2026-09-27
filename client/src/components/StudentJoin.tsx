import React, { useState } from 'react';
import { Network, ArrowRight, User, Shield, Sparkles, School, Camera, Check, QrCode } from 'lucide-react';
import { sound } from '../utils/sound.js';
import { QRScannerModal } from './QRScannerModal.js';

interface StudentJoinProps {
  initialRoomCode?: string;
  onJoin: (roomCode: string, name: string, avatar: string) => Promise<void>;
  onCreateRoomAsTeacher: () => void;
  isLoading?: boolean;
}

const AVATARS = ['🧑‍💻', '🚀', '⚡', '🧠', '👾', '🛡️', '🌐', '🏎️', '🛰️', '💎'];

export const StudentJoin: React.FC<StudentJoinProps> = ({
  initialRoomCode = '',
  onJoin,
  onCreateRoomAsTeacher,
  isLoading = false,
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode.toUpperCase());
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧑‍💻');
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  React.useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a room code.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your student name.');
      return;
    }

    setError(null);
    try {
      sound.playClick();
      await onJoin(roomCode.trim().toUpperCase(), name.trim(), avatar);
    } catch (err: any) {
      setError(err.message || 'Could not join room.');
    }
  };

  return (
    <div className="max-w-md mx-auto pt-6 sm:pt-12 animate-pop-in">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-violet-600/35 border border-cyan-500/30 text-cyan-400 hud-glow-cyan mb-3">
            <Network className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 font-sans tracking-tight">
            NetCrossword Live
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Join the Computer Networks Classroom Race
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Room Code
              </label>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsScannerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 font-mono text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scan QR Code</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. NET42X"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setScannedSuccess(false);
                }}
                maxLength={10}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 font-mono font-bold tracking-widest text-center text-lg placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 uppercase"
                required
              />
              {scannedSuccess && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-400 text-xs font-mono bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                  <span>Scanned!</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter your name (e.g. Rahul, Priya)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={25}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                required
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2 justify-center p-2 rounded-2xl bg-slate-900/60 border border-white/5">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    sound.playClick();
                    setAvatar(av);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    avatar === av
                      ? 'bg-cyan-500/30 border-2 border-cyan-400 scale-110 shadow-md hud-glow-cyan'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border border-white/5'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-mono text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <span>Connecting to cockpit...</span>
            ) : (
              <>
                <span>Enter Waiting Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#0d111e] text-[11px] font-mono text-slate-500 uppercase tracking-widest">
            Educator Hub
          </span>
        </div>

        {/* Teacher Launch Button */}
        <button
          type="button"
          onClick={onCreateRoomAsTeacher}
          className="w-full py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-violet-500/30 text-violet-300 hover:text-violet-200 font-mono text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <School className="w-4 h-4 text-violet-400" />
          <span>Create New Room as Teacher</span>
        </button>
      </div>

      {/* In-App QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedCode) => {
          setRoomCode(scannedCode);
          setScannedSuccess(true);
          setIsScannerOpen(false);
        }}
      />
    </div>
  );
};
