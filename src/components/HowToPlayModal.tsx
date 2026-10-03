/**
 * QUANTUM BUNNY - How to Play Guide Modal
 */

import React from 'react';
import { X, Key, Zap, CheckCircle2, AlertTriangle, Compass } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans-game">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-arcade text-yellow-400 tracking-wide">
                MISSION BRIEFING
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Quantum Basis Switching & Measurement Rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Controls */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-arcade flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Controls
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                <div className="font-arcade text-cyan-400 text-sm mb-1">[A] / [D]</div>
                <div className="text-slate-400">Move Left / Right</div>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                <div className="font-arcade text-cyan-400 text-sm mb-1">[SPACE] / [W]</div>
                <div className="text-slate-400">Jump</div>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                <div className="font-arcade text-yellow-400 text-sm mb-1">[E]</div>
                <div className="text-slate-400">Use H/T Scanner</div>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                <div className="font-arcade text-rose-400 text-sm mb-1">[Q]</div>
                <div className="text-slate-400">Use R/B Scanner</div>
              </div>
            </div>
          </div>

          {/* Core Concept: Basis Switching */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-arcade flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              The Quantum Mechanic
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The level gate starts locked in the <strong className="text-yellow-400">HEADS (0°)</strong> state.
              Because <strong className="text-yellow-400">HEADS</strong> and <strong className="text-rose-400">RED</strong> are <strong className="text-rose-400">CLOSED</strong> barriers, you must transform the gate into either <strong className="text-emerald-400">TAILS (90°)</strong> or <strong className="text-cyan-400">BLUE (135°)</strong> to open it!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded bg-slate-900 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="font-bold text-yellow-400 text-xs">Yellow H/T Scanner (0°)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Measures along the 0° axis. If you scan a HEADS gate with this, you get <strong className="text-yellow-300">100% HEADS</strong>! Same question = same answer. It will never open directly with H/T.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900 border border-rose-500/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="font-bold text-rose-400 text-xs">Red R/B Scanner (45°)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Measures along the 45° diagonal axis. By switching basis, you force the HEADS state into a <strong className="text-rose-300">50% RED / 50% BLUE</strong> superposition! If it collapses to BLUE, the gate opens instantly!
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Tip */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 block mb-0.5">Exploration Strategy:</strong>
              Don't rush straight to the gate! Explore high up on the platforms to find the rare <strong className="text-rose-400">R/B Scanner</strong>. Scanners are consumable items, so plan your path carefully.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Got It, Let's Play!
          </button>
        </div>

      </div>
    </div>
  );
};
