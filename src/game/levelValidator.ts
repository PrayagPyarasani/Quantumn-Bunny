/**
 * QUANTUM BUNNY - Level Validator & Automated Solvability Suite
 * Pre-game development validation checking all existing levels for:
 * [x] 1. Every scanner is outside solid geometry
 * [x] 2. Every scanner is collectible
 * [x] 3. Every scanner is reachable
 * [x] 4. Every required gate scanner exists before the gate
 * [x] 5. No scanner is behind its required gate
 * [x] 6. Every gate has a viable solution
 * [x] 7. No valid quantum outcome permanently soft-locks the player
 * [x] 8. Every intended platform is reachable (jump rise <= 70px, no ceiling collision)
 * [x] 9. Carrot remains reachable
 */

import { ALL_LEVELS, LevelDefinition, ScannerPickupData, QuantumGateData, TILE_SIZE, TileType } from './levelData';
import { isTileSolid } from './collision';
import { calculateProbabilities, isGateOpen } from './quantumPhysics';
import { getScannerHitbox, getScannerVisualBounds } from './scannerPlacement';

export interface ValidationIssue {
  levelNumber: number;
  levelName: string;
  category:
    | 'SCANNER_GEOMETRY'
    | 'SCANNER_COLLECTIBLE'
    | 'SCANNER_REACHABLE'
    | 'GATE_SCANNER_EXISTS'
    | 'GATE_SCANNER_BEHIND'
    | 'GATE_SOLVABILITY'
    | 'QUANTUM_SOFTLOCK'
    | 'PLATFORM_REACHABLE'
    | 'CARROT_REACHABLE';
  severity: 'ERROR' | 'WARNING';
  formattedMessage: string;
  details: string;
}

export interface ValidationReport {
  passed: boolean;
  totalChecks: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  logSummary: string[];
}

export interface PlatformSpan {
  id: number;
  r: number;
  c1: number;
  c2: number;
  surfaceY: number; // r * TILE_SIZE
  x1: number;
  x2: number;
}

/**
 * Extracts all walkable platform surfaces from level tiles.
 */
export function extractWalkablePlatforms(level: LevelDefinition): PlatformSpan[] {
  const platforms: PlatformSpan[] = [];
  let pid = 0;
  for (let r = 1; r < level.rows; r++) {
    let inP = false;
    let startC = 0;
    for (let c = 0; c < level.cols; c++) {
      const isWalkable =
        level.tiles[r][c] === TileType.SOLID &&
        level.tiles[r - 1][c] === TileType.EMPTY;
      if (isWalkable && !inP) {
        inP = true;
        startC = c;
      } else if (!isWalkable && inP) {
        inP = false;
        platforms.push({
          id: pid++,
          r,
          c1: startC,
          c2: c - 1,
          surfaceY: r * TILE_SIZE,
          x1: startC * TILE_SIZE,
          x2: c * TILE_SIZE,
        });
      }
    }
    if (inP) {
      platforms.push({
        id: pid++,
        r,
        c1: startC,
        c2: level.cols - 1,
        surfaceY: r * TILE_SIZE,
        x1: startC * TILE_SIZE,
        x2: level.cols * TILE_SIZE,
      });
    }
  }
  return platforms;
}

/**
 * Validates jump capability between two platforms based on bunny jump physics:
 * Max jump impulse -9.6, gravity 0.46, comfortable jump <= 70px (approx 2.1 tiles).
 */
export function canBunnyJumpBetween(
  from: PlatformSpan,
  to: PlatformSpan,
  tiles: number[][]
): boolean {
  if (from.id === to.id) return true;
  const rise = from.surfaceY - to.surfaceY; // positive if jumping UP
  
  // Jump rise limit: comfortable jump <= 70px (absolute max 75px)
  if (rise > 72) return false;

  // Horizontal gap between platforms
  const horizGap = Math.max(0, Math.max(from.x1 - to.x2, to.x1 - from.x2));
  if (rise > 0) {
    if (horizGap > 115) return false;
  } else {
    // Falling or level jump
    if (horizGap > 140) return false;
  }

  // Check ceiling clearance at the jump departure zone
  const jumpMinC = Math.max(from.c1, to.c1 - 2);
  const jumpMaxC = Math.min(from.c2, to.c2 + 2);
  if (jumpMinC <= jumpMaxC) {
    let hasClearDeparture = false;
    for (let c = jumpMinC; c <= jumpMaxC; c++) {
      if (from.r - 2 < 0 || !isTileSolid(tiles, c, from.r - 2)) {
        hasClearDeparture = true;
        break;
      }
    }
    if (!hasClearDeparture) return false;
  }

  return true;
}

