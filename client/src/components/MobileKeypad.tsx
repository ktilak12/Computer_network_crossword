import React from 'react';
import { Delete, CornerDownLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface MobileKeypadProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  onToggleDirection: () => void;
  onNextWord: () => void;
  activeDirection: 'across' | 'down';
}

export const MobileKeypad: React.FC<MobileKeypadProps> = ({
  onKeyPress,
  onBackspace,
  onSubmit,
  onToggleDirection,
  onNextWord,
  activeDirection,
}) => {
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const handleKey = (char: string) => {
    sound.playClick();
    onKeyPress(char);
  };

  const handleBack = () => {
    sound.playClick();
    onBackspace();
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-2 sm:p-3 border border-white/10 mt-3 select-none">
      {/* Control row */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <button
          onClick={() => {
            sound.playClick();
            onToggleDirection();
          }}
          className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Dir: {activeDirection.toUpperCase()}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onNextWord();
          }}
          className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 font-mono text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <span>Next Word</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onSubmit();
          }}
          className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
        >
          <CornerDownLeft className="w-3 h-3" />
          <span>Submit</span>
        </button>
      </div>

      {/* Row 1 */}
      <div className="flex justify-center gap-1 mb-1">
        {row1.map((char) => (
          <button
            key={char}
            onClick={() => handleKey(char)}
            className="flex-1 h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-mono font-bold text-sm active:bg-cyan-500 active:text-slate-950 transition-colors shadow-sm"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 mb-1 px-2">
        {row2.map((char) => (
          <button
            key={char}
            onClick={() => handleKey(char)}
            className="flex-1 h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-mono font-bold text-sm active:bg-cyan-500 active:text-slate-950 transition-colors shadow-sm"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1">
        <button
          onClick={handleBack}
          className="w-12 h-10 rounded-lg bg-slate-900/90 text-rose-400 font-mono flex items-center justify-center active:bg-rose-500 active:text-slate-950 transition-colors border border-rose-500/20"
        >
          <Delete className="w-4 h-4" />
        </button>

        {row3.map((char) => (
          <button
            key={char}
            onClick={() => handleKey(char)}
            className="flex-1 h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-mono font-bold text-sm active:bg-cyan-500 active:text-slate-950 transition-colors shadow-sm"
          >
            {char}
          </button>
        ))}

        <button
          onClick={() => {
            sound.playClick();
            onSubmit();
          }}
          className="w-12 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono flex items-center justify-center active:bg-emerald-400 active:text-slate-950 transition-colors border border-emerald-500/30"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
