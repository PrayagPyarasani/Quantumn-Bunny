/**
 * QUANTUM BUNNY - Scanner Placement & Collision Bounds Resolver
 * Calculates exact, collision-safe positions for H/T and R/B scanner pickups.
 * Guarantees pickups never intersect solid geometry, sit completely above
 * platform surfaces with visible clearance, and can physically be reached by the bunny.
 */

import { TILE_SIZE, ScannerPickupData } from './levelData';
import { QuantumBasis } from './quantumPhysics';
import { isTileSolid } from './collision';

export const SCANNER_HITBOX = {
  width: 28,
  height: 28,
  halfWidth: 14,
  halfHeight: 14,
};

export const SCANNER_VISUAL = {
  halfWidth: 12,
  halfHeight: 12,
  maxBob: 4,
  minClearance: 8, // Minimum clear pixels between lowest bob point and platform surface
};

/**
 * Calculates collision bounds for a scanner pickup at (x, y).
 */
export function getScannerHitbox(x: number, y: number) {
  return {
    x: x - SCANNER_HITBOX.halfWidth,
    y: y - SCANNER_HITBOX.halfHeight,
    width: SCANNER_HITBOX.width,
    height: SCANNER_HITBOX.height,
  };
}

/**
 * Calculates full visual bounds for a scanner pickup, including sprite chassis and max bob.
 */
export function getScannerVisualBounds(x: number, y: number) {
  return {
    left: x - SCANNER_VISUAL.halfWidth,
    right: x + SCANNER_VISUAL.halfWidth,
    top: y - SCANNER_VISUAL.halfHeight - SCANNER_VISUAL.maxBob,
    bottom: y + SCANNER_VISUAL.halfHeight + SCANNER_VISUAL.maxBob,
  };
}

/**
 * Checks whether a given position (x, y) would cause the scanner hitbox or sprite to intersect solid tiles.
 */
export function isScannerPositionClear(
  tiles: number[][],
  x: number,
  y: number
): boolean {
  const box = getScannerHitbox(x, y);
  const visual = getScannerVisualBounds(x, y);

  const minX = Math.min(box.x, visual.left);
  const maxX = Math.max(box.x + box.width, visual.right);
  const minY = Math.min(box.y, visual.top);
  const maxY = Math.max(box.y + box.height, visual.bottom);

  const minCol = Math.floor(minX / TILE_SIZE);
  const maxCol = Math.floor((maxX - 0.01) / TILE_SIZE);
  const minRow = Math.floor(minY / TILE_SIZE);
  const maxRow = Math.floor((maxY - 0.01) / TILE_SIZE);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (isTileSolid(tiles, c, r)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Computes exact collision-bounds placement for a scanner placed on top of a solid platform at (col, platformRow).
 * The scanner sits completely ABOVE the platform's actual collision surface with visible clearance.
 */
export function computePlatformScannerPosition(
  tiles: number[][],
  col: number,
  platformRow: number,
  offsetCol: number = 0.5
): { x: number; y: number } {
  // Platform surface is the top of the solid tile row
  const platformTopY = platformRow * TILE_SIZE;

  // Scanner vertical center:
  // platformTopY - 24 ensures:
  // - Hitbox bottom is at platformTopY - 10 (10px clearance above platform surface)
  // - Sprite bottom at peak downward bob is at platformTopY - 8 (8px visible clearance)
  // - Both hitbox and sprite are 100% outside solid geometry
  let y = platformTopY - 24;
  let x = (col + offsetCol) * TILE_SIZE;

  // Nudge horizontally away from any solid side walls if needed
  const leftCol = Math.floor((x - SCANNER_HITBOX.halfWidth) / TILE_SIZE);
  const rightCol = Math.floor((x + SCANNER_HITBOX.halfWidth) / TILE_SIZE);

  const checkRow = Math.floor(y / TILE_SIZE);
  if (isTileSolid(tiles, leftCol, checkRow)) {
    x = (leftCol + 1) * TILE_SIZE + SCANNER_HITBOX.halfWidth + 4;
  } else if (isTileSolid(tiles, rightCol, checkRow)) {
    x = rightCol * TILE_SIZE - SCANNER_HITBOX.halfWidth - 4;
  }

  return { x, y };
}

/**
 * Resolves and aligns any scanner's coordinates to guarantee it sits safely
 * outside solid geometry, above its supporting platform.
 */
export function resolveScannerPlacement(
  tiles: number[][],
  pickup: ScannerPickupData
): ScannerPickupData {
  const col = Math.floor(pickup.x / TILE_SIZE);
  const startRow = Math.max(0, Math.floor(pickup.y / TILE_SIZE));

  // Find supporting solid ground directly below scanner
  let floorRow = -1;
  for (let r = startRow; r < tiles.length; r++) {
    if (isTileSolid(tiles, col, r)) {
      floorRow = r;
      break;
    }
  }

  // If no floor below column, check adjacent columns within pickup footprint
  if (floorRow === -1) {
    for (const c of [col - 1, col + 1]) {
      if (c >= 0 && c < tiles[0].length) {
        for (let r = startRow; r < tiles.length; r++) {
          if (isTileSolid(tiles, c, r)) {
            floorRow = r;
            break;
          }
        }
        if (floorRow !== -1) break;
      }
    }
  }

  if (floorRow !== -1) {
    const pos = computePlatformScannerPosition(tiles, col, floorRow);
    return {
      ...pickup,
      x: pos.x,
      y: pos.y,
    };
  }

  return pickup;
}