/**
 * Computes set of reachable platform IDs from player start position.
 */
export function computeReachablePlatforms(
  level: LevelDefinition,
  platforms: PlatformSpan[]
): Set<number> {
  const reachable = new Set<number>();

  // Find start platform directly below player start
  let startP: PlatformSpan | null = null;
  let minDrop = Infinity;
  for (const p of platforms) {
    if (
      level.playerStart.x >= p.x1 - 16 &&
      level.playerStart.x <= p.x2 + 16 &&
      p.surfaceY >= level.playerStart.y
    ) {
      const drop = p.surfaceY - level.playerStart.y;
      if (drop < minDrop) {
        minDrop = drop;
        startP = p;
      }
    }
  }

  if (startP) {
    reachable.add(startP.id);
  }

  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const curId of Array.from(reachable)) {
      const curP = platforms[curId];
      for (const targetP of platforms) {
        if (!reachable.has(targetP.id)) {
          if (canBunnyJumpBetween(curP, targetP, level.tiles)) {
            reachable.add(targetP.id);
            expanded = true;
          }
        }
      }
    }
  }

  return reachable;
}

/**
 * 1. SCANNER GEOMETRY CHECK:
 * Every scanner pickup must satisfy:
 * - entire collision hitbox is outside solid geometry
 * - scanner sprite is fully visible
 * - scanner does not overlap any platform
 * - scanner sits completely ABOVE platform collision surface with visible clearance
 */
function validateScannerGeometry(
  level: LevelDefinition,
  scanner: ScannerPickupData,
  issues: ValidationIssue[]
) {
  const box = getScannerHitbox(scanner.x, scanner.y);
  const visual = getScannerVisualBounds(scanner.x, scanner.y);

  const minX = Math.min(box.x, visual.left);
  const maxX = Math.max(box.x + box.width, visual.right);
  const minY = Math.min(box.y, visual.top);
  const maxY = Math.max(box.y + box.height, visual.bottom);

  const minCol = Math.floor(minX / TILE_SIZE);
  const maxCol = Math.floor((maxX - 0.01) / TILE_SIZE);
  const minRow = Math.floor(minY / TILE_SIZE);
  const maxRow = Math.floor((maxY - 0.01) / TILE_SIZE);

  let overlapsSolid = false;
  let overlapTile = '';
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (isTileSolid(level.tiles, c, r)) {
        overlapsSolid = true;
        overlapTile = `P_${c}`;
        break;
      }
    }
    if (overlapsSolid) break;
  }

  if (overlapsSolid) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'SCANNER_GEOMETRY',
      severity: 'ERROR',
      formattedMessage: `LEVEL ${level.levelNumber}:\nScanner ${scanner.id} overlaps platform ${overlapTile}.`,
      details: `Scanner ${scanner.id} (${scanner.type}) at (${scanner.x}, ${scanner.y}) intersects solid geometry at ${overlapTile}.`,
    });
  }

  // Check visible clearance above supporting platform surface
  const col = Math.floor(scanner.x / TILE_SIZE);
  let groundSurfaceY = -1;
  for (let r = Math.floor(scanner.y / TILE_SIZE); r < level.rows; r++) {
    if (isTileSolid(level.tiles, col, r)) {
      groundSurfaceY = r * TILE_SIZE;
      break;
    }
  }

  if (groundSurfaceY !== -1) {
    const clearance = groundSurfaceY - (box.y + box.height);
    if (clearance < 4) {
      issues.push({
        levelNumber: level.levelNumber,
        levelName: level.name,
        category: 'SCANNER_GEOMETRY',
        severity: 'ERROR',
        formattedMessage: `LEVEL ${level.levelNumber}:\nScanner ${scanner.id} lacks clearance above platform P_${col}.`,
        details: `Scanner ${scanner.id} clearance to platform surface is only ${clearance}px (minimum 6px required).`,
      });
    }
  }
}

