/**
 * QUANTUM BUNNY - Level Failed (Time Over) Modal
 * Fast, responsive retry with keyboard support.
 */

import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans-game">
      <div className="bg-slate-900 border border-rose-500/50 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-100 text-center p-6 space-y-5">
        
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-lg shadow-rose-500/10">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-arcade text-rose-400 tracking-wider">
            LEVEL FAILED
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Time limit expired before securing the carrot.
          </p>
        </div>

        <button
          onClick={onRestart}
          autoFocus
          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          RETRY LEVEL [R]
        </button>

      </div>
    </div>
  );
};
