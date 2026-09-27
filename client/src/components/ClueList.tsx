import React, { useState } from 'react';
import { CluePublic, Direction } from '../types.js';
import { CheckCircle2, Search, ArrowRight, ArrowDown } from 'lucide-react';

interface ClueListProps {
  clues: CluePublic[];
  solvedClues: number[];
  activeClueId: number | null;
  onSelectClue: (clue: CluePublic) => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  clues,
  solvedClues,
  activeClueId,
  onSelectClue,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'both' | 'across' | 'down'>('both');

  const acrossClues = clues.filter((c) => c.direction === 'across');
  const downClues = clues.filter((c) => c.direction === 'down');

  const filterClues = (list: CluePublic[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.clue.toLowerCase().includes(q) ||
        String(c.number).includes(q) ||
        c.direction.toLowerCase().includes(q)
    );
  };

  const renderClueItem = (clue: CluePublic) => {
    const isSolved = solvedClues.includes(clue.id);
    const isActive = activeClueId === clue.id;

    return (
      <div
        key={clue.id}
        onClick={() => onSelectClue(clue)}
        className={`group relative p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
          isActive
            ? 'bg-cyan-950/60 border-cyan-400/60 text-cyan-200 hud-glow-cyan scale-[1.01]'
            : isSolved
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300/80 hover:bg-emerald-950/60'
            : 'bg-slate-900/60 border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {/* Clue Number Badge */}
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
              isActive
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : isSolved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 group-hover:text-cyan-300'
            }`}
          >
            {clue.number}
          </span>

          <div className="flex-1 min-w-0">
            <p className={`text-xs sm:text-sm leading-relaxed ${isSolved ? 'line-through text-slate-400' : ''}`}>
              {clue.clue}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                {clue.length} LETTERS
              </span>
              {isSolved && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> SOLVED
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col h-full max-h-[600px] overflow-hidden">
      {/* Header & Search */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Clue Panel
          </h2>
          <span className="text-xs font-mono text-cyan-400">
            {solvedClues.length} / {clues.length} Solved
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clue, concept, or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 focus:border-cyan-500/50 focus:outline-none text-xs text-slate-200 placeholder-slate-500 font-sans"
          />
        </div>

        {/* Tab Filters on mobile */}
        <div className="flex sm:hidden gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/5">
          <button
            onClick={() => setActiveTab('both')}
            className={`flex-1 py-1 rounded-lg text-xs font-mono ${
              activeTab === 'both' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('across')}
            className={`flex-1 py-1 rounded-lg text-xs font-mono ${
              activeTab === 'across' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Across ({acrossClues.length})
          </button>
          <button
            onClick={() => setActiveTab('down')}
            className={`flex-1 py-1 rounded-lg text-xs font-mono ${
              activeTab === 'down' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Down ({downClues.length})
          </button>
        </div>
      </div>

      {/* Clues Lists */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {/* Across Section */}
        {(activeTab === 'both' || activeTab === 'across') && (
          <div>
            <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md py-1 mb-2 flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Across Clues ({filterClues(acrossClues).length})</span>
            </div>
            <div className="space-y-1.5">
              {filterClues(acrossClues).map(renderClueItem)}
            </div>
          </div>
        )}

        {/* Down Section */}
        {(activeTab === 'both' || activeTab === 'down') && (
          <div>
            <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md py-1 mb-2 flex items-center gap-1.5 text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Down Clues ({filterClues(downClues).length})</span>
            </div>
            <div className="space-y-1.5">
              {filterClues(downClues).map(renderClueItem)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
