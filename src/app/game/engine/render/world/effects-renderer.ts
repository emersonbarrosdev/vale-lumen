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
    const isMega = strike.theme === 'heroMegaSpecial';

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isMega) {
      ctx.strokeStyle = `rgba(255, 116, 52, ${0.2 * alpha})`;
      ctx.lineWidth = strike.width * 2.3;
      drawPolyline(ctx, strike.points);

      ctx.strokeStyle = `rgba(255, 214, 144, ${0.34 * alpha})`;
      ctx.lineWidth = strike.width * 1.4;
      drawPolyline(ctx, strike.points);

      ctx.strokeStyle = `rgba(255, 90, 36, ${0.95 * alpha})`;
      ctx.lineWidth = Math.max(3, strike.width * 0.46);
      drawPolyline(ctx, strike.points);
    } else {
      ctx.strokeStyle = `rgba(130, 232, 255, ${0.15 * alpha})`;
      ctx.lineWidth = strike.width * 1.9;
      drawPolyline(ctx, strike.points);

      ctx.strokeStyle = `rgba(255, 238, 176, ${0.24 * alpha})`;
      ctx.lineWidth = strike.width * 1.1;
      drawPolyline(ctx, strike.points);

      ctx.strokeStyle = `rgba(130, 232, 255, ${0.95 * alpha})`;
      ctx.lineWidth = Math.max(2, strike.width * 0.35);
      drawPolyline(ctx, strike.points);
    }

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
    const isMega = (explosion as SpecialExplosion & { theme?: string }).theme === 'heroMegaSpecial';
    const flicker = 0.92 + Math.sin(performance.now() * 0.028 + explosion.x * 0.01) * 0.08;
    const outerRadius = explosion.radius * flicker;
    const coreRadius = Math.max(6, explosion.radius * (isMega ? 0.48 : 0.42));
    const ringRadius = Math.max(8, explosion.radius * 0.74);
    const sparkCount = isMega ? 12 : 8;

    ctx.save();

    const outerGlow = ctx.createRadialGradient(
      explosion.x,
      explosion.y,
      Math.max(2, outerRadius * 0.08),
      explosion.x,
      explosion.y,
      Math.max(10, outerRadius),
    );

    if (isMega) {
      outerGlow.addColorStop(0, `rgba(255, 248, 220, ${0.54 * alpha})`);
      outerGlow.addColorStop(0.16, `rgba(255, 130, 60, ${0.76 * alpha})`);
      outerGlow.addColorStop(0.44, `rgba(255, 196, 120, ${0.42 * alpha})`);
      outerGlow.addColorStop(0.72, `rgba(255, 112, 48, ${0.16 * alpha})`);
      outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      outerGlow.addColorStop(0, `rgba(255, 250, 220, ${0.42 * alpha})`);
      outerGlow.addColorStop(0.16, `rgba(255, 183, 94, ${0.66 * alpha})`);
      outerGlow.addColorStop(0.4, `rgba(130, 232, 255, ${0.34 * alpha})`);
      outerGlow.addColorStop(0.72, `rgba(255, 146, 70, ${0.12 * alpha})`);
      outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    }

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    const innerCore = ctx.createRadialGradient(
      explosion.x,
      explosion.y,
      1,
      explosion.x,
      explosion.y,
      coreRadius,
    );

    if (isMega) {
      innerCore.addColorStop(0, `rgba(255, 248, 230, ${0.98 * alpha})`);
      innerCore.addColorStop(0.2, `rgba(255, 212, 132, ${0.92 * alpha})`);
      innerCore.addColorStop(0.46, `rgba(255, 142, 66, ${0.82 * alpha})`);
      innerCore.addColorStop(1, 'rgba(255, 84, 30, 0)');
    } else {
      innerCore.addColorStop(0, `rgba(255, 250, 232, ${0.9 * alpha})`);
      innerCore.addColorStop(0.22, `rgba(255, 219, 142, ${0.82 * alpha})`);
      innerCore.addColorStop(0.48, `rgba(255, 176, 88, ${0.76 * alpha})`);
      innerCore.addColorStop(1, 'rgba(255, 130, 68, 0)');
    }

    ctx.fillStyle = innerCore;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isMega
      ? `rgba(255, 230, 176, ${0.88 * alpha})`
      : `rgba(255, 240, 184, ${0.8 * alpha})`;
    ctx.lineWidth = Math.max(2, explosion.radius * 0.045);
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = isMega
      ? `rgba(255, 128, 64, ${0.54 * alpha})`
      : `rgba(130, 232, 255, ${0.46 * alpha})`;
    ctx.lineWidth = Math.max(1.5, explosion.radius * 0.02);
    ctx.beginPath();
    ctx.arc(
      explosion.x,
      explosion.y,
      Math.max(10, explosion.radius * 0.94),
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    drawExplosionSparks(
      ctx,
      explosion.x,
      explosion.y,
      explosion.radius,
      sparkCount,
      alpha,
      isMega,
    );

    drawExplosionEmbers(
      ctx,
      explosion.x,
      explosion.y,
      explosion.radius,
      sparkCount,
      alpha,
      isMega,
    );

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

function drawExplosionSparks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  count: number,
  alpha: number,
  isMega: boolean,
): void {
  const time = performance.now() * 0.02;
  const sparkColor = isMega
    ? `rgba(255, 238, 196, ${0.82 * alpha})`
    : `rgba(255, 244, 210, ${0.74 * alpha})`;

  ctx.strokeStyle = sparkColor;
  ctx.lineCap = 'round';

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + time * (isMega ? 0.14 : 0.1);
    const inner = radius * (isMega ? 0.2 : 0.24);
    const outer = radius * (isMega ? 0.52 : 0.44);
    const wobble = Math.sin(time + index * 1.1) * radius * 0.03;

    const x1 = x + Math.cos(angle) * inner;
    const y1 = y + Math.sin(angle) * inner;
    const x2 = x + Math.cos(angle) * (outer + wobble);
    const y2 = y + Math.sin(angle) * (outer + wobble);

    ctx.lineWidth = Math.max(1.2, radius * (isMega ? 0.022 : 0.016));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawExplosionEmbers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  count: number,
  alpha: number,
  isMega: boolean,
): void {
  const time = performance.now() * 0.012;
  const emberColor = isMega
    ? `rgba(255, 132, 56, ${0.72 * alpha})`
    : `rgba(255, 177, 92, ${0.66 * alpha})`;
  const secondaryColor = isMega
    ? `rgba(255, 212, 136, ${0.48 * alpha})`
    : `rgba(130, 232, 255, ${0.34 * alpha})`;

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + time * 0.06;
    const distance = radius * (0.3 + ((index % 3) * 0.12));
    const px = x + Math.cos(angle) * distance;
    const py = y + Math.sin(angle) * distance;

    ctx.fillStyle = emberColor;
    ctx.beginPath();
    ctx.arc(
      px,
      py,
      Math.max(1.5, radius * (isMega ? 0.022 : 0.016)),
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(
      px + Math.cos(angle + 0.7) * 3,
      py + Math.sin(angle + 0.7) * 3,
      Math.max(1, radius * 0.01),
      0,
      Math.PI * 2,
    );
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