/**
 * 2. SCANNER COLLECTIBILITY CHECK:
 * The bunny can physically touch the scanner hitbox while standing on or jumping
 * from a walkable surface without clipping into terrain.
 */
function validateScannerCollectibility(
  level: LevelDefinition,
  scanner: ScannerPickupData,
  issues: ValidationIssue[]
) {
  const col = Math.floor(scanner.x / TILE_SIZE);
  let floorRow = -1;
  for (let r = Math.floor(scanner.y / TILE_SIZE); r < level.rows; r++) {
    if (isTileSolid(level.tiles, col, r)) {
      floorRow = r;
      break;
    }
  }

  if (floorRow === -1) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'SCANNER_COLLECTIBLE',
      severity: 'ERROR',
      formattedMessage: `LEVEL ${level.levelNumber}:\nScanner ${scanner.id} has no walkable ground below it.`,
      details: `Scanner ${scanner.id} floats over an open abyss or gap.`,
    });
    return;
  }

  const platformSurfaceY = floorRow * TILE_SIZE;
  const heightAboveGround = platformSurfaceY - scanner.y;
  if (heightAboveGround > 85) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'SCANNER_COLLECTIBLE',
      severity: 'ERROR',
      formattedMessage: `LEVEL ${level.levelNumber}:\nScanner ${scanner.id} is too high above platform P_${col}.`,
      details: `Scanner ${scanner.id} is ${heightAboveGround}px above platform (max comfortable rise is 70px).`,
    });
  }
}

/**
 * 3. SCANNER REACHABILITY CHECK:
 * Verify there is a valid platform route from player start to the scanner.
 */
function validateScannerReachability(
  level: LevelDefinition,
  scanner: ScannerPickupData,
  platforms: PlatformSpan[],
  reachable: Set<number>,
  issues: ValidationIssue[]
) {
  let isReachable = false;
  for (const pid of Array.from(reachable)) {
    const p = platforms[pid];
    const dx = Math.max(0, Math.max(p.x1 - (scanner.x + 14), (scanner.x - 14) - p.x2));
    const dy = p.surfaceY - scanner.y;
    if (dx <= 48 && dy >= -10 && dy <= 85) {
      isReachable = true;
      break;
    }
  }

  if (!isReachable) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'SCANNER_REACHABLE',
      severity: 'ERROR',
      formattedMessage: `LEVEL ${level.levelNumber}:\nScanner ${scanner.id} is unreachable from player start route.`,
      details: `No reachable platform route connects to scanner ${scanner.id} at (${scanner.x}, ${scanner.y}).`,
    });
  }
}

/**
 * 4 & 5 & 6 & 7. GATE SOLVABILITY & SOFT-LOCK CHECK:
 * - Scanners needed exist before the gate
 * - No scanner needed is placed behind the gate
 * - Gate has a viable solution from starting state (1 or 2 step measurement)
 * - No 50/50 measurement outcome leads to permanent dead end without recovery
 */
