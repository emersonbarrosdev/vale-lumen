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

    const offsetY = item.falling || item.settled ? 0 : bob;
    const y = item.y + offsetY;

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

    if (item.type === 'flameVial') {
      const glow = ctx.createRadialGradient(item.x, y + 2, 2, item.x, y + 2, 26);
      glow.addColorStop(0, 'rgba(255, 194, 109, 0.38)');
      glow.addColorStop(0.45, 'rgba(255, 136, 57, 0.22)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(item.x, y + 2, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#7b5b3b';
      ctx.fillRect(item.x - 3, y - 16, 6, 5);

      ctx.fillStyle = '#a6845b';
      ctx.fillRect(item.x - 5, y - 18, 10, 3);

      const glass = ctx.createLinearGradient(item.x, y - 11, item.x, y + 12);
      glass.addColorStop(0, 'rgba(209, 241, 255, 0.95)');
      glass.addColorStop(1, 'rgba(115, 180, 225, 0.62)');

      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.moveTo(item.x - 10, y - 8);
      ctx.quadraticCurveTo(item.x - 12, y + 6, item.x - 4, y + 12);
      ctx.lineTo(item.x + 4, y + 12);
      ctx.quadraticCurveTo(item.x + 12, y + 6, item.x + 10, y - 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.fillRect(item.x - 5, y - 6, 2, 12);

      ctx.fillStyle = '#ff9c39';
      ctx.beginPath();
      ctx.moveTo(item.x, y + 8);
      ctx.quadraticCurveTo(item.x - 5, y + 2, item.x - 1, y - 4);
      ctx.quadraticCurveTo(item.x + 2, y - 8, item.x + 4, y - 1);
      ctx.quadraticCurveTo(item.x + 5, y + 4, item.x, y + 8);
      ctx.fill();

      ctx.fillStyle = '#ffe3a6';
      ctx.beginPath();
      ctx.moveTo(item.x, y + 5);
      ctx.quadraticCurveTo(item.x - 2, y + 1, item.x, y - 3);
      ctx.quadraticCurveTo(item.x + 2, y + 1, item.x, y + 5);
      ctx.fill();
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

      const bob = Math.sin(performance.now() / 240 + chest.x * 0.01) * 0.9;
      ctx.translate(0, bob);

      const centerX = chest.width / 2;
      const anchorY = -26;

      ctx.strokeStyle = 'rgba(120, 128, 150, 0.62)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 7, anchorY);
      ctx.lineTo(centerX - 7, 2);
      ctx.moveTo(centerX + 7, anchorY);
      ctx.lineTo(centerX + 7, 2);
      ctx.stroke();

      ctx.fillStyle = chest.rare ? '#372344' : '#2b1f17';
      ctx.beginPath();
      ctx.moveTo(6, 8);
      ctx.lineTo(chest.width - 6, 8);
      ctx.quadraticCurveTo(chest.width - 1, 10, chest.width - 3, 17);
      ctx.lineTo(chest.width - 7, chest.height - 5);
      ctx.quadraticCurveTo(chest.width - 9, chest.height, chest.width / 2, chest.height + 1);
      ctx.quadraticCurveTo(9, chest.height, 7, chest.height - 5);
      ctx.lineTo(3, 17);
      ctx.quadraticCurveTo(1, 10, 6, 8);
      ctx.closePath();
      ctx.fill();

      const glass = ctx.createLinearGradient(0, 6, 0, chest.height);
      glass.addColorStop(0, 'rgba(214, 245, 255, 0.88)');
      glass.addColorStop(1, 'rgba(86, 140, 194, 0.38)');
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.moveTo(8, 10);
      ctx.lineTo(chest.width - 8, 10);
      ctx.quadraticCurveTo(chest.width - 4, 13, chest.width - 6, 19);
      ctx.lineTo(chest.width - 10, chest.height - 6);
      ctx.quadraticCurveTo(chest.width - 11, chest.height - 2, chest.width / 2, chest.height - 1);
      ctx.quadraticCurveTo(11, chest.height - 2, 10, chest.height - 6);
      ctx.lineTo(6, 19);
      ctx.quadraticCurveTo(4, 13, 8, 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = chest.rare ? '#b98cff' : '#ff9e4c';
      ctx.beginPath();
      ctx.moveTo(centerX, 20);
      ctx.quadraticCurveTo(centerX - 5, 15, centerX - 1, 8);
      ctx.quadraticCurveTo(centerX + 2, 2, centerX + 5, 10);
      ctx.quadraticCurveTo(centerX + 6, 16, centerX, 20);
      ctx.fill();

      ctx.fillStyle = chest.rare ? '#f2dcff' : '#ffe1af';
      ctx.beginPath();
      ctx.moveTo(centerX, 17);
      ctx.quadraticCurveTo(centerX - 2, 13, centerX, 9);
      ctx.quadraticCurveTo(centerX + 2, 13, centerX, 17);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(11, 13, 3, chest.height - 10);

      ctx.restore();
    } else if (chest.breakTimer > 0) {
      const progress = chest.breakTimer / 0.58;
      const spread = (1 - progress) * 22;
      const alpha = progress;

      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.fillStyle = 'rgba(196, 230, 255, 0.65)';
      ctx.fillRect(chest.x - spread, chest.y + 10, 10, 8);
      ctx.fillRect(chest.x + chest.width - 1 + spread, chest.y + 8, 11, 9);
      ctx.fillRect(chest.x + chest.width / 2 - 3, chest.y - 6 - spread * 0.15, 6, 11);

      ctx.fillStyle = chest.rare
        ? 'rgba(185, 140, 255, 0.55)'
        : 'rgba(255, 158, 76, 0.5)';
      ctx.beginPath();
      ctx.arc(chest.x + chest.width / 2, chest.y + 12, 8 + spread * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}

export function drawSpecialStrikes(
  ctx: CanvasRenderingContext2D,
  specialStrikes: SpecialStrike[],
): void {
  for (const strike of specialStrikes) {
    const alpha = Math.max(0, strike.life / strike.maxLife);

    if (strike.points.length < 2) {
      continue;
    }

    const head = strike.points[strike.points.length - 1];
    const prev = strike.points[strike.points.length - 2];

    const isHeroSpecial = strike.theme === 'heroSpecial';
    const outerColor = isHeroSpecial ? '130, 232, 255' : '255, 130, 35';
    const midColor = isHeroSpecial ? '255, 240, 138' : '255, 132, 42';
    const innerColor = isHeroSpecial ? '229, 248, 255' : '255, 228, 185';
    const tailColor = isHeroSpecial ? '196, 246, 255' : '255, 210, 150';

    ctx.save();

    for (let index = strike.points.length - 1; index > 0; index -= 1) {
      const p1 = strike.points[index];
      const p0 = strike.points[index - 1];
      const segAlpha = alpha * (index / strike.points.length) * 0.55;

      ctx.strokeStyle = `rgba(${outerColor}, ${segAlpha})`;
      ctx.lineWidth = Math.max(3, strike.width * (index / strike.points.length) * 0.7);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    const glow = ctx.createRadialGradient(
      head.x,
      head.y,
      1,
      head.x,
      head.y,
      strike.width * 3,
    );
    glow.addColorStop(0, `rgba(${innerColor}, ${alpha})`);
    glow.addColorStop(0.35, `rgba(${midColor}, ${alpha * 0.95})`);
    glow.addColorStop(1, `rgba(${outerColor}, 0)`);

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(head.x, head.y, strike.width * 2.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${midColor}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(head.x, head.y, strike.width * 1.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${innerColor}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(head.x - 1.2, head.y - 1.2, Math.max(2, strike.width * 0.35), 0, Math.PI * 2);
    ctx.fill();

    const dx = head.x - prev.x;
    const dy = head.y - prev.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / len;
    const ny = dy / len;

    ctx.strokeStyle = `rgba(${tailColor}, ${alpha * 0.55})`;
    ctx.lineWidth = Math.max(2, strike.width * 0.28);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(head.x - nx * strike.width * 1.8, head.y - ny * strike.width * 1.8);
    ctx.lineTo(head.x - nx * strike.width * 3.8, head.y - ny * strike.width * 3.8);
    ctx.stroke();

    if (isHeroSpecial) {
      for (let sparkIndex = 0; sparkIndex < 4; sparkIndex += 1) {
        const sparkAngle = performance.now() * 0.01 + sparkIndex * (Math.PI / 2);
        const sparkDist = strike.width * (1.1 + sparkIndex * 0.22);
        const sx = head.x + Math.cos(sparkAngle) * sparkDist;
        const sy = head.y + Math.sin(sparkAngle) * sparkDist;

        ctx.fillStyle = sparkIndex % 2 === 0
          ? `rgba(255, 240, 138, ${alpha * 0.92})`
          : `rgba(130, 232, 255, ${alpha * 0.9})`;

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1.8, strike.width * 0.16), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
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
