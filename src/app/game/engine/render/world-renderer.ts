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
  skyGradient.addColorStop(0, '#07090d');
  skyGradient.addColorStop(0.24, '#10131b');
  skyGradient.addColorStop(0.58, '#140f16');
  skyGradient.addColorStop(0.82, '#090a0f');
  skyGradient.addColorStop(1, '#030405');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(82, 20, 30, 0.1)';
  ctx.beginPath();
  ctx.ellipse(220 - cameraX * 0.025, 118, 170, 78, -0.08, 0, Math.PI * 2);
  ctx.fill();

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.07,
    'rgba(16, 18, 26, 0.97)',
    [468, 354, 404, 286, 408, 258, 388, 244, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.12,
    'rgba(23, 27, 37, 0.94)',
    [534, 452, 506, 414, 520, 428, 530, 418, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.19,
    'rgba(32, 24, 34, 0.84)',
    [584, 520, 554, 482, 566, 494, 578, 510, 720],
  );

  drawDeadForest(ctx, cameraX, canvas.width);

  const haze = ctx.createLinearGradient(0, 420, 0, canvas.height);
  haze.addColorStop(0, 'rgba(40, 24, 30, 0)');
  haze.addColorStop(0.45, 'rgba(52, 20, 28, 0.08)');
  haze.addColorStop(1, 'rgba(10, 10, 12, 0.32)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 420, canvas.width, canvas.height - 420);

  drawAbyssGlow(ctx, canvas);
}

function drawMountainLayer(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
  parallax: number,
  color: string,
  heights: number[],
): void {
  const offset = -((cameraX * parallax) % canvasWidth);

  ctx.fillStyle = color;

  for (let layer = -1; layer <= 1; layer += 1) {
    const startX = offset + layer * canvasWidth;

    ctx.beginPath();
    ctx.moveTo(startX, heights[0]);

    const segmentWidth = canvasWidth / (heights.length - 2);

    for (let index = 1; index < heights.length - 1; index += 1) {
      ctx.lineTo(startX + segmentWidth * index, heights[index]);
    }

    ctx.lineTo(startX + canvasWidth, heights[heights.length - 2]);
    ctx.lineTo(startX + canvasWidth, heights[heights.length - 1]);
    ctx.lineTo(startX, heights[heights.length - 1]);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDeadForest(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
): void {
  for (let index = 0; index < 15; index += 1) {
    const x = ((index * 166) - cameraX * 0.21) % (canvasWidth + 220);

    ctx.fillStyle = 'rgba(22, 17, 20, 0.58)';
    ctx.fillRect(x + 38, 432, 18, 120);

    ctx.strokeStyle = 'rgba(46, 24, 32, 0.44)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 46, 454);
    ctx.lineTo(x + 24, 418);
    ctx.moveTo(x + 46, 474);
    ctx.lineTo(x + 72, 436);
    ctx.moveTo(x + 48, 494);
    ctx.lineTo(x + 22, 468);
    ctx.stroke();
  }
}

function drawAbyssGlow(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): void {
  const abyss = ctx.createLinearGradient(0, 600, 0, canvas.height);
  abyss.addColorStop(0, 'rgba(255, 130, 70, 0)');
  abyss.addColorStop(0.12, 'rgba(200, 58, 26, 0.16)');
  abyss.addColorStop(0.28, 'rgba(130, 20, 18, 0.28)');
  abyss.addColorStop(0.56, 'rgba(20, 3, 7, 0.58)');
  abyss.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  ctx.fillStyle = abyss;
  ctx.fillRect(0, 600, canvas.width, canvas.height - 600);
}

export function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
): void {
  const groundSegments = platforms
    .filter((platform) => platform.height >= 70)
    .sort((a, b) => a.x - b.x);

  for (let index = 0; index < groundSegments.length; index += 1) {
    drawGroundSegment(ctx, groundSegments[index]);

    const current = groundSegments[index];
    const next = groundSegments[index + 1];

    if (next && next.x > current.x + current.width) {
      drawPit(
        ctx,
        current.x + current.width,
        next.x,
        current.y,
      );
    }
  }

  const elevatedPlatforms = platforms.filter((platform) => platform.height < 70);

  for (const platform of elevatedPlatforms) {
    drawRuinedPlatform(ctx, platform);
  }
}

function drawGroundSegment(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const topGradient = ctx.createLinearGradient(
    platform.x,
    platform.y,
    platform.x,
    platform.y + platform.height,
  );
  topGradient.addColorStop(0, '#6d5b46');
  topGradient.addColorStop(0.07, '#4d4135');
  topGradient.addColorStop(0.12, '#2c2927');
  topGradient.addColorStop(0.46, '#17161c');
  topGradient.addColorStop(1, '#09090d');

  ctx.fillStyle = topGradient;
  ctx.beginPath();
  ctx.moveTo(platform.x, platform.y + 8);

  for (let x = 0; x <= platform.width; x += 22) {
    const yOffset = Math.sin((platform.x + x) * 0.055) * 2.4;
    ctx.lineTo(platform.x + x, platform.y + yOffset);
  }

  ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + platform.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#8f6d4d';
  ctx.fillRect(platform.x, platform.y, platform.width, 5);

  ctx.fillStyle = '#392f2e';
  for (let x = 10; x < platform.width - 8; x += 38) {
    ctx.fillRect(platform.x + x, platform.y + 7, 14, 12);
    ctx.fillRect(platform.x + x + 12, platform.y + 13, 9, 9);
  }

  ctx.strokeStyle = 'rgba(255, 162, 84, 0.12)';
  ctx.lineWidth = 1;
  for (let crack = 28; crack < platform.width - 12; crack += 64) {
    ctx.beginPath();
    ctx.moveTo(platform.x + crack, platform.y + 12);
    ctx.lineTo(platform.x + crack - 5, platform.y + 24);
    ctx.lineTo(platform.x + crack + 3, platform.y + 36);
    ctx.lineTo(platform.x + crack - 4, platform.y + 54);
    ctx.stroke();
  }

  ctx.fillStyle = '#0c0d12';
  ctx.fillRect(platform.x, platform.y + platform.height - 10, platform.width, 10);

  ctx.strokeStyle = 'rgba(8, 8, 12, 0.82)';
  ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

  drawGroundRoots(ctx, platform);
  drawGroundEdges(ctx, platform);
}

function drawGroundRoots(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  ctx.strokeStyle = 'rgba(33, 22, 25, 0.7)';
  ctx.lineWidth = 3;

  for (let x = 18; x < platform.width - 10; x += 58) {
    const rootX = platform.x + x;
    const startY = platform.y + platform.height - 2;

    ctx.beginPath();
    ctx.moveTo(rootX, startY);
    ctx.bezierCurveTo(rootX - 6, startY + 18, rootX + 8, startY + 34, rootX - 3, startY + 52);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rootX + 8, startY + 8);
    ctx.bezierCurveTo(rootX + 18, startY + 20, rootX + 10, startY + 32, rootX + 16, startY + 42);
    ctx.stroke();
  }
}

function drawGroundEdges(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const leftGlow = ctx.createLinearGradient(platform.x - 30, 0, platform.x + 10, 0);
  leftGlow.addColorStop(0, 'rgba(255, 132, 74, 0)');
  leftGlow.addColorStop(1, 'rgba(255, 132, 74, 0.24)');
  ctx.fillStyle = leftGlow;
  ctx.fillRect(platform.x - 30, platform.y + 6, 30, platform.height - 6);

  const rightGlow = ctx.createLinearGradient(
    platform.x + platform.width - 10,
    0,
    platform.x + platform.width + 30,
    0,
  );
  rightGlow.addColorStop(0, 'rgba(255, 132, 74, 0.24)');
  rightGlow.addColorStop(1, 'rgba(255, 132, 74, 0)');
  ctx.fillStyle = rightGlow;
  ctx.fillRect(platform.x + platform.width, platform.y + 6, 30, platform.height - 6);
}

function drawPit(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
): void {
  const pitWidth = endX - startX;

  const pitGradient = ctx.createLinearGradient(0, groundY, 0, 720);
  pitGradient.addColorStop(0, 'rgba(255, 96, 42, 0.12)');
  pitGradient.addColorStop(0.08, 'rgba(125, 20, 18, 0.18)');
  pitGradient.addColorStop(0.26, 'rgba(28, 6, 10, 0.72)');
  pitGradient.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
  ctx.fillStyle = pitGradient;
  ctx.fillRect(startX, groundY, pitWidth, 120);

  ctx.fillStyle = 'rgba(255, 120, 62, 0.1)';
  ctx.beginPath();
  ctx.moveTo(startX, groundY + 4);
  ctx.lineTo(startX + 20, groundY + 28);
  ctx.lineTo(startX, groundY + 56);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(endX, groundY + 4);
  ctx.lineTo(endX - 20, groundY + 28);
  ctx.lineTo(endX, groundY + 56);
  ctx.closePath();
  ctx.fill();

  const emberY = groundY + 84;

  for (let index = 0; index < Math.max(2, Math.floor(pitWidth / 70)); index += 1) {
    const px = startX + 30 + index * 62 + Math.sin(performance.now() * 0.003 + index) * 10;

    ctx.fillStyle = 'rgba(255, 132, 72, 0.18)';
    ctx.beginPath();
    ctx.arc(px, emberY + Math.sin(performance.now() * 0.004 + index) * 8, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 186, 115, 0.1)';
    ctx.beginPath();
    ctx.arc(px, emberY + 2 + Math.sin(performance.now() * 0.004 + index) * 6, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRuinedPlatform(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const slab = ctx.createLinearGradient(
    platform.x,
    platform.y,
    platform.x,
    platform.y + platform.height,
  );
  slab.addColorStop(0, '#7c7078');
  slab.addColorStop(0.14, '#5a4e58');
  slab.addColorStop(0.55, '#2b2630');
  slab.addColorStop(1, '#14131a');

  ctx.fillStyle = slab;
  ctx.beginPath();
  ctx.moveTo(platform.x + 4, platform.y + 4);
  ctx.lineTo(platform.x + platform.width - 6, platform.y + 2);
  ctx.lineTo(platform.x + platform.width, platform.y + 10);
  ctx.lineTo(platform.x + platform.width - 5, platform.y + platform.height);
  ctx.lineTo(platform.x + 7, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + 11);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#a18b99';
  ctx.fillRect(platform.x + 6, platform.y, platform.width - 12, 4);

  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(platform.x + 18, platform.y + 6, platform.width * 0.22, 3);

  ctx.fillStyle = '#231f28';
  for (let x = 10; x < platform.width - 12; x += 26) {
    ctx.fillRect(platform.x + x, platform.y + 6, 12, platform.height - 12);
  }

  ctx.strokeStyle = 'rgba(9, 9, 12, 0.74)';
  ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

  ctx.strokeStyle = 'rgba(255, 190, 140, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(platform.x + 24, platform.y + 5);
  ctx.lineTo(platform.x + 18, platform.y + 13);
  ctx.lineTo(platform.x + 28, platform.y + 20);
  ctx.stroke();

  drawPlatformSupports(ctx, platform);
}

function drawPlatformSupports(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  ctx.strokeStyle = 'rgba(22, 18, 24, 0.72)';
  ctx.lineWidth = 4;

  const supportCount = Math.max(1, Math.floor(platform.width / 120));

  for (let index = 0; index < supportCount; index += 1) {
    const t = supportCount === 1 ? 0.5 : index / (supportCount - 1);
    const x = platform.x + 18 + (platform.width - 36) * t;

    ctx.beginPath();
    ctx.moveTo(x, platform.y + platform.height - 2);
    ctx.lineTo(x - 12, platform.y + platform.height + 28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, platform.y + platform.height - 2);
    ctx.lineTo(x + 12, platform.y + platform.height + 28);
    ctx.stroke();
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
      ctx.fillStyle = '#8f6840';
      ctx.beginPath();
      ctx.moveTo(item.x, y - 10);
      ctx.lineTo(item.x + 8, y);
      ctx.lineTo(item.x, y + 10);
      ctx.lineTo(item.x - 8, y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#d4a66a';
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
      potionGlass.addColorStop(0, '#9be9ba');
      potionGlass.addColorStop(1, '#4aa06a');

      const potionLiquid = ctx.createLinearGradient(item.x, y - 2, item.x, y + 10);
      potionLiquid.addColorStop(0, '#c0ffd0');
      potionLiquid.addColorStop(1, '#5bd482');

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
      const glow = ctx.createRadialGradient(item.x, y, 1, item.x, y, 18);
      glow.addColorStop(0, 'rgba(230, 250, 255, 0.82)');
      glow.addColorStop(0.55, 'rgba(120, 235, 255, 0.2)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(item.x, y, 16, 0, Math.PI * 2);
      ctx.fill();

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