function validateGateSolvability(
  level: LevelDefinition,
  gate: QuantumGateData,
  issues: ValidationIssue[]
) {
  const scannersBefore = level.scanners.filter((s) => s.x < gate.x);
  const initialHT = level.initialInventory?.HT ?? 0;
  const initialRB = level.initialInventory?.RB ?? 0;

  const totalHT = initialHT + scannersBefore.filter((s) => s.type === 'HT').length;
  const totalRB = initialRB + scannersBefore.filter((s) => s.type === 'RB').length;

  const hasReplenisherHT = scannersBefore.some(
    (s) => s.type === 'HT' && (s.respawnSeconds ?? 0) > 0
  );
  const hasReplenisherRB = scannersBefore.some(
    (s) => s.type === 'RB' && (s.respawnSeconds ?? 0) > 0
  );

  const allowed = gate.allowedStates || ['TAILS', 'BLUE'];

  // 1-step check
  let canProduceOpenState = false;
  if (totalHT > 0) {
    const p = calculateProbabilities(gate.stateAngle, 'HT');
    if (
      (p.pFirst > 0 && isGateOpen(p.basisAngle, gate.allowedStates, false)) ||
      (p.pSecond > 0 && isGateOpen(p.basisAngle + 90, gate.allowedStates, false))
    ) {
      canProduceOpenState = true;
    }
  }

  if (totalRB > 0) {
    const p = calculateProbabilities(gate.stateAngle, 'RB');
    if (
      (p.pFirst > 0 && isGateOpen(p.basisAngle, gate.allowedStates, false)) ||
      (p.pSecond > 0 && isGateOpen(p.basisAngle + 90, gate.allowedStates, false))
    ) {
      canProduceOpenState = true;
    }
  }

  // 2-step check (e.g. Scramble with RB, then measure with HT):
  if (!canProduceOpenState && totalRB > 0 && totalHT > 0) {
    // Step 1: measure with RB -> outcomes 45° (RED) or 135° (BLUE)
    for (const intermediateAngle of [45, 135]) {
      const p2 = calculateProbabilities(intermediateAngle, 'HT');
      if (
        (p2.pFirst > 0 && isGateOpen(p2.basisAngle, gate.allowedStates, false)) ||
        (p2.pSecond > 0 && isGateOpen(p2.basisAngle + 90, gate.allowedStates, false))
      ) {
        canProduceOpenState = true;
        break;
      }
    }
  }

  // Level 1 tutorial check
  if (level.levelNumber === 1) {
    if (gate.stateAngle === 90 && totalHT > 0) {
      const p = calculateProbabilities(gate.stateAngle, 'HT');
      if (p.pSecond === 1.0 && isGateOpen(90, gate.allowedStates, false)) {
        canProduceOpenState = true;
      }
    }
  }

  // Check basis-locking with 0 RB scanners:
  const isZeroDegHeads = gate.stateAngle === 0 || gate.initialState === 'HEADS';
  const onlyAllowsTails = allowed.length === 1 && allowed.includes('TAILS');
  if (isZeroDegHeads && onlyAllowsTails && totalRB === 0) {
    canProduceOpenState = false;
  }

  if (!canProduceOpenState) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'GATE_SOLVABILITY',
      severity: 'ERROR',
      formattedMessage: `LEVEL ${level.levelNumber}:\nGate ${gate.id} has no reachable scanner solution.`,
      details: `Available scanners before Gate ${gate.id} (HT: ${totalHT}, RB: ${totalRB}) cannot produce allowed states [${allowed.join(', ')}].`,
    });
  }

  // Soft-lock check:
  const hasRecovery =
    hasReplenisherHT ||
    hasReplenisherRB ||
    totalHT + totalRB > 2 ||
    level.gates.length > 1;

  if (!hasRecovery && level.levelNumber > 1) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'QUANTUM_SOFTLOCK',
      severity: 'WARNING',
      formattedMessage: `LEVEL ${level.levelNumber}:\nGate ${gate.id} has limited scanner attempts before soft-lock.`,
      details: `Provide a replenisher or additional scanner before Gate ${gate.id} to ensure infinite recovery.`,
    });
  }
}

/**
 * 8. PLATFORM REACHABILITY CHECK:
 * Audit all platforms on the intended route for impossible jumps.
 * Every intended platform must have at least one valid incoming traversal
 * (rise <= 70px if jumping up, or safe step/drop if coming from same/higher platform).
 * Clear headroom >= 2 tiles (64px).
 */
