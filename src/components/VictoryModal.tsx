/**
 * QUANTUM BUNNY - Level Complete Victory Modal
 * Dynamic debrief messages, next level progression, and stats.
 */

import React from 'react';
import { Trophy, Clock, CheckCircle2, RotateCcw, FlaskConical, ArrowRight } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  levelNumber: number;
  levelName: string;
  levelSubtitle: string;
  timeLeft: number;
  scannersUsed: number;
  debrief?: {
    title: string;
    lines: string[];
  };
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onOpenLab: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  levelNumber,
  levelName,
  levelSubtitle,
  timeLeft,
  scannersUsed,
  debrief,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onOpenLab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans-game">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100">
        
        {/* Banner */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/60 to-slate-900 text-center border-b border-emerald-500/20">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 mb-3 shadow-lg shadow-emerald-500/10">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-arcade text-emerald-400 tracking-wider">
            {hasNextLevel ? `${levelName} COMPLETE!` : 'ALL 5 LEVELS COMPLETE!'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {levelSubtitle} · Quantum Barriers Cleared · Carrot Secured!
          </p>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Time Remaining</span>
              </div>
              <div className="text-xl font-bold font-mono-game text-amber-400">
                {Math.ceil(timeLeft)}s
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scanners Used</span>
              </div>
              <div className="text-xl font-bold font-mono-game text-cyan-400">
                {scannersUsed}
              </div>
            </div>
          </div>

          {/* Educational Debrief */}
          {debrief && (
            <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-xs leading-relaxed text-slate-300">
              <div className="font-bold text-emerald-400 uppercase tracking-wide font-arcade text-[10px]">
                {debrief.title}
              </div>
              {debrief.lines.map((line, idx) => (
                <p key={idx} className={idx === 0 ? 'text-slate-200 font-semibold' : 'text-slate-400 text-[11px]'}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {hasNextLevel ? (
              <button
                onClick={onNextLevel}
                autoFocus
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
              >
                <span>NEXT LEVEL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onRestart}
                autoFocus
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY FROM START</span>
              </button>
            )}

            <button
              onClick={onRestart}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REPLAY [R]</span>
            </button>

            <button
              onClick={onOpenLab}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              <span>LAB</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
