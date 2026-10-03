/**
 * QUANTUM BUNNY - 2D Side-Scrolling Camera
 * Follows bunny horizontally and vertically with smooth damping and level bounds.
 */

export class Camera {
  public x = 0;
  public y = 0;
  public viewportWidth = 640;
  public viewportHeight = 360;

  // Smoothing - responsive vertical tracking prevents hiding platforms during jumps
  private readonly lerpFactorX = 0.10;
  private readonly lerpFactorY = 0.14;
  private readonly lookAheadDist = 28;

  constructor(viewportWidth = 640, viewportHeight = 360) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public setViewport(w: number, h: number) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  public update(
    targetX: number,
    targetY: number,
    facing: 1 | -1,
    levelWidth: number,
    levelHeight: number
  ) {
    // Look ahead slightly in moving direction and frame player comfortably
    const desiredCenterX = targetX + facing * this.lookAheadDist;
    const desiredCenterY = targetY - 28;

    const targetCameraX = desiredCenterX - this.viewportWidth / 2;
    const targetCameraY = desiredCenterY - this.viewportHeight / 2;

    // Smooth lerp with dedicated vertical speed
    this.x += (targetCameraX - this.x) * this.lerpFactorX;
    this.y += (targetCameraY - this.y) * this.lerpFactorY;

    // Clamp within level bounds
    const maxX = Math.max(0, levelWidth - this.viewportWidth);
    const maxY = Math.max(0, levelHeight - this.viewportHeight);

    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));
  }

  public snapTo(
    targetX: number,
    targetY: number,
    levelWidth: number,
    levelHeight: number
  ) {
    this.x = targetX - this.viewportWidth / 2;
    this.y = targetY - this.viewportHeight / 2;

    const maxX = Math.max(0, levelWidth - this.viewportWidth);
    const maxY = Math.max(0, levelHeight - this.viewportHeight);

    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));
  }
}
