/**
 * QUANTUM BUNNY - 16-Bit Pixel Art Procedural Sprite Engine
 * Original handcrafted pixel aesthetics rendered directly to Canvas.
 */

import { QuantumBasis, QuantumStateDef } from './quantumPhysics';

export type BunnyAnimationState = 'idle' | 'running' | 'jumping' | 'falling';

/**
 * Draws the original Bunny character with full animations:
 * - Idle: breathing, ear twitch, blinking
 * - Running: 4-frame hop cycle with trailing ears and kicking feet
 * - Jumping: stretched vertical pose, swept back ears
 * - Falling: fluttered ears, arched back
 */
export function drawBunny(
  ctx: CanvasRenderingContext2D,
  x: number, // center x
  y: number, // bottom y (feet on ground)
  facing: 1 | -1, // 1 = right, -1 = left
  animState: BunnyAnimationState,
  animTick: number,
  isInvulnerable = false
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);

  if (isInvulnerable && Math.floor(animTick / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // Animation offsets
  let bodyYOffset = 0;
  let earAngle1 = 0;
  let earAngle2 = 0;
  let footOffset1 = 0;
  let footOffset2 = 0;
  let stretchY = 1;
  let squishX = 1;

  if (animState === 'idle') {
    // Gentle breathing
    const breath = Math.sin(animTick * 0.08);
    bodyYOffset = breath * 1.5;
    // Periodic ear twitch
    if (Math.sin(animTick * 0.03) > 0.8) {
      earAngle1 = Math.sin(animTick * 0.4) * 0.15;
    }
  } else if (animState === 'running') {
    // 4-frame bouncy hop cycle
    const cycle = (animTick * 0.25) % (Math.PI * 2);
    bodyYOffset = -Math.abs(Math.sin(cycle)) * 4;
    earAngle1 = -0.2 - Math.sin(cycle) * 0.15;
    earAngle2 = -0.25 - Math.sin(cycle) * 0.2;
    footOffset1 = Math.cos(cycle) * 4;
    footOffset2 = -Math.cos(cycle) * 4;
  } else if (animState === 'jumping') {
    // Stretched up
    stretchY = 1.15;
    squishX = 0.9;
    earAngle1 = -0.4;
    earAngle2 = -0.35;
    footOffset1 = -2;
    footOffset2 = -1;
  } else if (animState === 'falling') {
    // Compressed/ready for impact, ears flutter
    stretchY = 0.95;
    squishX = 1.05;
    earAngle1 = 0.1 + Math.sin(animTick * 0.3) * 0.1;
    earAngle2 = 0.15 + Math.cos(animTick * 0.3) * 0.1;
    footOffset1 = 2;
    footOffset2 = 2;
  }

  // Colors
  const furWhite = '#f8fafc';
  const furShade = '#e2e8f0';
  const innerEar = '#f472b6';
  const nosePink = '#fb7185';
  const eyeDark = '#0f172a';
  const scarfCyan = '#06b6d4';
  const scarfHighlight = '#67e8f9';

  ctx.translate(0, bodyYOffset);
  ctx.scale(squishX, stretchY);

  // 1. Fluffy Tail
  ctx.fillStyle = furWhite;
  ctx.fillRect(-14, -12, 6, 6);
  ctx.fillStyle = furShade;
  ctx.fillRect(-15, -10, 3, 4);

  // 2. Back Ear
  ctx.save();
  ctx.translate(-2, -26);
  ctx.rotate(earAngle2);
  ctx.fillStyle = furShade;
  ctx.fillRect(-3, -12, 6, 12);
  ctx.fillStyle = innerEar;
  ctx.fillRect(-2, -10, 4, 9);
  ctx.restore();

  // 3. Main Body
  ctx.fillStyle = furWhite;
  ctx.beginPath();
  // Rounded chunky bunny body
  ctx.fillRect(-9, -20, 18, 16);
  ctx.fillRect(-7, -22, 14, 2);
  ctx.fillRect(-11, -17, 2, 10);
  ctx.fillRect(7, -17, 3, 10);

  // Belly shading
  ctx.fillStyle = furShade;
  ctx.fillRect(-8, -8, 14, 4);

  // 4. Quantum Scarf / Harness
  ctx.fillStyle = scarfCyan;
  ctx.fillRect(-8, -19, 17, 4);
  ctx.fillStyle = scarfHighlight;
  ctx.fillRect(-2, -19, 5, 4);
  // Scarf knot & trail
  ctx.fillStyle = scarfCyan;
  ctx.fillRect(-11, -18, 4, 7);
  ctx.fillStyle = scarfHighlight;
  ctx.fillRect(-10, -14, 2, 3);

  // 5. Front Ear
  ctx.save();
  ctx.translate(3, -26);
  ctx.rotate(earAngle1);
  ctx.fillStyle = furWhite;
  ctx.fillRect(-3, -13, 6, 13);
  ctx.fillStyle = innerEar;
  ctx.fillRect(-2, -11, 4, 10);
  ctx.restore();

  // 6. Face
  // Eye (with blink)
  const isBlinking = animState === 'idle' && Math.sin(animTick * 0.05) > 0.96;
  if (!isBlinking) {
    ctx.fillStyle = eyeDark;
    ctx.fillRect(3, -16, 4, 5);
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, -16, 2, 2);
  } else {
    ctx.fillStyle = eyeDark;
    ctx.fillRect(2, -14, 5, 2);
  }

  // Cheek blush
  ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
  ctx.fillRect(1, -11, 4, 3);

  // Nose
  ctx.fillStyle = nosePink;
  ctx.fillRect(8, -13, 3, 2);

  // Whiskers
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(6, -11, 4, 1);
  ctx.fillRect(6, -9, 4, 1);

  // 7. Feet / Paws
  ctx.fillStyle = furWhite;
  // Back foot
  ctx.fillRect(-6 + footOffset2, -4, 6, 4);
  ctx.fillStyle = furShade;
  ctx.fillRect(-6 + footOffset2, -1, 6, 1);

  // Front foot
  ctx.fillStyle = furWhite;
  ctx.fillRect(2 + footOffset1, -4, 6, 4);
  ctx.fillStyle = furShade;
  ctx.fillRect(2 + footOffset1, -1, 6, 1);

  ctx.restore();
}

