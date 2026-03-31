import { BurstParticle } from '../../domain/combat/burst-particle.model';
import { SpecialStrike } from '../../domain/combat/special-strike.model';
import { Chest } from '../../domain/world/chest.model';
import { Collectible } from '../../domain/world/collectible.model';
import { Platform } from '../../domain/world/platform.model';

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
): void {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, '#131620');
  skyGradient.addColorStop(0.25, '#0d1017');
  skyGradient.addColorStop(0.55, '#090b10');
  skyGradient.addColorStop(1, '#040507');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const moonX = 980 - cameraX * 0.08;
  const moonY = 128;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 200);
  moonGlow.addColorStop(0, 'rgba(255, 196, 118, 0.15)');
  moonGlow.addColorStop(0.36, 'rgba(255, 142, 82, 0.09)');
  moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(81, 18, 29, 0.16)';
  ctx.beginPath();
  ctx.arc(240, 110, 170, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(18, 21, 29, 0.96)';
  ctx.beginPath();
  ctx.moveTo(0, 430);
  ctx.lineTo(140, 305);
  ctx.lineTo(280, 364);
  ctx.lineTo(470, 246);
  ctx.lineTo(650, 392);
  ctx.lineTo(850, 264);
  ctx.lineTo(1040, 362);
  ctx.lineTo(1280, 228);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(32, 36, 47, 0.94)';
  ctx.beginPath();
  ctx.moveTo(0, 525);
  ctx.lineTo(170, 446);
  ctx.lineTo(334, 500);
  ctx.lineTo(520, 420);
  ctx.lineTo(760, 505);
  ctx.lineTo(980, 434);
  ctx.lineTo(1280, 530);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(68, 18, 30, 0.14)';
  for (let index = 0; index < 9; index += 1) {
    const x = (index * 210 - cameraX * 0.19) % 1500;
    ctx.fillRect(x + 34, 478, 20, 96);
    ctx.fillRect(x, 572, 84, 44);
    ctx.fillRect(x + 58, 532, 14, 42);
  }

  ctx.fillStyle = 'rgba(208, 217, 245, 0.028)';
  ctx.beginPath();
  ctx.ellipse(640, 564, 830, 84, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(180, 195, 225, 0.022)';
  ctx.beginPath();
  ctx.ellipse(700, 620, 980, 120, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let index = 0; index < 28; index += 1) {
    const px =
      (index * 111 + performance.now() * 0.008) % (canvas.width + 140);
    const py = 110 + ((index * 47) % 460);
    ctx.fillStyle = 'rgba(180, 190, 220, 0.038)';
    ctx.fillRect(px - 60, py, 2, 2);
  }
}

export function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
): void {
  for (const platform of platforms) {
    const gradient = ctx.createLinearGradient(
      platform.x,
      platform.y,
      platform.x,
      platform.y + platform.height,
    );
    gradient.addColorStop(0, '#524151');
    gradient.addColorStop(0.3, '#362b38');
    gradient.addColorStop(1, '#17141c');

    ctx.fillStyle = gradient;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    ctx.fillStyle = '#8a7383';
    ctx.fillRect(platform.x, platform.y, platform.width, 5);

    ctx.fillStyle = '#241c24';
    for (let x = 0; x < platform.width; x += 34) {
      ctx.fillRect(platform.x + x, platform.y + 6, 17, platform.height - 12);
    }

    ctx.fillStyle = '#130f16';
    ctx.fillRect(
      platform.x,
      platform.y + platform.height - 8,
      platform.width,
      8,
    );

    ctx.strokeStyle = 'rgba(8, 8, 12, 0.65)';
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }
}

