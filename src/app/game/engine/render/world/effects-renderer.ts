import { BurstParticle } from '../../../domain/combat/burst-particle.model';
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
