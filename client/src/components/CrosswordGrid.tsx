import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GridCell, CluePublic, Direction } from '../types.js';
import { sound } from '../utils/sound.js';
import { Lock, Keyboard, RotateCcw, Maximize2, Minimize2, ChevronLeft, ChevronRight, CornerDownLeft } from 'lucide-react';

interface CrosswordGridProps {
  gridCells: GridCell[][];
  clues: CluePublic[];
  userLetters: Record<string, string>; // "r_c" -> letter
  solvedClues: number[];
  activeCell: { row: number; col: number } | null;
  activeDirection: Direction;
  onSelectCell: (row: number, col: number) => void;
  onLetterChange: (row: number, col: number, letter: string) => void;
  onToggleDirection: () => void;
  onSubmitWord: (clueId: number, word: string) => void;
  shakeClueId: number | null;
  floatingPoints: Array<{ id: string; text: string; row: number; col: number; isBonus?: boolean }>;
  onNextWord?: () => void;
  onPrevWord?: () => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  gridCells,
  clues,
  userLetters,
  solvedClues,
  activeCell,
  activeDirection,
  onSelectCell,
  onLetterChange,
  onToggleDirection,
  onSubmitWord,
  shakeClueId,
  floatingPoints,
  onNextWord,
  onPrevWord,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [isCompactFit, setIsCompactFit] = useState(false);

  // Find active clue based on activeCell & activeDirection
  const activeClue = React.useMemo(() => {
    if (!activeCell) return null;
    const cell = gridCells[activeCell.row]?.[activeCell.col];
    if (!cell || !cell.isPlayable) return null;

    const clueId = activeDirection === 'across' ? cell.acrossClueId : cell.downClueId;
    return clues.find((c) => c.id === clueId) || null;
  }, [activeCell, activeDirection, clues, gridCells]);

