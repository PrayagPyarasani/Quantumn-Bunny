/**
 * QUANTUM BUNNY - Master Game Engine
 * Unifies player physics, 5-level management, multiple quantum gates,
 * Quantum Flux hazards, HUD, and audio.
 */

import { LevelDefinition, LEVEL_1, ALL_LEVELS, TILE_SIZE, ScannerPickupData, QuantumGateData } from './levelData';
import { Player, PlayerInput } from './player';
import { Camera } from './camera';
import { ParticleSystem } from './particles';
import {
  QuantumBasis,
  QuantumStateDef,
  getStateFromAngle,
  performMeasurement,
  MeasurementResult,
  SCANNERS,
  isGateOpen,
} from './quantumPhysics';
import { checkAABB } from './collision';
import { sound } from './audio';
import {
  drawBunny,
  drawCarrotGoal,
  drawScannerPickup,
  drawQuantumGate,
  drawTile,
} from './sprites';
import { validateAllLevels } from './levelValidator';
import { resolveScannerPlacement } from './scannerPlacement';

export type GameState = 'PLAYING' | 'MEASURING' | 'VICTORY' | 'TIME_OVER';

export interface MeasurementNotice {
  text: string;
  subtext: string;
  color: string;
  badge: string;
  insight: string;
  timer: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public levelIndex = 0;
  public level: LevelDefinition = LEVEL_1;
  public player: Player;
  public camera: Camera;
  public particles: ParticleSystem;

  // Level State
  public state: GameState = 'PLAYING';
  public timeLimit: number = 90;
  public startTimeMs: number = 0;
  public displayTime: number = 90;
  public timeLeft: number;
  private timerRunning = false;
  public inventory: Record<QuantumBasis, number> = { HT: 0, RB: 0 };
  public pickups: ScannerPickupData[] = [];
  public gates: QuantumGateData[] = [];

  // Active / Targeted Gate
  public activeGate: QuantumGateData | null = null;
  public isNearGate = false;
  public isMeasuring = false;
  public measuringGateId: string | null = null;
  public measuringScannerType: QuantumBasis = 'HT';
  public measureTimer = 0;
  public measureMaxTicks = 45; // ~750ms at 60fps
  public activeMeasurementResult: MeasurementResult | null = null;
  public measurementNotice: MeasurementNotice | null = null;

  // Quantum Flux Hazard State
  public fluxTimer = 0;
  public isFluxWarning = false;
  public isFluxPulseActive = false;

  // Stats
  public measurementsCount = 0;
  public scannersCollectedCount = 0;

  // Rendering ticks
  public tick = 0;

  // Input state
  private input: PlayerInput = {
    left: false,
    right: false,
    jump: false,
    jumpJustPressed: false,
    useHT: false,
    useRB: false,
    restart: false,
  };

  // State change callbacks for React HUD
  public onStateChange?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;

    this.player = new Player(this.level.playerStart.x, this.level.playerStart.y);
    this.camera = new Camera(canvas.width, canvas.height);
    this.particles = new ParticleSystem();

    this.timeLeft = this.level.timeLimit;
    this.loadLevel(0);

