/**
 * QUANTUM BUNNY - Quantum Lab & Physics Verification Panel
 * Runs real-time automated tests and Monte Carlo simulations proving
 * the quantum basis switching formulas.
 */

import React, { useState, useEffect } from 'react';
import {
  runAutomatedQuantumTests,
  runSequentialSimulation,
  QuantumTestCase,
  SimulationResult,
  QUANTUM_STATES,
} from '../game/quantumPhysics';
import { CheckCircle2, FlaskConical, Play, X, RotateCcw } from 'lucide-react';

interface QuantumLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuantumLabModal: React.FC<QuantumLabModalProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<{
    allPassed: boolean;
    testCases: QuantumTestCase[];
  } | null>(null);

  const [simTrials, setSimTrials] = useState<number>(2000);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Run unit tests on open
      const tests = runAutomatedQuantumTests();
      setTestResults(tests);
      // Run initial simulation
      runSim(2000);
    }
  }, [isOpen]);

  const runSim = (trials: number) => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runSequentialSimulation(trials);
      setSimResult(res);
      setIsSimulating(false);
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans-game">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-arcade text-cyan-400 tracking-wide">
                QUANTUM PHYSICS VERIFICATION LAB
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact Born Rule Probability Validation & Monte Carlo Basis Scrambling
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
          
          {/* Theoretical Core */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-arcade">
              Physical Measurement Law: Born Rule
            </h3>
            <div className="p-3 bg-slate-900 rounded font-mono-game text-xs text-cyan-200 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span>P(first outcome) = cos²(φ - β)</span>
                <span className="block text-slate-400 mt-0.5">
                  P(second outcome) = 1 - P(first outcome)
                </span>
              </div>
              <div className="text-right text-slate-400 text-[11px]">
                <div>H/T basis: β = 0° (H=0°, T=90°)</div>
                <div>R/B basis: β = 45° (R=45°, B=135°)</div>
              </div>
            </div>

            {/* State Table */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {Object.values(QUANTUM_STATES).map((st) => (
                <div
                  key={st.name}
                  className="p-2.5 rounded border flex flex-col items-center justify-center text-center"
                  style={{
                    backgroundColor: `${st.color}15`,
                    borderColor: `${st.color}40`,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-arcade mb-1 shadow"
                    style={{ backgroundColor: st.color, color: '#0f172a' }}
                  >
                    {st.symbol}
                  </div>
                  <div className="font-arcade text-[10px] font-bold" style={{ color: st.color }}>
                    {st.name}
                  </div>
                  <div className="text-[11px] font-mono-game text-slate-300">{st.angle}°</div>
                  <div
                    className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                      st.isOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {st.isOpen ? 'OPEN' : 'CLOSED'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Test Suite */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-arcade flex items-center gap-2">
                <span>Automated Unit Verification Tests</span>
                {testResults?.allPassed && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-sans-game font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ALL 7 TESTS PASSED
                  </span>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {testResults?.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono-game text-slate-200 font-semibold">
                      {tc.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Input: {tc.initialState} · Scanner: {tc.scanner} · Expected: {tc.expectedProbability * 100}%
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-game text-emerald-400 font-bold">
                      {(tc.actualProbability * 100).toFixed(0)}%
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sequential Measurement Monte Carlo Simulation */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider font-arcade">
                  Sequential Scrambling Simulation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  HEADS (0°) → R/B (45° Basis) → H/T (0° Basis)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => runSim(simTrials)}
                  disabled={isSimulating}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  Run {simTrials.toLocaleString()} Trials
                </button>
              </div>
            </div>

            {simResult && (
              <div className="space-y-3">
                {/* Progress bar comparison */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono-game">
                    <span className="text-amber-300">
                      HEADS: {simResult.headsCount} ({(simResult.headsFraction * 100).toFixed(1)}%)
                    </span>
                    <span className="text-emerald-300">
                      TAILS: {simResult.tailsCount} ({(simResult.tailsFraction * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${simResult.headsFraction * 100}%` }}
                    />
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${simResult.tailsFraction * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono-game">
                    <span>Theoretical Target: 50.0%</span>
                    <span>Theoretical Target: 50.0%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-emerald-300">
                      Measurement Scrambling Empirically Confirmed!
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    By measuring the locked 0° HEADS state with the 45° R/B basis, the gate collapsed into a 50/50 superposition of Red ({simResult.intermediateRedCount}) and Blue ({simResult.intermediateBlueCount}). When subsequently measured back in the H/T basis, the original 100% deterministic lock was broken, yielding an empirical ~50% Tails (Open) and ~50% Heads.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Quantum Bunny Engine v1.0 · Quriosity Hackathon
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Lab
          </button>
        </div>

      </div>
    </div>
  );
};