/**
 * Draws the original Carrot Goal with sparkle particles and bobbing animation
 */
export function drawCarrotGoal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tick: number
) {
  ctx.save();
  const bob = Math.sin(tick * 0.08) * 5;
  ctx.translate(Math.round(x), Math.round(y + bob));

  // Glowing halo
  const glowRad = 24 + Math.sin(tick * 0.1) * 4;
  const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, glowRad);
  grad.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
  grad.addColorStop(0.5, 'rgba(234, 179, 8, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
  ctx.fill();

  // Leaf tufts (Green)
  ctx.fillStyle = '#10b981';
  ctx.fillRect(-2, -22, 4, 8);
  ctx.fillRect(-7, -20, 5, 5);
  ctx.fillRect(2, -20, 5, 5);

  ctx.fillStyle = '#34d399';
  ctx.fillRect(-1, -24, 3, 6);
  ctx.fillRect(-6, -22, 3, 4);
  ctx.fillRect(3, -22, 3, 4);

  // Carrot body (Orange taper)
  ctx.fillStyle = '#ea580c'; // darker shade
  ctx.fillRect(-8, -14, 16, 6);
  ctx.fillRect(-7, -8, 14, 6);
  ctx.fillRect(-5, -2, 10, 6);
  ctx.fillRect(-3, 4, 6, 6);
  ctx.fillRect(-1, 10, 2, 4);

  // Carrot highlights
  ctx.fillStyle = '#fb923c'; // bright orange
  ctx.fillRect(-6, -14, 10, 5);
  ctx.fillRect(-5, -8, 8, 5);
  ctx.fillRect(-4, -2, 6, 5);
  ctx.fillRect(-2, 4, 4, 5);

  // Highlight streaks
  ctx.fillStyle = '#fef08a'; // gold highlight
  ctx.fillRect(-4, -13, 2, 3);
  ctx.fillRect(-3, -7, 2, 3);

  // Sparkles
  for (let i = 0; i < 3; i++) {
    const angle = tick * 0.05 + (i * Math.PI * 2) / 3;
    const dist = 16 + Math.sin(tick * 0.1 + i) * 6;
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist;
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
  }

  ctx.restore();
}