    // Development & Runtime Level Solvability & Reachability Audit
    const validationReport = validateAllLevels();
    if (!validationReport.passed) {
      console.warn('[LEVEL VALIDATOR] Validation reported issues:', validationReport.errors);
    } else {
      console.log(`[LEVEL VALIDATOR] All ${ALL_LEVELS.length} levels verified: 100% Solvable, Reachable, & Valid!`);
    }
  }

  public loadLevel(index: number) {
    if (index < 0 || index >= ALL_LEVELS.length) index = 0;
    this.levelIndex = index;
    this.level = ALL_LEVELS[index];

    this.state = 'PLAYING';
    this.timeLimit = this.level.timeLimit;
    this.timeLeft = this.timeLimit;
    this.displayTime = this.timeLimit;
    this.startTimeMs = performance.now();
    this.timerRunning = true;
    this.inventory = this.level.initialInventory
      ? { ...this.level.initialInventory }
      : { HT: 0, RB: 0 };
    this.pickups = this.level.scanners.map((s) => {
      const resolved = resolveScannerPlacement(this.level.tiles, s);
      return { ...resolved, collected: false, respawnTimer: 0 };
    });

    // Deep clone gates for this session
    this.gates = this.level.gates.map((g) => ({
      ...g,
      stateAngle: g.stateAngle,
      initialState: g.initialState,
      isFluxDisabled: false,
      isMeasured: false,
    }));

    this.player.reset(this.level.playerStart.x, this.level.playerStart.y);
    this.camera.snapTo(
      this.player.x,
      this.player.y,
      this.level.cols * TILE_SIZE,
      this.level.rows * TILE_SIZE
    );
    this.particles.clear();

    this.activeGate = null;
    this.isNearGate = false;
    this.isMeasuring = false;
    this.measuringGateId = null;
    this.measureTimer = 0;
    this.activeMeasurementResult = null;
    this.measurementNotice = null;

    this.fluxTimer = 0;
    this.isFluxWarning = false;
    this.isFluxPulseActive = false;

    this.measurementsCount = 0;
    this.scannersCollectedCount = 0;

    this.onStateChange?.();
  }

  public resetLevel() {
    this.loadLevel(this.levelIndex);
  }

  public nextLevel(): boolean {
    if (this.levelIndex < ALL_LEVELS.length - 1) {
      this.loadLevel(this.levelIndex + 1);
      return true;
    }
    return false;
  }

  public setInput(input: Partial<PlayerInput>) {
    Object.assign(this.input, input);
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.setViewport(width, height);
  }

  public update(deltaTimeSeconds: number) {
    this.tick++;

    // 1. Authoritative real-time countdown timer (FPS independent, linear integer seconds)
    if ((this.state === 'PLAYING' || this.state === 'MEASURING') && this.timerRunning) {
      const elapsedSeconds = (performance.now() - this.startTimeMs) / 1000;
      const remaining = Math.max(0, this.timeLimit - elapsedSeconds);
      this.timeLeft = remaining;

      const currentInt = Math.max(0, Math.ceil(remaining));
      if (currentInt !== this.displayTime) {
        this.displayTime = currentInt;
        this.onStateChange?.();
      }

      if (remaining <= 0) {
        this.timeLeft = 0;
        this.displayTime = 0;
        this.timerRunning = false;
        this.state = 'TIME_OVER';
        sound.playLevelFail();
        this.onStateChange?.();
        return;
      }
    }

    if (this.state === 'TIME_OVER' || this.state === 'VICTORY') {
      this.particles.update();
      return;
    }

    // 2. Quantum Flux Hazard Progression
    const hazard = this.level.fluxHazard;
    if (hazard) {
      this.fluxTimer += deltaTimeSeconds;
      const totalCycle = hazard.periodSeconds + hazard.durationSeconds;
      if (this.fluxTimer >= totalCycle) {
        this.fluxTimer = 0;
      }

      const isWarning = this.fluxTimer >= (hazard.periodSeconds - hazard.warningSeconds) &&
                        this.fluxTimer < hazard.periodSeconds;
      const isPulsing = this.fluxTimer >= hazard.periodSeconds &&
                        this.fluxTimer < totalCycle;

      this.isFluxWarning = isWarning;
      this.isFluxPulseActive = isPulsing;

      for (const gate of this.gates) {
        if (hazard.targetGateIds.includes(gate.id)) {
          gate.isFluxDisabled = isPulsing;
        }
      }

      // Visual warning particles around target gates
      if (isWarning && this.tick % 8 === 0) {
        for (const gate of this.gates) {
          if (hazard.targetGateIds.includes(gate.id)) {
            this.particles.emitMeasurementAura(
              gate.x,
              gate.y,
              gate.width,
              gate.height,
              '#f59e0b'
            );
          }
        }
      }

      // Deep purple/magenta plasma discharge during active pulse
      if (isPulsing && this.tick % 4 === 0) {
        for (const gate of this.gates) {
          if (hazard.targetGateIds.includes(gate.id)) {
            this.particles.emitMeasurementAura(
              gate.x,
              gate.y,
              gate.width,
              gate.height,
              '#c026d3'
            );
          }
        }
      }
    } else {
      this.isFluxWarning = false;
      this.isFluxPulseActive = false;
    }

    // 3. Active Measurement Animation Step
    if (this.isMeasuring && this.measuringGateId) {
      this.measureTimer++;
      const targetGate = this.gates.find((g) => g.id === this.measuringGateId);

      // Particle emission during scan
      if (targetGate && this.tick % 4 === 0) {
        const stateDef = getStateFromAngle(targetGate.stateAngle);
        this.particles.emitMeasurementAura(
          targetGate.x,
          targetGate.y,
          targetGate.width,
          targetGate.height,
          stateDef.color
        );
      }

      if (this.measureTimer >= this.measureMaxTicks) {
        this.resolveMeasurement();
      }
    }

    // 4. Update player physics against tiles and all level gates
    this.player.isLocked = this.isMeasuring;
    this.player.update(this.input, this.level.tiles, this.gates);
    this.input.jumpJustPressed = false;

    // 5. Update Camera
    const levelW = this.level.cols * TILE_SIZE;
    const levelH = this.level.rows * TILE_SIZE;
    this.camera.update(
      this.player.x,
      this.player.y,
      this.player.facing,
      levelW,
      levelH
    );

    // 6. Check Scanner Pickups collision & emit ambient sparkles
    const playerBox = this.player.getBoundingBox();
    for (const pickup of this.pickups) {
      if (pickup.collected) {
        if (pickup.respawnSeconds && pickup.respawnSeconds > 0) {
          pickup.respawnTimer = (pickup.respawnTimer || 0) + deltaTimeSeconds;
          if (pickup.respawnTimer >= pickup.respawnSeconds) {
            pickup.collected = false;
            pickup.respawnTimer = 0;
            const col = pickup.type === 'HT' ? '#facc15' : '#f43f5e';
            this.particles.emitPickupBurst(pickup.x, pickup.y, col);
            this.onStateChange?.();
          }
        }
        continue;
      }

      // Emit subtle floating sparkles around active pickups
      if (this.tick % 16 === 0) {
        const col = pickup.type === 'HT' ? '#facc15' : '#f43f5e';
        this.particles.emitAmbientSparkle(pickup.x, pickup.y, col);
      }

      const pickupBox = {
        x: pickup.x - 14,
        y: pickup.y - 14,
        width: 28,
        height: 28,
      };
      if (checkAABB(playerBox, pickupBox)) {
        pickup.collected = true;
        this.inventory[pickup.type]++;
        this.scannersCollectedCount++;
        const col = pickup.type === 'HT' ? '#facc15' : '#f43f5e';
        this.particles.emitPickupBurst(pickup.x, pickup.y, col);
        sound.playPickup();
        this.onStateChange?.();
      }
    }

    // 7. Check Proximity to All Level Gates
    let closestGate: QuantumGateData | null = null;
    let closestDist = Infinity;
    for (const gate of this.gates) {
      const gateBox = {
        x: gate.x - 40,
        y: gate.y - 20,
        width: gate.width + 80,
        height: gate.height + 40,
      };
      if (checkAABB(playerBox, gateBox)) {
        const dist = Math.hypot(playerBox.x - gate.x, playerBox.y - gate.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestGate = gate;
        }
      }
    }

    const wasNear = this.isNearGate;
    this.activeGate = closestGate;
    this.isNearGate = closestGate !== null;
    if (wasNear !== this.isNearGate) {
      this.onStateChange?.();
    }

    // 8. Contextual Input Triggers for Scanners
    if (this.isNearGate && !this.isMeasuring && this.activeGate) {
      if (this.input.useHT && this.inventory.HT > 0) {
        this.triggerMeasurement('HT', this.activeGate.id);
      } else if (this.input.useRB && this.inventory.RB > 0) {
        this.triggerMeasurement('RB', this.activeGate.id);
      }
    }

    // 9. Check Carrot Goal
    const goalBox = {
      x: this.level.goal.x - 14,
      y: this.level.goal.y - 14,
      width: 28,
      height: 28,
    };
    if (this.state === 'PLAYING' && checkAABB(playerBox, goalBox)) {
      this.state = 'VICTORY';
      this.timerRunning = false;
      sound.playCarrotVictory();
      this.particles.emitCarrotWin(this.level.goal.x, this.level.goal.y);
      this.onStateChange?.();
    }

    // 10. Measurement notice expiration timer
    if (this.measurementNotice) {
      this.measurementNotice.timer--;
      if (this.measurementNotice.timer <= 0) {
        this.measurementNotice = null;
        this.onStateChange?.();
      }
    }

    // 11. Update particles
    this.particles.update();
  }

  public triggerMeasurement(scannerType: QuantumBasis, targetGateId?: string): boolean {
    if (this.inventory[scannerType] <= 0 || this.isMeasuring) {
      return false;
    }

    const gate = targetGateId
      ? this.gates.find((g) => g.id === targetGateId)
      : this.activeGate;

    if (!gate) return false;

    // Consume 1 scanner
    this.inventory[scannerType]--;
    this.measurementsCount++;
    this.isMeasuring = true;
    this.measuringGateId = gate.id;
    this.measuringScannerType = scannerType;
    this.measureTimer = 0;

    // Start audio & visual effects
    sound.playMeasurementScan();
    const scanner = SCANNERS[scannerType];

    this.measurementNotice = {
      text: `SCANNING BASIS: ${scanner.name} (${scanner.basisAngle}°)...`,
      subtext: `Applying quantum projection operator on ${gate.label || 'Gate'}...`,
      color: scanner.primaryColor,
      badge: scanner.keyLabel,
      insight: '',
      timer: 160,
    };

    this.onStateChange?.();
    return true;
  }

  private resolveMeasurement() {
    this.isMeasuring = false;
    const targetGate = this.gates.find((g) => g.id === this.measuringGateId);
    this.measuringGateId = null;

    if (!targetGate) return;

    const scannerType = this.measuringScannerType;
    const result = performMeasurement(targetGate.stateAngle, scannerType);

    this.activeMeasurementResult = result;
    targetGate.stateAngle = result.outcomeAngle;
    targetGate.initialState = result.outcomeState.name;
    targetGate.isMeasured = true;

    // Synchronize paired bifurcation junction gates in Level 3 (Section B complementary doors)
    for (const g of this.gates) {
      if (
        (targetGate.id === 'gate-3b' && g.id === 'gate-3c') ||
        (targetGate.id === 'gate-3c' && g.id === 'gate-3b')
      ) {
        g.stateAngle = result.outcomeAngle;
        g.initialState = result.outcomeState.name;
        g.isMeasured = true;
      }
    }

    const gateIsOpen = !targetGate.isFluxDisabled && isGateOpen(targetGate.stateAngle, targetGate.allowedStates, false);
    const prevBasis = result.previousState.basis;
    const isBasisSwitch = prevBasis !== scannerType;

    const noticeTitle = isBasisSwitch
      ? `Basis switched: ${prevBasis === 'HT' ? 'H/T' : 'R/B'} → ${scannerType === 'HT' ? 'H/T' : 'R/B'}`
      : `Measured in ${scannerType === 'HT' ? 'H/T' : 'R/B'} → ${result.outcomeState.name}`;

    const noticeDesc = isBasisSwitch
      ? `State collapsed to ${result.outcomeState.name} (${result.outcomeAngle}°)`
      : (result.outcomeAngle === result.previousAngle
          ? `Same question = same answer. State remains ${result.outcomeState.name} (${result.outcomeAngle}°).`
          : `State collapsed to ${result.outcomeState.name} (${result.outcomeAngle}°)`
        );

    if (gateIsOpen) {
      sound.playGateOpen();
      this.particles.emitPickupBurst(
        targetGate.x + targetGate.width / 2,
        targetGate.y + targetGate.height / 2,
        result.outcomeState.color
      );
      this.measurementNotice = {
        text: `${noticeTitle} · GATE OPENED!`,
        subtext: noticeDesc,
        color: '#10b981',
        badge: result.outcomeState.symbol,
        insight: result.educationalInsight,
        timer: 240, // ~4s
      };
    } else {
      sound.playGateClosed();
      const reqText = targetGate.allowedStates?.join(' / ') || 'TAILS / BLUE';
      this.measurementNotice = {
        text: `${noticeTitle} · CLOSED`,
        subtext: `${noticeDesc} · (Req: [${reqText}])`,
        color: '#ef4444',
        badge: result.outcomeState.symbol,
        insight: result.educationalInsight,
        timer: 240, // ~4s
      };
    }

    this.onStateChange?.();
  }

  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Retro Arcade Background (Deep space laboratory)
    this.drawBackground(ctx, w, h);

    // Save camera transform
    ctx.save();
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 2. Quantum Flux Zone effect if active
    if (this.level.fluxHazard) {
      this.drawFluxZone(ctx, this.level.fluxHazard);
    }

    // 3. Clues / In-World Pixel Art Signposts
    this.drawWorldClues(ctx);

    // 4. Tile Map
    this.drawTiles(ctx);

    // 5. Quantum Gates (draw all gates in level)
    for (const gate of this.gates) {
      const isGateMeasuring = this.isMeasuring && this.measuringGateId === gate.id;
      const measureProgress = this.measureTimer / this.measureMaxTicks;
      const gateState = getStateFromAngle(gate.stateAngle);
      const isLocked = Boolean(gate.initialLocked && !gate.isMeasured);
      const isOpen = !gate.isFluxDisabled && isGateOpen(gate.stateAngle, gate.allowedStates, isLocked);
      const isWarning = this.isFluxWarning && (this.level.fluxHazard?.targetGateIds.includes(gate.id) ?? false);

      drawQuantumGate(
        ctx,
        gate.x,
        gate.y,
        gate.width,
        gate.height,
        gateState,
        this.tick,
        isGateMeasuring,
        measureProgress,
        isOpen,
        gate.label,
        gate.isFluxDisabled,
        isWarning
      );
    }

    // 6. Scanner Pickups
    for (const pickup of this.pickups) {
      if (!pickup.collected) {
        drawScannerPickup(ctx, pickup.x, pickup.y, pickup.type, this.tick);
      }
    }

    // 7. Carrot Goal
    drawCarrotGoal(ctx, this.level.goal.x, this.level.goal.y, this.tick);

    // 8. Particles
    this.particles.draw(ctx);

    // 9. Bunny Character
    const feet = this.player.getFeet();
    drawBunny(
      ctx,
      feet.x,
      feet.y,
      this.player.facing,
      this.player.animState,
      this.player.animTick,
      false
    );

    // 10. In-world Contextual Gate Prompt for Active Gate
    if (this.isNearGate && !this.isMeasuring && this.activeGate && this.state === 'PLAYING') {
      this.drawInWorldGatePrompt(ctx, this.activeGate);
    }

    ctx.restore();

    // 11. Scanline CRT Overlay (Subtle 16-bit arcade finish)
    this.drawScanlines(ctx, w, h);
  }

  private drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Dark deep navy gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#060b18');
    grad.addColorStop(0.5, '#0a1128');
    grad.addColorStop(1, '#050814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Parallax stars / quantum flux nodes
    const parallaxFactorX = this.camera.x * 0.15;
    const parallaxFactorY = this.camera.y * 0.15;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      const starX = ((i * 137.5 - parallaxFactorX) % w + w) % w;
      const starY = ((i * 89.3 - parallaxFactorY) % h + h) % h;
      const size = i % 3 === 0 ? 2 : 1;
      ctx.fillRect(Math.round(starX), Math.round(starY), size, size);
    }

    // Distant futuristic grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;
    const gridSpacing = 48;
    const startX = -((parallaxFactorX) % gridSpacing);
    for (let gx = startX; gx < w; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
  }

  private drawFluxZone(ctx: CanvasRenderingContext2D, hazard: NonNullable<LevelDefinition['fluxHazard']>) {
    if (!hazard.zoneX || !hazard.zoneY || !hazard.zoneWidth || !hazard.zoneHeight) return;

    ctx.save();
    const isWarning = this.isFluxWarning;
    const isPulsing = this.isFluxPulseActive;

    const baseAlpha = isPulsing ? 0.35 : (isWarning ? 0.20 : 0.08);
    const color = isPulsing ? '#c026d3' : (isWarning ? '#f59e0b' : '#a855f7');

    ctx.fillStyle = color;
    ctx.globalAlpha = baseAlpha + Math.sin(this.tick * 0.2) * 0.05;
    ctx.fillRect(hazard.zoneX, hazard.zoneY, hazard.zoneWidth, hazard.zoneHeight);

    // Animated energy scan waves
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = baseAlpha * 1.8;
    for (let i = 0; i < 4; i++) {
      const lineY = hazard.zoneY + ((this.tick * 2 + i * 35) % hazard.zoneHeight);
      ctx.beginPath();
      ctx.moveTo(hazard.zoneX, lineY);
      ctx.lineTo(hazard.zoneX + hazard.zoneWidth, lineY);
      ctx.stroke();
    }

    // Warning text floating above zone
    if (isWarning || isPulsing) {
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = isPulsing ? '#e879f9' : '#fbbf24';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1.0;
      const text = isPulsing ? '⚡ FLUX ACTIVE ⚡' : '⚠ FLUX INCOMING ⚠';
      ctx.fillText(text, hazard.zoneX + hazard.zoneWidth / 2, hazard.zoneY - 8);
    }

    ctx.restore();
  }

  private drawTiles(ctx: CanvasRenderingContext2D) {
    const tiles = this.level.tiles;
    const startCol = Math.max(0, Math.floor(this.camera.x / TILE_SIZE));
    const endCol = Math.min(
      this.level.cols - 1,
      Math.ceil((this.camera.x + this.camera.viewportWidth) / TILE_SIZE)
    );
    const startRow = Math.max(0, Math.floor(this.camera.y / TILE_SIZE));
    const endRow = Math.min(
      this.level.rows - 1,
      Math.ceil((this.camera.y + this.camera.viewportHeight) / TILE_SIZE)
    );

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (tiles[r][c] === 1) {
          const hasTop = r > 0 && tiles[r - 1][c] === 1;
          const hasBottom = r < this.level.rows - 1 && tiles[r + 1][c] === 1;
          const hasLeft = c > 0 && tiles[r][c - 1] === 1;
          const hasRight = c < this.level.cols - 1 && tiles[r][c + 1] === 1;

          drawTile(ctx, c, r, TILE_SIZE, hasTop, hasBottom, hasLeft, hasRight);
        }
      }
    }
  }

  private drawWorldClues(ctx: CanvasRenderingContext2D) {
    for (const clue of this.level.clues) {
      ctx.save();
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.textAlign = 'left';
      ctx.fillText(clue.text, clue.x, clue.y);
      ctx.restore();
    }
  }

  private drawInWorldGatePrompt(ctx: CanvasRenderingContext2D, gate: QuantumGateData) {
    const promptX = gate.x - 30;
    const promptY = gate.y - 38;

    ctx.save();
    ctx.translate(promptX, promptY);

    // Prompt backing card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(-8, -8, 126, 38);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -8, 126, 38);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'left';

    // Scanner actions available
    if (this.inventory.HT > 0) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(`[E] H/T SCAN (×${this.inventory.HT})`, 0, 6);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`[E] H/T SCAN (×0)`, 0, 6);
    }

    if (this.inventory.RB > 0) {
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`[Q] R/B SCAN (×${this.inventory.RB})`, 0, 20);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`[Q] R/B SCAN (×0)`, 0, 20);
    }

    ctx.restore();
  }

  private drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
  }
}
