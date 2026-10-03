/**
 * QUANTUM BUNNY - Main Application Component
 * 2D Pixel-Art Platform Puzzle Game teaching Basis Switching & Measurement Scrambling.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { HUD } from './components/HUD';
import { QuantumLabModal } from './components/QuantumLabModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { FlaskConical, HelpCircle, RotateCcw } from 'lucide-react';

import { ALL_LEVELS } from './game/levelData';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [, setTickState] = useState(0);

  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Force re-render on engine state change
  const handleEngineStateChange = useCallback(() => {
    setTickState((t) => t + 1);
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetLevel();
      setTickState((t) => t + 1);
    }
  }, []);

  const handleSelectLevel = useCallback((lvlIdx: number) => {
    if (engineRef.current) {
      engineRef.current.loadLevel(lvlIdx);
      setTickState((t) => t + 1);
    }
  }, []);

  const handleNextLevel = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.nextLevel();
      setTickState((t) => t + 1);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Fixed internal resolution for authentic 16-bit pixel aesthetic: 640x360
    const internalWidth = 640;
    const internalHeight = 360;
    canvas.width = internalWidth;
    canvas.height = internalHeight;

    const engine = new GameEngine(canvas);
    engine.onStateChange = handleEngineStateChange;
    engineRef.current = engine;

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on space/arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        engine.setInput({ left: true });
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        engine.setInput({ right: true });
      }
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (!e.repeat) {
          engine.setInput({ jump: true, jumpJustPressed: true });
        }
      }
      if (e.code === 'KeyE') {
        engine.triggerMeasurement('HT');
      }
      if (e.code === 'KeyQ') {
        engine.triggerMeasurement('RB');
      }
      if (e.code === 'KeyR') {
        engine.resetLevel();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        engine.setInput({ left: false });
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        engine.setInput({ right: false });
      }
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        engine.setInput({ jump: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main animation game loop
    let lastTime = performance.now();
    let animId: number;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      engine.update(dt);
      engine.render();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleEngineStateChange]);

  const engine = engineRef.current;
  const isVictory = engine?.state === 'VICTORY';
  const isGameOver = engine?.state === 'TIME_OVER';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-between select-none">
      
      {/* Top Header Bar Contract */}
      <header className="w-full max-w-6xl px-6 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm z-10 shrink-0">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-arcade text-xs sm:text-sm tracking-wider text-cyan-400">
            QUANTUM BUNNY
          </span>
          <span className="text-[10px] text-slate-400 font-sans-game">
            · Basis Switching & Measurement Scrambling
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs text-slate-400 font-sans-game">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
          <button
            onClick={() => setIsLabOpen(true)}
            className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Quantum Lab</span>
          </button>
          <button
            onClick={handleRestart}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart [R]</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLabOpen(true)}
            className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors font-sans-game"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verify Physics</span>
          </button>
        </div>
      </header>

      {/* Main Game Screen Centerpiece */}
      <main className="flex-1 w-full max-w-5xl flex items-center justify-center p-2 sm:p-4">
        <div
          ref={containerRef}
          className="relative w-full aspect-[16/9] max-h-[82vh] bg-black rounded-xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center"
        >
          {/* Authentic 16-Bit Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full pixelated block"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Interactive HUD & Virtual Controls */}
          <HUD
            engine={engine}
            onRestart={handleRestart}
            onOpenLab={() => setIsLabOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onSelectLevel={handleSelectLevel}
          />

          {/* Victory Modal with Next Level Progression */}
          <VictoryModal
            isOpen={isVictory}
            levelNumber={engine?.level.levelNumber || 1}
            levelName={engine?.level.name || 'LEVEL 1'}
            levelSubtitle={engine?.level.subtitle || ''}
            timeLeft={engine ? (engine.displayTime ?? Math.ceil(engine.timeLeft)) : 0}
            scannersUsed={engine?.measurementsCount || 0}
            debrief={engine?.level.completionDebrief}
            hasNextLevel={Boolean(engine && engine.levelIndex < ALL_LEVELS.length - 1)}
            onNextLevel={handleNextLevel}
            onRestart={handleRestart}
            onOpenLab={() => {
              setIsLabOpen(true);
            }}
          />

          {/* Game Over (Time Out) Modal */}
          <GameOverModal
            isOpen={isGameOver}
            onRestart={handleRestart}
          />
        </div>
      </main>

      {/* Sub-Footer Contextual Controls Info */}
      <footer className="w-full max-w-5xl px-6 py-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-sans-game shrink-0">
        <div className="flex items-center gap-4">
          <span>Controls: <strong className="text-slate-300">[A][D]</strong> Move · <strong className="text-slate-300">[SPACE]</strong> Jump</span>
          <span>Near Gate: <strong className="text-yellow-400">[E]</strong> H/T Scan · <strong className="text-rose-400">[Q]</strong> R/B Scan</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span>Quriosity Quantum Hackathon Edition</span>
        </div>
      </footer>

      {/* Quantum Lab & Verification Modal */}
      <QuantumLabModal
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
      />

      {/* How to Play Guide Modal */}
      <HowToPlayModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
}