/**
 * Draws the original Quantum Scanner Collectible pickups:
 * Yellow H/T Scanner: Golden quantum prism node with H/T glyph
 * Red R/B Scanner: Ruby flux capacitor crystal node with R/B glyph
 */
export function drawScannerPickup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: QuantumBasis,
  tick: number
) {
  ctx.save();
  const floatBob = Math.sin(tick * 0.09) * 4;
  ctx.translate(Math.round(x), Math.round(y + floatBob));

  const isHT = type === 'HT';
  const mainColor = isHT ? '#facc15' : '#f43f5e';
  const glowColor = isHT ? 'rgba(250, 204, 21, 0.45)' : 'rgba(244, 63, 94, 0.45)';
  const coreDark = isHT ? '#854d0e' : '#881337';
  const glyph = isHT
    ? Math.floor(tick / 35) % 2 === 0 ? 'H' : 'T'
    : Math.floor(tick / 35) % 2 === 0 ? 'R' : 'B';

  // Pulsing aura with high contrast
  const pulseRadius = 20 + Math.sin(tick * 0.12) * 4;
  const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, pulseRadius);
  grad.addColorStop(0, glowColor);
  grad.addColorStop(0.6, glowColor);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Twinkling quantum sparkles
  for (let s = 0; s < 3; s++) {
    const sAngle = tick * 0.08 + (s * Math.PI * 2) / 3;
    const sDist = 17 + Math.sin(tick * 0.15 + s) * 4;
    const sx = Math.cos(sAngle) * sDist;
    const sy = Math.sin(sAngle) * sDist;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
  }

  // Outer orbital particles (Quantum orbit)
  const orbitCount = 4;
  for (let i = 0; i < orbitCount; i++) {
    const orbitAngle = tick * 0.06 + (i * Math.PI * 2) / orbitCount;
    const ox = Math.cos(orbitAngle) * 15;
    const oy = Math.sin(orbitAngle) * 10;
    ctx.fillStyle = mainColor;
    ctx.fillRect(Math.round(ox - 1), Math.round(oy - 1), 3, 3);
  }

  // Scanner chassis (Diamond / Hexagon core)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-11, -11, 22, 22);

  // Beveled edge
  ctx.fillStyle = mainColor;
  ctx.fillRect(-9, -12, 18, 2);
  ctx.fillRect(-9, 10, 18, 2);
  ctx.fillRect(-12, -9, 2, 18);
  ctx.fillRect(10, -9, 2, 18);

  // Inner display field
  ctx.fillStyle = coreDark;
  ctx.fillRect(-8, -8, 16, 16);

  // Alternating Quantum Glyph (H/T or R/B)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, 0, 1);

  // Quantum Corner pips
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-10, -10, 2, 2);
  ctx.fillRect(8, -10, 2, 2);
  ctx.fillRect(-10, 8, 2, 2);
  ctx.fillRect(8, 8, 2, 2);

  ctx.restore();
}

/**
 * Draws the Quantum Gate:
 * Animated energy barrier with state glow, emitter pylons, and quantum glyph
 */