  // Cells belonging to active clue
  const activeWordCells = React.useMemo(() => {
    if (!activeClue) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < activeClue.length; i++) {
      const r = activeClue.row + (activeClue.direction === 'down' ? i : 0);
      const c = activeClue.col + (activeClue.direction === 'across' ? i : 0);
      set.add(`${r}_${c}`);
    }
    return set;
  }, [activeClue]);

  // Is clue solved?
  const isClueSolved = (clueId?: number) => {
    return clueId ? solvedClues.includes(clueId) : false;
  };

  // Check if a cell is locked because it belongs to an already solved clue
  const isCellLocked = useCallback(
    (r: number, c: number) => {
      const cell = gridCells[r]?.[c];
      if (!cell || !cell.isPlayable) return false;
      return isClueSolved(cell.acrossClueId) || isClueSolved(cell.downClueId);
    },
    [gridCells, solvedClues]
  );

  // Focus proxy input to invoke native system keyboard on phones & tablets
  const focusSystemKeyboard = useCallback(() => {
    if (hiddenInputRef.current) {
      try {
        hiddenInputRef.current.focus({ preventScroll: true });
      } catch {
        hiddenInputRef.current.focus();
      }
    }
  }, []);

  // Whenever activeCell changes, ensure system keyboard remains focused
  useEffect(() => {
    if (activeCell) {
      focusSystemKeyboard();
    }
  }, [activeCell, focusSystemKeyboard]);

  // Auto-scroll grid to keep active cell visible in mobile viewport
  useEffect(() => {
    if (activeCell && !isCompactFit) {
      const key = `cell_${activeCell.row}_${activeCell.col}`;
      const el = document.getElementById(key);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCell, isCompactFit]);

  // Handle typing a character
  const handleTypeChar = useCallback(
    (char: string) => {
      if (!activeCell) return;
      const { row, col } = activeCell;
      const cell = gridCells[row]?.[col];
      if (!cell || !cell.isPlayable) return;

      sound.playClick();
      const upper = char.toUpperCase();

      if (!isCellLocked(row, col)) {
        onLetterChange(row, col, upper);
      }

      // Advance to next cell in current word
      if (activeClue) {
        const isDown = activeDirection === 'down';
        const maxR = activeClue.row + (isDown ? activeClue.length : 1);
        const maxC = activeClue.col + (isDown ? 1 : activeClue.length);

        let curR = row + (isDown ? 1 : 0);
        let curC = col + (isDown ? 0 : 1);

        while (curR < maxR && curC < maxC && gridCells[curR]?.[curC]?.isPlayable) {
          onSelectCell(curR, curC);
          if (!userLetters[`${curR}_${curC}`] || !isCellLocked(curR, curC)) {
            break;
          }
          curR += isDown ? 1 : 0;
          curC += isDown ? 0 : 1;
        }
      }
    },
    [activeCell, activeClue, activeDirection, gridCells, isCellLocked, onLetterChange, onSelectCell, userLetters]
  );

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    sound.playClick();

    if (userLetters[`${row}_${col}`] && !isCellLocked(row, col)) {
      onLetterChange(row, col, '');
    } else if (activeClue) {
      const isDown = activeDirection === 'down';
      let prevR = row - (isDown ? 1 : 0);
      let prevC = col - (isDown ? 0 : 1);

      while (prevR >= activeClue.row && prevC >= activeClue.col) {
        if (gridCells[prevR]?.[prevC]?.isPlayable) {
          onSelectCell(prevR, prevC);
          if (!isCellLocked(prevR, prevC)) {
            onLetterChange(prevR, prevC, '');
            break;
          }
        }
        prevR -= isDown ? 1 : 0;
        prevC -= isDown ? 0 : 1;
      }
    }
  }, [activeCell, activeClue, activeDirection, gridCells, isCellLocked, onLetterChange, onSelectCell, userLetters]);

  // Handle Enter / Submit word
  const handleSubmitCurrentWord = useCallback(() => {
    if (!activeClue) return;
    let wordStr = '';
    let isComplete = true;
    for (let i = 0; i < activeClue.length; i++) {
      const cr = activeClue.row + (activeClue.direction === 'down' ? i : 0);
      const cc = activeClue.col + (activeClue.direction === 'across' ? i : 0);
      const ch = userLetters[`${cr}_${cc}`]?.trim();
      if (!ch) {
        isComplete = false;
      }
      wordStr += ch || '';
    }

    if (!isComplete || wordStr.length !== activeClue.length) {
      sound.playIncorrect();
      return;
    }

    onSubmitWord(activeClue.id, wordStr.toUpperCase());
  }, [activeClue, onSubmitWord, userLetters]);

  // Handle Arrow navigation
  const handleArrowNav = useCallback(
    (key: string) => {
      if (!activeCell) return;
      let nextR = activeCell.row;
      let nextC = activeCell.col;

      if (key === 'ArrowUp') nextR -= 1;
      else if (key === 'ArrowDown') nextR += 1;
      else if (key === 'ArrowLeft') nextC -= 1;
      else if (key === 'ArrowRight') nextC += 1;
      else return;

      if (gridCells[nextR]?.[nextC]?.isPlayable) {
        onSelectCell(nextR, nextC);
      }
    },
    [activeCell, gridCells, onSelectCell]
  );

  // Global window keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return;
      if (e.target !== hiddenInputRef.current && ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleTypeChar(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitCurrentWord();
      } else if (e.key === ' ') {
        e.preventDefault();
        onToggleDirection();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleArrowNav(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, handleTypeChar, handleBackspace, handleSubmitCurrentWord, onToggleDirection, handleArrowNav]);

  return (
    <div
      ref={gridContainerRef}
      className="relative w-full max-w-full p-2 sm:p-4 rounded-2xl glass-panel border border-white/10 flex flex-col items-center select-none"
    >
      {/* Hidden Proxy Input for System Keyboard (Mobile Gboard, iOS keyboard, Desktop) */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        value=""
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            const lastChar = val.slice(-1);
            if (/^[a-zA-Z]$/.test(lastChar)) {
              handleTypeChar(lastChar);
            }
          }
          e.target.value = '';
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            e.preventDefault();
            handleBackspace();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmitCurrentWord();
          } else if (e.key === ' ') {
            e.preventDefault();
            onToggleDirection();
          }
        }}
        className="opacity-0 fixed -top-40 left-0 w-1 h-1 text-base pointer-events-none"
        aria-label="Crossword system keyboard proxy input"
      />

      {/* Floating score / bonus popups */}
      {floatingPoints.map((fp) => (
        <div
          key={fp.id}
          className={`absolute z-30 pointer-events-none font-mono font-black text-sm sm:text-base animate-float-up px-2.5 py-1 rounded-full shadow-lg ${
            fp.isBonus
              ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)]'
              : 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
          }`}
          style={{
            top: `${(fp.row / gridCells.length) * 100}%`,
            left: `${(fp.col / (gridCells[0]?.length || 1)) * 100}%`,
          }}
        >
          {fp.text}
        </div>
      ))}

      {/* Top Mobile-Friendly Active Clue Bar & Controls */}
      <div className="w-full mb-3 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Active Clue Direction & Number badge */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            {activeClue ? (
              <button
                type="button"
                onClick={onToggleDirection}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 border border-cyan-500/30 active:scale-95 transition-all flex-shrink-0"
                title="Tap to switch between Across and Down"
              >
                <span>{activeClue.number} {activeClue.direction}</span>
                <RotateCcw className="w-3 h-3 text-cyan-400" />
              </button>
            ) : (
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 font-mono text-xs">
                Tap any cell to start
              </span>
            )}

            {/* Prev / Next Word buttons */}
            {onPrevWord && onNextWord && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={onPrevWord}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
                  title="Previous Clue"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onNextWord}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all"
                  title="Next Clue"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions: Zoom / Fit toggle & Submit */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsCompactFit(!isCompactFit)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1 border border-white/10 active:scale-95 transition-all"
              title={isCompactFit ? "Switch to Zoom / Touch view" : "Fit all to screen"}
            >
              {isCompactFit ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Zoom</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Fit</span>
                </>
              )}
            </button>

            {activeClue && (
              <button
                type="button"
                onClick={handleSubmitCurrentWord}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
              >
                <span>Submit</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Clue Prompt Text */}
        {activeClue && (
          <div className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
            <span className="text-cyan-400 font-mono font-bold mr-1">[{activeClue.length} letters]:</span>
            {activeClue.clue}
          </div>
        )}
      </div>

      {/* Crossword Grid Matrix Container */}
      <div className={`w-full overflow-x-auto overflow-y-hidden pb-2 flex justify-start sm:justify-center ${isCompactFit ? 'px-0' : 'px-1'}`}>
        <div
          className={`grid ${
            isCompactFit ? 'gap-[1.5px] p-1.5 sm:p-2' : 'gap-[2px] sm:gap-[3px] p-2 sm:p-3'
          } bg-slate-950/80 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md transition-all`}
          style={{
            gridTemplateColumns: `repeat(${gridCells[0]?.length || 19}, minmax(0, 1fr))`,
          }}
        >
          {gridCells.map((rowCells, r) =>
            rowCells.map((cell, c) => {
              const key = `${r}_${c}`;
              const isPlayable = cell.isPlayable;
              const letter = userLetters[key] || '';
              const isFocused = activeCell?.row === r && activeCell?.col === c;
              const isWordActive = activeWordCells.has(key);

              const isAcrossSolved = isClueSolved(cell.acrossClueId);
              const isDownSolved = isClueSolved(cell.downClueId);
              const isSolved = isAcrossSolved || isDownSolved;

              const isShaking = shakeClueId && (cell.acrossClueId === shakeClueId || cell.downClueId === shakeClueId);

              const cellSizeClass = isCompactFit
                ? 'w-4 h-4 sm:w-5 sm:h-5 text-[9px]'
                : 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-xs sm:text-base';

              if (!isPlayable) {
                return (
                  <div
                    key={key}
                    className={`${cellSizeClass} bg-slate-950/60 rounded-sm sm:rounded-md border border-white/[0.02]`}
                  />
                );
              }

              return (
                <div
                  key={key}
                  id={`cell_${r}_${c}`}
                  onClick={() => {
                    if (isFocused) {
                      onToggleDirection();
                    } else {
                      onSelectCell(r, c);
                    }
                    focusSystemKeyboard();
                  }}
                  onTouchStart={() => {
                    focusSystemKeyboard();
                  }}
                  className={`relative ${cellSizeClass} flex items-center justify-center rounded-sm sm:rounded-md font-mono font-extrabold cursor-pointer transition-all duration-150 ${
                    isShaking ? 'animate-shake' : ''
                  } ${
                    isFocused
                      ? 'bg-cyan-500/30 text-white border-2 border-cyan-400 hud-glow-cyan z-20 scale-105 shadow-lg'
                      : isSolved
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 hud-glow-emerald font-black'
                      : isWordActive
                      ? 'bg-sky-950/70 text-sky-200 border border-sky-400/40'
                      : 'bg-slate-900/90 text-slate-100 hover:bg-slate-800/90 border border-white/10'
                  }`}
                >
                  {/* Clue Number Marker */}
                  {cell.clueNumber && (
                    <span
                      className={`absolute top-0.5 left-0.5 sm:left-1 ${
                        isCompactFit ? 'text-[6px] sm:text-[7px]' : 'text-[8px] sm:text-[9px]'
                      } font-sans font-bold leading-none ${
                        isSolved ? 'text-emerald-400' : isFocused ? 'text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      {cell.clueNumber}
                    </span>
                  )}

                  {/* Lock icon for solved cells */}
                  {isSolved && !letter && (
                    <Lock className="w-2.5 h-2.5 text-emerald-400/70 absolute bottom-0.5 right-0.5" />
                  )}

                  {/* Letter Content */}
                  <span className="select-none leading-none transform translate-y-0.5">{letter}</span>

                  {/* Active cell pulsing focus caret */}
                  {isFocused && !letter && (
                    <span className="w-1.5 h-3 sm:h-4 bg-cyan-400 rounded-sm animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Keyboard helper bar */}
      <div className="w-full mt-2 px-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-400/90">
          <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
          <span>System Keyboard Ready • Tap cell to type</span>
        </span>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            focusSystemKeyboard();
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/25 text-cyan-300 font-mono text-xs transition-colors active:scale-95"
        >
          ⌨️ Focus Keyboard
        </button>
      </div>
    </div>
  );
};
