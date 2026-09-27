import React, { useState } from 'react';
import { GameSettings } from '../types.js';
import { X, Sparkles, Timer, Trophy, ShieldCheck, ArrowRight } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (settings: Partial<GameSettings>) => Promise<void>;
  isLoading?: boolean;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}) => {
  const [roomName, setRoomName] = useState('Computer Networks Arena');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [pointsPerWord, setPointsPerWord] = useState(100);
  const [speedBonus, setSpeedBonus] = useState(25);
  const [completionBonus, setCompletionBonus] = useState(500);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      roomName,
      durationMinutes,
      pointsPerWord,
      speedBonus,
      completionBonus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl animate-pop-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>NEW GAME SESSION</span>
        </div>

        <h2 className="text-2xl font-black text-slate-100 font-sans tracking-tight">
          Create Crossword Arena
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1 mb-6">
          Configure real-time multiplayer parameters for up to 60 students
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Game Title */}
          <div>
            <label className="block text-slate-400 uppercase tracking-wider mb-1.5">
              Room / Game Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 font-sans text-sm focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              Duration ({durationMinutes} Minutes)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-xl border transition-all ${
                    durationMinutes === mins
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold hud-glow-cyan'
                      : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Scoring Rules Row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                Points / Word
              </label>
              <input
                type="number"
                value={pointsPerWord}
                onChange={(e) => setPointsPerWord(Number(e.target.value))}
                min={10}
                max={500}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                Speed Bonus
              </label>
              <input
                type="number"
                value={speedBonus}
                onChange={(e) => setSpeedBonus(Number(e.target.value))}
                min={0}
                max={200}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                Finish Bonus
              </label>
              <input
                type="number"
                value={completionBonus}
                onChange={(e) => setCompletionBonus(Number(e.target.value))}
                min={0}
                max={1000}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 text-center font-bold"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Generating Cockpit Room...</span>
              ) : (
                <>
                  <span>Create Live Classroom Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