export function drawQuantumGate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  state: QuantumStateDef,
  tick: number,
  isMeasuring = false,
  measureProgress = 0,
  isOpenOverride?: boolean,
  label?: string,
  isFluxDisabled = false,
  isFluxWarning = false
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const isOpen = isFluxDisabled ? false : (isOpenOverride !== undefined ? isOpenOverride : state.isOpen);
  const color = isFluxDisabled ? '#c026d3' : state.color;

  // Gate Label above top pylon if present
  if (label) {
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = isFluxDisabled ? '#e879f9' : '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(label, width / 2, -5);
  }

  // 1. Top Emitter Pylon
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width, 12);
  ctx.fillStyle = '#334155';
  ctx.fillRect(2, 2, width - 4, 8);
  // Indicator light on emitter (flashes amber on warning, purple on flux)
  ctx.fillStyle = isFluxWarning && Math.floor(tick / 6) % 2 === 0
    ? '#f59e0b'
    : (isFluxDisabled ? '#e879f9' : color);
  ctx.fillRect(width / 2 - 4, 3, 8, 6);

  // 2. Bottom Receptor Pylon
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, height - 12, width, 12);
  ctx.fillStyle = '#334155';
  ctx.fillRect(2, height - 10, width - 4, 8);
  // Indicator light on receptor
  ctx.fillStyle = isFluxWarning && Math.floor(tick / 6) % 2 === 0
    ? '#f59e0b'
    : (isFluxDisabled ? '#e879f9' : color);
  ctx.fillRect(width / 2 - 4, height - 9, 8, 6);

  // Barrier region
  const barrierY = 12;
  const barrierH = height - 24;

  if (!isOpen || isMeasuring || isFluxDisabled) {
    // Solid / Active forcefield
    const alpha = isMeasuring
      ? 0.5 + Math.sin(tick * 0.4) * 0.4
      : isFluxDisabled
      ? 0.85 + Math.sin(tick * 0.8) * 0.15
      : 0.75 + Math.sin(tick * 0.1) * 0.15;

    ctx.fillStyle = isFluxDisabled ? 'rgba(192, 38, 211, 0.4)' : state.glowColor;
    ctx.fillRect(-4, barrierY, width + 8, barrierH);

    // Energy bands
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(2, barrierY, width - 4, barrierH);

    // Flowing energy scanlines (erratic if flux disabled)
    ctx.fillStyle = isFluxDisabled ? '#fdf4ff' : '#ffffff';
    for (let i = 0; i < 6; i++) {
      const speed = isFluxDisabled ? 4 : 1.5;
      const lineY = barrierY + ((tick * speed + i * 20) % barrierH);
      ctx.fillRect(4, Math.round(lineY), width - 8, 2);
    }
    ctx.globalAlpha = 1.0;

    // Center state shield badge
    const badgeY = barrierY + barrierH / 2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(2, badgeY - 14, width - 4, 28);
    ctx.fillStyle = color;
    ctx.strokeRect(3, badgeY - 13, width - 6, 26);

    // State glyph or FLUX badge
    ctx.fillStyle = '#ffffff';
    ctx.font = isFluxDisabled ? 'bold 8px "Press Start 2P", monospace' : 'bold 11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isFluxDisabled ? 'FLUX' : state.symbol, width / 2, badgeY);

    // Small locked indicator
    ctx.fillStyle = isFluxDisabled ? '#e879f9' : color;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText(isFluxDisabled ? 'UNSTABLE' : 'LOCKED', width / 2, badgeY + 20);
  } else {
    // OPEN Gate: Permeable harmonic quantum archway
    ctx.fillStyle = state.glowColor;
    ctx.fillRect(0, barrierY, width, barrierH);

    // Gentle vertical particles indicating passability
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 4; i++) {
      const px = 6 + i * 6;
      const py = barrierY + ((tick * 2 + i * 25) % barrierH);
      ctx.fillRect(px, Math.round(py), 3, 3);
    }
    ctx.globalAlpha = 1.0;

    // Open gate pillars on sides
    ctx.fillStyle = color;
    ctx.fillRect(2, barrierY, 3, barrierH);
    ctx.fillRect(width - 5, barrierY, 3, barrierH);

    // Open banner badge
    const badgeY = barrierY + barrierH / 2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(2, badgeY - 12, width - 4, 24);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OPEN', width / 2, badgeY);
  }

  // Measurement effect overlay
  if (isMeasuring) {
    const ringRadius = 10 + measureProgress * 30;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws the 16-bit futuristic platforms and background
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  tileX: number,
  tileY: number,
  tileSize: number,
  hasTop: boolean,
  hasBottom: boolean,
  hasLeft: boolean,
  hasRight: boolean
) {
  const x = tileX * tileSize;
  const y = tileY * tileSize;

  // Platform body
  ctx.fillStyle = '#1e293b'; // Slate 800
  ctx.fillRect(x, y, tileSize, tileSize);

  // Inner texture grid
  ctx.fillStyle = '#0f172a'; // Slate 900
  ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

  // Top metallic walking surface
  if (!hasTop) {
    ctx.fillStyle = '#38bdf8'; // Cyan accent trim
    ctx.fillRect(x, y, tileSize, 2);
    ctx.fillStyle = '#94a3b8'; // Metallic bevel
    ctx.fillRect(x, y + 2, tileSize, 3);
  }

  // Left bevel
  if (!hasLeft) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y, 2, tileSize);
  }

  // Right bevel
  if (!hasRight) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + tileSize - 2, y, 2, tileSize);
  }

  // Subtle sci-fi circuit tech dot in center
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 14, y + 14, 4, 4);
}