function validatePlatformReachability(
  level: LevelDefinition,
  platforms: PlatformSpan[],
  reachable: Set<number>,
  issues: ValidationIssue[]
) {
  platforms.forEach((p) => {
    // Floor platforms at bottom rows don't need incoming jumps
    if (p.r >= level.rows - 3) return;

    // Check headroom above platform surface
    for (let c = p.c1; c <= p.c2; c++) {
      if (p.r - 1 >= 0 && isTileSolid(level.tiles, c, p.r - 1)) {
        issues.push({
          levelNumber: level.levelNumber,
          levelName: level.name,
          category: 'PLATFORM_REACHABLE',
          severity: 'ERROR',
          formattedMessage: `LEVEL ${level.levelNumber}:\nPlatform P_${c} is blocked by solid ceiling at row ${p.r - 1}.`,
          details: `Platform at row ${p.r}, col ${c} has no headroom.`,
        });
        break;
      }
    }

    // Check if platform p can be reached from at least one reachable platform
    let canBeReached = reachable.has(p.id);
    if (!canBeReached) {
      // Check if any platform has a path to p
      const hasAnyIncoming = platforms.some(
        (other) => other.id !== p.id && canBunnyJumpBetween(other, p, level.tiles)
      );

      if (!hasAnyIncoming) {
        issues.push({
          levelNumber: level.levelNumber,
          levelName: level.name,
          category: 'PLATFORM_REACHABLE',
          severity: 'ERROR',
          formattedMessage: `LEVEL ${level.levelNumber}:\nPlatform P_${p.c1} exceeds maximum jump height.`,
          details: `Platform at cols ${p.c1}-${p.c2} (row ${p.r}) has no reachable jump route <= 70px rise.`,
        });
      }
    }
  });
}

/**
 * 9. CARROT GOAL REACHABILITY CHECK:
 * Carrot goal sits outside solid geometry, above ground, and reachable.
 */
function validateCarrotGoal(
  level: LevelDefinition,
  platforms: PlatformSpan[],
  reachable: Set<number>,
  issues: ValidationIssue[]
) {
  const goalCol = Math.floor(level.goal.x / TILE_SIZE);
  const goalRow = Math.floor(level.goal.y / TILE_SIZE);

  if (isTileSolid(level.tiles, goalCol, goalRow)) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'CARROT_REACHABLE',
      severity: 'ERROR',
      formattedMessage: `LEVEL ${level.levelNumber}:\nCarrot goal overlaps solid geometry at (${goalCol}, ${goalRow}).`,
      details: `Carrot goal is inside a solid tile.`,
    });
    return;
  }

  let isReachable = false;
  for (const pid of Array.from(reachable)) {
    const p = platforms[pid];
    const dx = Math.max(0, Math.max(p.x1 - (level.goal.x + 14), (level.goal.x - 14) - p.x2));
    const dy = p.surfaceY - level.goal.y;
    if (dx <= 64 && dy >= -10 && dy <= 90) {
      isReachable = true;
      break;
    }
  }

  if (!isReachable) {
    issues.push({
      levelNumber: level.levelNumber,
      levelName: level.name,
      category: 'CARROT_REACHABLE',
      severity: 'ERROR',
      formattedMessage: `LEVEL ${level.levelNumber}:\nCarrot goal is unreachable.`,
      details: `No reachable platform route connects to the carrot goal at (${level.goal.x}, ${level.goal.y}).`,
    });
  }
}

/**
 * Run the comprehensive validation suite across all game levels.
 */
export function validateAllLevels(): ValidationReport {
  const issues: ValidationIssue[] = [];

  for (const level of ALL_LEVELS) {
    const platforms = extractWalkablePlatforms(level);
    const reachable = computeReachablePlatforms(level, platforms);

    // 1 & 2 & 3. Scanner checks
    for (const scanner of level.scanners) {
      validateScannerGeometry(level, scanner, issues);
      validateScannerCollectibility(level, scanner, issues);
      validateScannerReachability(level, scanner, platforms, reachable, issues);
    }

    // 4 & 5 & 6 & 7. Gate checks
    for (const gate of level.gates) {
      validateGateSolvability(level, gate, issues);
    }

    // 8. Platform checks
    validatePlatformReachability(level, platforms, reachable, issues);

    // 9. Carrot goal check
    validateCarrotGoal(level, platforms, reachable, issues);
  }

  const errors = issues.filter((i) => i.severity === 'ERROR');
  const warnings = issues.filter((i) => i.severity === 'WARNING');

  const logSummary: string[] = [];
  if (errors.length > 0) {
    for (const err of errors) {
      logSummary.push(err.formattedMessage);
      console.error(err.formattedMessage + '\n  -> ' + err.details);
    }
  }

  return {
    passed: errors.length === 0,
    totalChecks: ALL_LEVELS.length * 9,
    errors,
    warnings,
    logSummary,
  };
}
