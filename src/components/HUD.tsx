/**
 * QUANTUM BUNNY - Heads-Up Display & Arcade Overlay
 * Authentic retro 16-bit UI with inventory badges, countdown timer,
 * level indicator/switcher, Quantum Flux hazard warnings,
 * contextual gate interaction controls, and mobile virtual d-pad.
 */

import React from 'react';
import { GameEngine } from '../game/engine';
import { Volume2, VolumeX, RotateCcw, FlaskConical, HelpCircle, Layers, Zap } from 'lucide-react';
import { sound } from '../game/audio';
import { getStateFromAngle, isGateOpen } from '../game/quantumPhysics';
import { ALL_LEVELS } from '../game/levelData';

interface HUDProps {
  engine: GameEngine | null;
  onRestart: () => void;
  onOpenLab: () => void;
  onOpenHelp: () => void;
  onSelectLevel: (lvlIdx: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onRestart,
  onOpenLab,
  onOpenHelp,
  onSelectLevel,
}) => {
  const [muted, setMuted] = React.useState(sound.getMuted());
  const [showLevelSelect, setShowLevelSelect] = React.useState(false);

  if (!engine) return null;

  const inventory = engine.inventory;
  const timeLeft = Math.max(0, engine.displayTime ?? Math.ceil(engine.timeLeft));
  const isTimeCritical = timeLeft <= 15;

  const toggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const handleUseScanner = (type: 'HT' | 'RB') => {
    if (engine.activeGate) {
      engine.triggerMeasurement(type, engine.activeGate.id);
    } else {
      engine.triggerMeasurement(type);
    }
  };

  // Active gate state computation
  const activeGate = engine.activeGate;
  const activeGateState = activeGate ? getStateFromAngle(activeGate.stateAngle) : null;
  const activeGateIsOpen = activeGate
    ? !activeGate.isFluxDisabled && isGateOpen(activeGate.stateAngle, activeGate.allowedStates)
    : false;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none font-sans-game">
      
      {/* Top Header Bar */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-start justify-between gap-3">
          
          {/* Left: Inventory Badges & Level Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 shadow-lg">
              {/* H/T Scanner Badge */}
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded transition-colors ${
                  inventory.HT > 0
                    ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                <div className="w-4 h-4 rounded-sm bg-yellow-400 text-slate-950 font-arcade text-[9px] flex items-center justify-center font-bold">
                  H
                </div>
                <span className="font-arcade text-xs tracking-wider">
                  H/T × {inventory.HT}
                </span>
              </div>

              {/* R/B Scanner Badge */}
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded transition-colors ${
                  inventory.RB > 0
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                <div className="w-4 h-4 rounded-sm bg-rose-500 text-white font-arcade text-[9px] flex items-center justify-center font-bold">
                  R
                </div>
                <span className="font-arcade text-xs tracking-wider">
                  R/B × {inventory.RB}
                </span>
              </div>
            </div>

            {/* Level Badge with Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLevelSelect(!showLevelSelect)}
                className="bg-slate-950/85 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 px-3 py-2 rounded-lg text-xs font-arcade flex items-center gap-1.5 shadow-lg transition-colors"
                title="Select Level"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>LVL {engine.level.levelNumber}</span>
              </button>

              {/* Level Dropdown Popover */}
              {showLevelSelect && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-2xl p-2 z-50 space-y-1 font-sans-game">
                  <div className="px-2 py-1 text-[10px] text-slate-400 font-arcade uppercase tracking-wider">
                    Select Level
                  </div>
                  {ALL_LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        onSelectLevel(idx);
                        setShowLevelSelect(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        engine.levelIndex === idx
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span className="font-arcade text-[10px]">
                        {lvl.levelNumber}. {lvl.subtitle}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono-game">
                        {lvl.timeLimit}s
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Countdown Timer */}
          <div
            className={`px-4 py-2 rounded-lg border backdrop-blur-md shadow-lg flex items-center gap-2 font-arcade text-xs tracking-widest ${
              isTimeCritical
                ? 'bg-rose-950/90 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-950/85 border-slate-800 text-slate-200'
            }`}
          >
            <span className="text-slate-400 text-[10px]">TIME</span>
            <span className="font-bold text-sm">{timeLeft.toString().padStart(2, '0')}</span>
          </div>

          {/* Right: Actions (Mute, Lab, Help, Restart) */}
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-lg">
            <button
              onClick={toggleSound}
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={onOpenLab}
              title="Quantum Lab & Verification Math"
              className="px-2.5 py-1.5 rounded-md bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-arcade text-[9px]">QUANTUM LAB</span>
            </button>

            <button
              onClick={onOpenHelp}
              title="How to Play"
              className="p-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onRestart}
              title="Restart Level [R]"
              className="px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-arcade text-[9px]">RESTART [R]</span>
            </button>
          </div>

        </div>

        {/* Quantum Flux Hazard Alert Banner */}
        {engine.isFluxWarning && (
          <div className="self-center mx-auto bg-amber-950/90 border border-amber-500/80 text-amber-300 px-4 py-1.5 rounded-full text-xs font-arcade tracking-wider flex items-center gap-2 shadow-xl animate-bounce">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>⚠ QUANTUM FLUX INCOMING ⚠</span>
          </div>
        )}

        {engine.isFluxPulseActive && (
          <div className="self-center mx-auto bg-purple-950/95 border border-purple-500 text-purple-200 px-4 py-1.5 rounded-full text-xs font-arcade tracking-wider flex items-center gap-2 shadow-xl shadow-purple-500/20 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>⚡ FLUX ACTIVE: GATES DESTABILIZED ⚡</span>
          </div>
        )}
      </div>

      {/* Center Dynamic Notification (During / After Measurement) */}
      {engine.measurementNotice && (
        <div className="self-center my-auto max-w-lg w-full text-center pointer-events-auto">
          <div
            className="bg-slate-950/95 border-2 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-1.5 animate-scale-up"
            style={{ borderColor: engine.measurementNotice.color }}
          >
            <div
              className="font-arcade text-xs sm:text-sm font-bold tracking-wider"
              style={{ color: engine.measurementNotice.color }}
            >
              {engine.measurementNotice.text}
            </div>

            <div className="text-xs text-slate-300 font-mono-game">
              {engine.measurementNotice.subtext}
            </div>

            {engine.measurementNotice.insight && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-cyan-200/90 leading-relaxed font-sans-game">
                💡 <span className="font-semibold">{engine.measurementNotice.insight}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Area: Contextual Gate Prompts & Virtual Touch Controls */}
      <div className="space-y-3 pointer-events-none">
        
        {/* Contextual Gate Interaction Bar (Appears when near any gate) */}
        {engine.isNearGate && !engine.isMeasuring && activeGate && activeGateState && engine.state === 'PLAYING' && (
          <div className="self-center mx-auto max-w-lg w-full bg-slate-950/95 border border-cyan-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="text-left space-y-0.5">
              <div className="text-[10px] text-slate-400 font-arcade flex items-center gap-1.5">
                <span>{activeGate.label || 'QUANTUM GATE'}</span>
                {activeGate.allowedStates && (
                  <span className="text-[9px] text-amber-300 font-mono-game font-semibold">
                    (Req: {activeGate.allowedStates.join('/')})
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeGateState.color }}
                />
                <span>STATE: {activeGateState.name} ({activeGateState.angle}°)</span>
                <span className={activeGateIsOpen ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  [{activeGateIsOpen ? 'OPEN' : 'CLOSED'}]
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Use H/T button */}
              <button
                onClick={() => handleUseScanner('HT')}
                disabled={inventory.HT <= 0}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg font-arcade text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                  inventory.HT > 0
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold shadow-lg shadow-yellow-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span>[E] H/T SCAN (×{inventory.HT})</span>
              </button>

              {/* Use R/B button */}
              <button
                onClick={() => handleUseScanner('RB')}
                disabled={inventory.RB <= 0}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg font-arcade text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                  inventory.RB > 0
                    ? 'bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span>[Q] R/B SCAN (×{inventory.RB})</span>
              </button>
            </div>

          </div>
        )}

        {/* Mobile / Touch Overlay Buttons */}
        <div className="flex items-end justify-between pointer-events-auto select-none sm:opacity-85 sm:hover:opacity-100 transition-opacity">
          
          {/* Virtual D-Pad Left / Right */}
          <div className="flex items-center gap-2">
            <button
              onMouseDown={() => engine.setInput({ left: true })}
              onMouseUp={() => engine.setInput({ left: false })}
              onMouseLeave={() => engine.setInput({ left: false })}
              onTouchStart={(e) => { e.preventDefault(); engine.setInput({ left: true }); }}
              onTouchEnd={(e) => { e.preventDefault(); engine.setInput({ left: false }); }}
              className="w-12 h-12 rounded-xl bg-slate-900/85 active:bg-slate-700 border border-slate-700/80 text-white font-arcade text-sm flex items-center justify-center shadow-lg active:scale-90 select-none"
            >
              ◀
            </button>
            <button
              onMouseDown={() => engine.setInput({ right: true })}
              onMouseUp={() => engine.setInput({ right: false })}
              onMouseLeave={() => engine.setInput({ right: false })}
              onTouchStart={(e) => { e.preventDefault(); engine.setInput({ right: true }); }}
              onTouchEnd={(e) => { e.preventDefault(); engine.setInput({ right: false }); }}
              className="w-12 h-12 rounded-xl bg-slate-900/85 active:bg-slate-700 border border-slate-700/80 text-white font-arcade text-sm flex items-center justify-center shadow-lg active:scale-90 select-none"
            >
              ▶
            </button>
          </div>

          {/* Virtual Jump & Action Buttons */}
          <div className="flex items-center gap-2">
            {engine.isNearGate && inventory.HT > 0 && (
              <button
                onClick={() => handleUseScanner('HT')}
                className="w-12 h-12 rounded-xl bg-yellow-500/90 active:bg-yellow-400 border border-yellow-300 text-slate-950 font-arcade text-xs flex flex-col items-center justify-center shadow-lg font-bold select-none active:scale-90"
              >
                <span>E</span>
                <span className="text-[8px]">H/T</span>
              </button>
            )}

            {engine.isNearGate && inventory.RB > 0 && (
              <button
                onClick={() => handleUseScanner('RB')}
                className="w-12 h-12 rounded-xl bg-rose-500/90 active:bg-rose-400 border border-rose-300 text-white font-arcade text-xs flex flex-col items-center justify-center shadow-lg font-bold select-none active:scale-90"
              >
                <span>Q</span>
                <span className="text-[8px]">R/B</span>
              </button>
            )}

            <button
              onMouseDown={() => engine.setInput({ jump: true, jumpJustPressed: true })}
              onMouseUp={() => engine.setInput({ jump: false })}
              onMouseLeave={() => engine.setInput({ jump: false })}
              onTouchStart={(e) => { e.preventDefault(); engine.setInput({ jump: true, jumpJustPressed: true }); }}
              onTouchEnd={(e) => { e.preventDefault(); engine.setInput({ jump: false }); }}
              className="w-14 h-12 rounded-xl bg-cyan-600/90 active:bg-cyan-500 border border-cyan-400 text-white font-arcade text-[10px] flex items-center justify-center shadow-lg font-bold select-none active:scale-90"
            >
              JUMP
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
