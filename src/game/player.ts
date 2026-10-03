/**
 * QUANTUM BUNNY - Player Character & Physics Controller
 * Responsive 16-bit arcade platforming with variable jump, coyote time, and buffering.
 */

import { BunnyAnimationState } from './sprites';
import { resolveMapCollisions, BoundingBox } from './collision';
import { QuantumGateData } from './levelData';
import { sound } from './audio';

export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  useHT: boolean;
  useRB: boolean;
  restart: boolean;
}

export class Player {
  // Dimensions
  public width = 20;
  public height = 26;

  // Position & Velocity
  public x: number;
  public y: number;
  public vx = 0;
  public vy = 0;

  // Movement tuning constants
  private readonly maxSpeed = 4.2;
  private readonly accel = 0.60;
  private readonly airAccel = 0.55;
  private readonly friction = 0.45;
  private readonly airFriction = 0.08;
  private readonly gravity = 0.46;
  private readonly maxFallSpeed = 10.5;
  // Jump impulse gives ~100px max height. With 64px (2 tiles) max platform rise,
  // platform height is ~64% of comfortable jump height, perfectly matching the 60-70% requirement.
  private readonly jumpImpulse = -9.6;

  // State flags
  public onGround = false;
  public facing: 1 | -1 = 1;
  public animState: BunnyAnimationState = 'idle';
  public animTick = 0;

  // Coyote time & Jump buffer (~100-130ms = 8 frames at 60fps)
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private wasOnGround = false;

  // Controls lock during gate measurement
  public isLocked = false;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  public reset(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.animState = 'idle';
    this.animTick = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.wasOnGround = false;
    this.isLocked = false;
  }

  public update(
    input: PlayerInput,
    tiles: number[][],
    gates: QuantumGateData[] | QuantumGateData
  ) {
    this.animTick++;

    if (this.isLocked) {
      // Apply gravity only during lock
      this.vy = Math.min(this.maxFallSpeed, this.vy + this.gravity);
      this.vx *= 0.5;
      const res = resolveMapCollisions(
        { x: this.x, y: this.y, width: this.width, height: this.height },
        this.vx,
        this.vy,
        tiles,
        gates
      );
      this.x = res.x;
      this.y = res.y;
      this.vx = res.vx;
      this.vy = res.vy;
      this.onGround = res.onGround;
      this.animState = 'idle';
      return;
    }

    // 1. Timers (~130ms at 60fps = 8 frames)
    if (this.onGround) {
      this.coyoteTimer = 8; // 8 frames of forgiving grace
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer--;
    }

    if (input.jumpJustPressed) {
      this.jumpBufferTimer = 8; // Buffer for 8 frames (~130ms)
    } else {
      if (this.jumpBufferTimer > 0) this.jumpBufferTimer--;
    }

    // 2. Horizontal Movement with responsive airborne control
    const currentAccel = this.onGround ? this.accel : this.airAccel;
    if (input.left && !input.right) {
      this.facing = -1;
      if (this.vx > 0) this.vx -= this.friction * 1.5; // Quick turn
      this.vx = Math.max(-this.maxSpeed, this.vx - currentAccel);
    } else if (input.right && !input.left) {
      this.facing = 1;
      if (this.vx < 0) this.vx += this.friction * 1.5; // Quick turn
      this.vx = Math.min(this.maxSpeed, this.vx + currentAccel);
    } else {
      // Decelerate / Friction
      const f = this.onGround ? this.friction : this.airFriction;
      if (Math.abs(this.vx) <= f) {
        this.vx = 0;
      } else {
        this.vx -= Math.sign(this.vx) * f;
      }
    }

    // 3. Jump Initiation (buffered or direct)
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = this.jumpImpulse;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.onGround = false;
      sound.playJump();
    }

    // Variable jump height: releasing jump gracefully dampens upward velocity
    if (!input.jump && this.vy < -3.0) {
      this.vy *= 0.65;
    }

    // 4. Gravity
    this.vy = Math.min(this.maxFallSpeed, this.vy + this.gravity);

    // 5. Collision Resolution
    const box: BoundingBox = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    const res = resolveMapCollisions(box, this.vx, this.vy, tiles, gates);
    this.x = res.x;
    this.y = res.y;
    this.vx = res.vx;
    this.vy = res.vy;

    // Land sound trigger
    if (!this.wasOnGround && res.onGround && this.vy >= 0) {
      sound.playLand();
    }
    this.wasOnGround = this.onGround;
    this.onGround = res.onGround;

    // 6. Animation State
    if (!this.onGround) {
      if (this.vy < 0) {
        this.animState = 'jumping';
      } else {
        this.animState = 'falling';
      }
    } else {
      if (Math.abs(this.vx) > 0.4) {
        this.animState = 'running';
      } else {
        this.animState = 'idle';
      }
    }
  }

  public getBoundingBox(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public getCenter(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  public getFeet(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height,
    };
  }
}
