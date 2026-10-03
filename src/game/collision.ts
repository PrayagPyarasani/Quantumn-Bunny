/**
 * QUANTUM BUNNY - Collision Detection System
 * Handles AABB collisions between player, tile grid, and quantum gate barriers.
 */

import { TileType, TILE_SIZE, QuantumGateData } from './levelData';
import { isGateOpen } from './quantumPhysics';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Checks if a specific tile coordinate contains a solid tile
 */
export function isTileSolid(
  tiles: number[][],
  col: number,
  row: number
): boolean {
  if (row < 0 || row >= tiles.length || col < 0 || col >= tiles[0].length) {
    return true; // Out of bounds is solid
  }
  return tiles[row][col] === TileType.SOLID;
}

/**
 * Resolves player collision against tiles and closed quantum gates.
 * Uses separate horizontal and vertical passes to guarantee precision.
 */
export function resolveMapCollisions(
  box: BoundingBox,
  vx: number,
  vy: number,
  tiles: number[][],
  gates: QuantumGateData[] | QuantumGateData
): {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  hitCeiling: boolean;
  hitWall: boolean;
} {
  let newX = box.x + vx;
  let newY = box.y;
  let newVx = vx;
  let newVy = vy;
  let onGround = false;
  let hitCeiling = false;
  let hitWall = false;

  const gateList = Array.isArray(gates) ? gates : [gates];

  // 1. Horizontal resolution
  // Check all gates horizontally if closed or flux-disabled
  for (const gate of gateList) {
    const isLocked = Boolean(gate.initialLocked && !gate.isMeasured);
    const gateIsClosed = gate.isFluxDisabled || !isGateOpen(gate.stateAngle, gate.allowedStates, isLocked);
    if (!gateIsClosed) continue;

    const gateBox: BoundingBox = {
      x: gate.x,
      y: gate.y,
      width: gate.width,
      height: gate.height,
    };

    if (checkAABB({ x: newX, y: box.y, width: box.width, height: box.height }, gateBox)) {
      if (vx > 0) {
        newX = gateBox.x - box.width;
        newVx = 0;
        hitWall = true;
      } else if (vx < 0) {
        newX = gateBox.x + gateBox.width;
        newVx = 0;
        hitWall = true;
      }
    }
  }

  // Check tile grid horizontally
  const minTileX = Math.floor(newX / TILE_SIZE);
  const maxTileX = Math.floor((newX + box.width - 0.01) / TILE_SIZE);
  const minTileY = Math.floor(box.y / TILE_SIZE);
  const maxTileY = Math.floor((box.y + box.height - 0.01) / TILE_SIZE);

  for (let r = minTileY; r <= maxTileY; r++) {
    for (let c = minTileX; c <= maxTileX; c++) {
      if (isTileSolid(tiles, c, r)) {
        if (vx > 0) {
          newX = c * TILE_SIZE - box.width;
          newVx = 0;
          hitWall = true;
        } else if (vx < 0) {
          newX = (c + 1) * TILE_SIZE;
          newVx = 0;
          hitWall = true;
        }
      }
    }
  }

  // 2. Vertical resolution
  newY = box.y + vy;

  // Check all gates vertically if closed or flux-disabled
  for (const gate of gateList) {
    const isLocked = Boolean(gate.initialLocked && !gate.isMeasured);
    const gateIsClosed = gate.isFluxDisabled || !isGateOpen(gate.stateAngle, gate.allowedStates, isLocked);
    if (!gateIsClosed) continue;

    const gateBox: BoundingBox = {
      x: gate.x,
      y: gate.y,
      width: gate.width,
      height: gate.height,
    };

    if (checkAABB({ x: newX, y: newY, width: box.width, height: box.height }, gateBox)) {
      if (vy > 0) {
        newY = gateBox.y - box.height;
        newVy = 0;
        onGround = true;
      } else if (vy < 0) {
        newY = gateBox.y + gateBox.height;
        newVy = 0;
        hitCeiling = true;
      }
    }
  }

  // Check tile grid vertically
  const vMinTileX = Math.floor(newX / TILE_SIZE);
  const vMaxTileX = Math.floor((newX + box.width - 0.01) / TILE_SIZE);
  const vMinTileY = Math.floor(newY / TILE_SIZE);
  const vMaxTileY = Math.floor((newY + box.height - 0.01) / TILE_SIZE);

  for (let r = vMinTileY; r <= vMaxTileY; r++) {
    for (let c = vMinTileX; c <= vMaxTileX; c++) {
      if (isTileSolid(tiles, c, r)) {
        if (vy > 0) {
          newY = r * TILE_SIZE - box.height;
          newVy = 0;
          onGround = true;
        } else if (vy < 0) {
          newY = (r + 1) * TILE_SIZE;
          newVy = 0;
          hitCeiling = true;
        }
      }
    }
  }

  return {
    x: newX,
    y: newY,
    vx: newVx,
    vy: newVy,
    onGround,
    hitCeiling,
    hitWall,
  };
}