export function drawCollectibles(
  ctx: CanvasRenderingContext2D,
  collectibles: Collectible[],
): void {
  const bob = Math.sin(performance.now() / 220) * 3;

  for (const item of collectibles) {
    if (item.collected) {
      continue;
    }

    const y = item.y + bob;

    if (item.type === 'coin') {
      ctx.fillStyle = '#b88d3d';
      ctx.beginPath();
      ctx.moveTo(item.x, y - 10);
      ctx.lineTo(item.x + 8, y);
      ctx.lineTo(item.x, y + 10);
      ctx.lineTo(item.x - 8, y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e6c26d';
      ctx.beginPath();
      ctx.moveTo(item.x, y - 6);
      ctx.lineTo(item.x + 5, y);
      ctx.lineTo(item.x, y + 6);
      ctx.lineTo(item.x - 5, y);
      ctx.closePath();
      ctx.fill();
    }

    if (item.type === 'heart') {
      const potionGlass = ctx.createLinearGradient(item.x, y - 12, item.x, y + 12);
      potionGlass.addColorStop(0, '#8fe7ad');
      potionGlass.addColorStop(1, '#3eb46a');

      const potionLiquid = ctx.createLinearGradient(item.x, y - 2, item.x, y + 10);
      potionLiquid.addColorStop(0, '#a9ffbe');
      potionLiquid.addColorStop(1, '#48cb75');

      ctx.fillStyle = '#c7a37b';
      ctx.fillRect(item.x - 3, y - 12, 6, 5);

      ctx.fillStyle = '#6f4b33';
      ctx.fillRect(item.x - 5, y - 14, 10, 3);

      ctx.fillStyle = potionGlass;
      ctx.beginPath();
      ctx.moveTo(item.x - 9, y - 4);
      ctx.lineTo(item.x - 7, y + 8);
      ctx.lineTo(item.x, y + 12);
      ctx.lineTo(item.x + 7, y + 8);
      ctx.lineTo(item.x + 9, y - 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = potionLiquid;
      ctx.beginPath();
      ctx.moveTo(item.x - 7, y + 1);
      ctx.lineTo(item.x - 5, y + 8);
      ctx.lineTo(item.x, y + 10);
      ctx.lineTo(item.x + 5, y + 8);
      ctx.lineTo(item.x + 7, y + 1);
      ctx.closePath();
      ctx.fill();
    }

    if (item.type === 'ray') {
      ctx.strokeStyle = '#d0fbff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(item.x - 4, y - 10);
      ctx.lineTo(item.x + 2, y - 2);
      ctx.lineTo(item.x - 1, y - 2);
      ctx.lineTo(item.x + 5, y + 10);
      ctx.stroke();
    }
  }
}

export function drawChests(
  ctx: CanvasRenderingContext2D,
  chests: Chest[],
): void {
  for (const chest of chests) {
    if (chest.active) {
      ctx.save();
      ctx.translate(chest.x, chest.y);

      const bob = Math.sin(performance.now() / 230 + chest.x * 0.01) * 0.8;
      ctx.translate(0, bob);

      if (chest.rare) {
        ctx.fillStyle = '#24151f';
        ctx.fillRect(2, 12, chest.width - 4, chest.height - 10);

        ctx.fillStyle = '#5b2f6f';
        ctx.fillRect(0, 10, chest.width, chest.height - 10);

        ctx.fillStyle = '#8a58a8';
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(chest.width / 2, 0);
        ctx.lineTo(chest.width, 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#d6fbff';
        ctx.fillRect(chest.width / 2 - 4, 12, 8, 9);
        ctx.fillRect(6, 18, chest.width - 12, 3);

        ctx.strokeStyle = 'rgba(214, 251, 255, 0.42)';
        ctx.strokeRect(1, 11, chest.width - 2, chest.height - 11);
      } else {
        ctx.fillStyle = '#2b170e';
        ctx.fillRect(2, 12, chest.width - 4, chest.height - 10);

        ctx.fillStyle = '#5d3a1f';
        ctx.fillRect(0, 10, chest.width, chest.height - 10);

        ctx.fillStyle = '#7b522b';
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(chest.width / 2, 0);
        ctx.lineTo(chest.width, 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#b8945b';
        ctx.fillRect(chest.width / 2 - 4, 12, 8, 9);
        ctx.fillRect(6, 18, chest.width - 12, 3);

        ctx.strokeStyle = 'rgba(255, 225, 170, 0.18)';
        ctx.strokeRect(1, 11, chest.width - 2, chest.height - 11);
      }

      ctx.restore();
    } else if (chest.breakTimer > 0) {
      const progress = chest.breakTimer / 0.58;
      const spread = (1 - progress) * 24;
      const alpha = progress;

      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.fillStyle = chest.rare ? '#8a58a8' : '#7b522b';
      ctx.fillRect(chest.x - spread, chest.y + 8, 14, 10);
      ctx.fillRect(chest.x + chest.width - 4 + spread, chest.y + 5, 14, 10);
      ctx.fillRect(
        chest.x + 10,
        chest.y + chest.height - 8 + spread * 0.25,
        16,
        8,
      );

      ctx.fillStyle = chest.rare
        ? 'rgba(214, 251, 255, 0.45)'
        : 'rgba(255, 225, 170, 0.35)';
      ctx.fillRect(
        chest.x + chest.width / 2 - 2,
        chest.y - 4 - spread * 0.15,
        4,
        10,
      );

      ctx.restore();
    }
  }
}

export function drawSpecialStrikes(
  ctx: CanvasRenderingContext2D,
  specialStrikes: SpecialStrike[],
): void {
  for (const strike of specialStrikes) {
    const alpha = strike.life / strike.maxLife;

    ctx.strokeStyle = `rgba(117, 234, 255, ${alpha * 0.34})`;
    ctx.lineWidth = strike.width * 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    for (let index = 0; index < strike.points.length; index += 1) {
      const point = strike.points[index];

      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    ctx.stroke();

    ctx.strokeStyle = `rgba(220, 252, 255, ${alpha})`;
    ctx.lineWidth = strike.width;
    ctx.beginPath();

    for (let index = 0; index < strike.points.length; index += 1) {
      const point = strike.points[index];

      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    ctx.stroke();

    ctx.strokeStyle = `rgba(121, 202, 255, ${alpha * 0.8})`;
    ctx.lineWidth = Math.max(2, strike.width * 0.34);
    ctx.beginPath();

    for (let index = 0; index < strike.points.length; index += 1) {
      const point = strike.points[index];

      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    ctx.stroke();
  }
}

export function drawBurstParticles(
  ctx: CanvasRenderingContext2D,
  burstParticles: BurstParticle[],
): void {
  for (const particle of burstParticles) {
    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = hexToRgba(particle.color, alpha);

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');

  if (normalized.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
