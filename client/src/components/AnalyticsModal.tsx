import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AnalyticsReport } from '../types.js';
import { Trophy, Download, X, AlertTriangle, Zap, Users, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface AnalyticsModalProps {
  report: AnalyticsReport;
  isOpen: boolean;
  onClose: () => void;
  onDownloadCSV: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  report,
  isOpen,
  onClose,
  onDownloadCSV,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playVictory();
      // Launch celebratory confetti fireworks
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const top3 = report.finalLeaderboard.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl animate-pop-in my-auto max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SESSION DEBRIEF & ANALYTICS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-sans tracking-tight">
            Game Completed! 🏆
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
            Room Code: <strong className="text-cyan-400">{report.roomCode}</strong>
          </p>
        </div>

        {/* Podium Display (Top 3) */}
        {top3.length === 1 && (
          <div className="flex justify-center max-w-xs mx-auto mb-8 pt-4">
            <div className="w-full flex flex-col items-center">
              <div className="text-4xl select-none mb-1 animate-bounce">{top3[0].avatar || '🧑‍💻'}</div>
              <div className="w-full p-4 rounded-2xl bg-gradient-to-b from-amber-500/25 to-yellow-600/30 border-2 border-amber-400 text-center hud-glow-cyan shadow-2xl">
                <span className="text-sm font-mono font-black text-amber-300">🥇 Winner & Champion</span>
                <div className="text-sm sm:text-base font-extrabold text-slate-50 truncate mt-0.5">
                  {top3[0].name}
                </div>
                <div className="text-sm sm:text-base font-mono text-amber-300 font-black mt-1">
                  {top3[0].score} <span className="text-[10px] font-normal">PTS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {top3.length === 2 && (
          <div className="flex justify-center gap-4 max-w-md mx-auto mb-8 pt-4 items-end">
            {/* 1st Place */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-3xl select-none mb-1 animate-bounce">{top3[0].avatar || '🧑‍💻'}</div>
              <div className="w-full p-4 rounded-2xl bg-gradient-to-b from-amber-500/25 to-yellow-600/30 border-2 border-amber-400 text-center hud-glow-cyan shadow-2xl">
                <span className="text-sm font-mono font-black text-amber-300">🥇 1st Place</span>
                <div className="text-sm sm:text-base font-extrabold text-slate-50 truncate mt-0.5">
                  {top3[0].name}
                </div>
                <div className="text-sm sm:text-base font-mono text-amber-300 font-black mt-1">
                  {top3[0].score} <span className="text-[10px] font-normal">PTS</span>
                </div>
              </div>
            </div>

            {/* 2nd Place */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-2xl select-none mb-1">{top3[1].avatar || '🧑‍💻'}</div>
              <div className="w-full p-3 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-400/30 text-center shadow-lg">
                <span className="text-xs font-mono font-bold text-slate-300">🥈 2nd</span>
                <div className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                  {top3[1].name}
                </div>
                <div className="text-xs font-mono text-amber-300 font-extrabold mt-1">
                  {top3[1].score} <span className="text-[9px] font-normal">PTS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto mb-8 pt-4 items-end">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="text-2xl select-none mb-1">{top3[1].avatar || '🧑‍💻'}</div>
              <div className="w-full p-3 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-400/30 text-center shadow-lg">
                <span className="text-xs font-mono font-bold text-slate-300">🥈 2nd</span>
                <div className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                  {top3[1].name}
                </div>
                <div className="text-xs font-mono text-amber-300 font-extrabold mt-1">
                  {top3[1].score} <span className="text-[9px] font-normal">PTS</span>
                </div>
              </div>
            </div>

            {/* 1st Place (Winner) */}
            <div className="flex flex-col items-center -translate-y-2">
              <div className="text-3xl select-none mb-1 animate-bounce">{top3[0].avatar || '🧑‍💻'}</div>
              <div className="w-full p-4 rounded-2xl bg-gradient-to-b from-amber-500/25 to-yellow-600/30 border-2 border-amber-400 text-center hud-glow-cyan shadow-2xl">
                <span className="text-sm font-mono font-black text-amber-300">🥇 1st Place</span>
                <div className="text-sm sm:text-base font-extrabold text-slate-50 truncate mt-0.5">
                  {top3[0].name}
                </div>
                <div className="text-sm sm:text-base font-mono text-amber-300 font-black mt-1">
                  {top3[0].score} <span className="text-[10px] font-normal">PTS</span>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="text-2xl select-none mb-1">{top3[2].avatar || '🧑‍💻'}</div>
              <div className="w-full p-3 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900/90 border border-amber-700/30 text-center shadow-lg">
                <span className="text-xs font-mono font-bold text-amber-600">🥉 3rd</span>
                <div className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                  {top3[2].name}
                </div>
                <div className="text-xs font-mono text-amber-300 font-extrabold mt-1">
                  {top3[2].score} <span className="text-[9px] font-normal">PTS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6 Key Analytics Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              TOTAL PARTICIPANTS
            </span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">
              {report.totalParticipants} Students
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              COMPLETION RATE
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {report.completionRate}% ({report.completedParticipants} finished)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              CLASS AVERAGE SCORE
            </span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              {report.averageScore} PTS
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-violet-400" />
              AVG COMPLETION TIME
            </span>
            <div className="text-xl font-bold font-mono text-violet-300 mt-1">
              {report.averageCompletionTimeSec}s
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              FASTEST COMPLETION
            </span>
            <div className="text-xl font-bold font-mono text-yellow-300 mt-1">
              {report.fastestCompletionTimeSec ? `${report.fastestCompletionTimeSec}s` : 'N/A'}
              <span className="text-xs text-slate-400 block font-normal">
                {report.fastestPlayerName || 'None'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-rose-400" />
              HIGHEST SCORE
            </span>
            <div className="text-xl font-bold font-mono text-rose-300 mt-1">
              {report.highestScore} PTS
              <span className="text-xs text-slate-400 block font-normal">
                {report.highestScorePlayerName || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Difficult Clues Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Most Difficult Clues (Highest Error Rates)
            </h2>
            <span className="text-xs font-mono text-slate-400">Computer Networks Concepts</span>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-slate-900/60 border border-white/5 p-3">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-2">Clue</th>
                  <th className="py-2 px-2">Concept / Answer</th>
                  <th className="py-2 px-2">Incorrect Attempts</th>
                  <th className="py-2 px-2">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.difficultClues.slice(0, 6).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-2">
                      <span className="font-bold text-cyan-400 mr-1.5">
                        {c.number} {c.direction.toUpperCase()}:
                      </span>
                      <span className="text-slate-300 font-sans">{c.clue}</span>
                    </td>
                    <td className="py-2.5 px-2 font-bold text-emerald-400">{c.answer}</td>
                    <td className="py-2.5 px-2 font-bold text-rose-400">{c.failCount} Misses</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`font-bold ${
                          c.accuracy >= 75
                            ? 'text-emerald-400'
                            : c.accuracy >= 40
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {c.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button: Download CSV Report */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onDownloadCSV}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Grade Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
