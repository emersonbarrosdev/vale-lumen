import { BurstParticle } from '../../../domain/combat/burst-particle.model';
import { SpecialExplosion } from '../../../domain/combat/special-explosion.model';
import { SpecialStrike } from '../../../domain/combat/special-strike.model';

export function drawSpecialStrikes(
  ctx: CanvasRenderingContext2D,
  specialStrikes: SpecialStrike[],
): void {
  for (const strike of specialStrikes) {
    const lifeRatio = strike.life / strike.maxLife;
    const alpha = Math.max(0, Math.min(1, lifeRatio));

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = `rgba(130, 232, 255, ${0.15 * alpha})`;
    ctx.lineWidth = strike.width * 1.9;
    drawPolyline(ctx, strike.points);

    ctx.strokeStyle = `rgba(255, 238, 176, ${0.24 * alpha})`;
    ctx.lineWidth = strike.width * 1.1;
    drawPolyline(ctx, strike.points);

    ctx.strokeStyle = `rgba(130, 232, 255, ${0.95 * alpha})`;
    ctx.lineWidth = Math.max(2, strike.width * 0.35);
    drawPolyline(ctx, strike.points);

    ctx.restore();
  }
}

export function drawSpecialExplosions(
  ctx: CanvasRenderingContext2D,
  specialExplosions: SpecialExplosion[],
): void {
  for (const explosion of specialExplosions) {
    const lifeRatio = Math.max(0, explosion.life / explosion.maxLife);
    const alpha = Math.min(1, lifeRatio);

    ctx.save();

    const outerGlow = ctx.createRadialGradient(
      explosion.x,
      explosion.y,
      Math.max(2, explosion.radius * 0.1),
      explosion.x,
      explosion.y,
      Math.max(8, explosion.radius),
    );
    outerGlow.addColorStop(0, `rgba(255, 250, 220, ${0.4 * alpha})`);
    outerGlow.addColorStop(0.18, `rgba(255, 177, 85, ${0.6 * alpha})`);
    outerGlow.addColorStop(0.45, `rgba(130, 232, 255, ${0.34 * alpha})`);
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
    ctx.fill();

    const innerCore = ctx.createRadialGradient(
      explosion.x,
      explosion.y,
      1,
      explosion.x,
      explosion.y,
      Math.max(6, explosion.radius * 0.42),
    );
    innerCore.addColorStop(0, `rgba(255, 249, 210, ${0.82 * alpha})`);
    innerCore.addColorStop(0.34, `rgba(255, 181, 92, ${0.7 * alpha})`);
    innerCore.addColorStop(1, 'rgba(255, 130, 68, 0)');

    ctx.fillStyle = innerCore;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius * 0.46, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 237, 179, ${0.75 * alpha})`;
    ctx.lineWidth = Math.max(2, explosion.radius * 0.04);
    ctx.beginPath();
    ctx.arc(
      explosion.x,
      explosion.y,
      Math.max(6, explosion.radius * 0.72),
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    ctx.strokeStyle = `rgba(130, 232, 255, ${0.45 * alpha})`;
    ctx.lineWidth = Math.max(1.5, explosion.radius * 0.018);
    ctx.beginPath();
    ctx.arc(
      explosion.x,
      explosion.y,
      Math.max(8, explosion.radius * 0.92),
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    ctx.restore();
  }
}

export function drawBurstParticles(
  ctx: CanvasRenderingContext2D,
  burstParticles: BurstParticle[],
): void {
  for (const particle of burstParticles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);

    ctx.fillStyle = applyAlphaToColor(particle.color, alpha);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
): void {
  if (!points.length) {
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }

  ctx.stroke();
}

function applyAlphaToColor(color: string, alpha: number): string {
  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\((.+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
  }

  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }

  return color;
}
