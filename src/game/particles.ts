/**
 * QUANTUM BUNNY - Particle FX Engine
 * Lightweight pixel-art particle effects for pickups, quantum scans, and victories.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) {
        p.vy += p.gravity;
      }
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.round(p.x - p.size / 2),
        Math.round(p.y - p.size / 2),
        p.size,
        p.size
      );
      ctx.restore();
    }
  }

  public emitPickupBurst(x: number, y: number, color: string) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.4;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() > 0.5 ? 3 : 2,
        color: Math.random() > 0.3 ? color : '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.floor(Math.random() * 15),
        gravity: 0.1,
      });
    }
  }

  public emitMeasurementAura(x: number, y: number, width: number, height: number, color: string) {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;
      this.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 3,
        color: Math.random() > 0.5 ? color : '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 30,
      });
    }
  }

  public emitAmbientSparkle(x: number, y: number, color: string) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 8;
    this.particles.push({
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.4 - Math.random() * 0.4,
      size: Math.random() > 0.6 ? 2 : 1,
      color: Math.random() > 0.4 ? color : '#ffffff',
      alpha: 0.9,
      life: 0,
      maxLife: 20 + Math.floor(Math.random() * 10),
    });
  }

  public emitCarrotWin(x: number, y: number) {
    const colors = ['#ea580c', '#fb923c', '#fef08a', '#10b981', '#38bdf8'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 45 + Math.floor(Math.random() * 20),
        gravity: 0.12,
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
