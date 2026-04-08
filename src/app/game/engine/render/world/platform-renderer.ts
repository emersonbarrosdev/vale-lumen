import { Platform } from '../../../domain/world/platform.model';

export function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
): void {
  const activePlatforms = platforms.filter((platform) => platform.active !== false);

  const groundSegments = activePlatforms
    .filter((platform) => platform.height >= 70)
    .sort((a, b) => a.x - b.x);

  for (let index = 0; index < groundSegments.length; index += 1) {
    const current = groundSegments[index];
    const next = groundSegments[index + 1];

    drawGroundSegment(ctx, current);

    if (next && next.x > current.x + current.width) {
      drawPit(ctx, current.x + current.width, next.x, Math.min(current.y, next.y));
    }
  }

  const elevatedPlatforms = activePlatforms
    .filter((platform) => platform.height < 70)
    .sort((a, b) => a.x - b.x || a.y - b.y);

  for (const platform of elevatedPlatforms) {
    drawPlatform(ctx, platform);
    drawPlatformSupportHint(ctx, platform);
  }
}

function drawGroundSegment(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const body = ctx.createLinearGradient(
    platform.x,
    platform.y,
    platform.x,
    platform.y + platform.height,
  );
  body.addColorStop(0, '#a88459');
  body.addColorStop(0.06, '#856749');
  body.addColorStop(0.18, '#564438');
  body.addColorStop(0.5, '#2c2527');
  body.addColorStop(1, '#0a0b0d');

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(platform.x, platform.y + 8);

  for (let x = 0; x <= platform.width; x += 16) {
    const yOffset =
      Math.sin((platform.x + x) * 0.042) * 1.2 +
      Math.sin((platform.x + x) * 0.09) * 0.45;
    ctx.lineTo(platform.x + x, platform.y + yOffset);
  }

  ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + platform.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#efc98e';
  ctx.fillRect(platform.x, platform.y, platform.width, 4);

  ctx.fillStyle = '#a37c52';
  ctx.fillRect(platform.x, platform.y + 4, platform.width, 2);

  ctx.fillStyle = '#493a35';
  for (let x = 14; x < platform.width - 12; x += 34) {
    const h = 7 + ((x / 34) % 2);
    ctx.fillRect(platform.x + x, platform.y + 9, 12, h);
    ctx.fillRect(platform.x + x + 10, platform.y + 12, 5, h + 2);
  }

  drawGroundDepth(ctx, platform);
  drawGroundEdges(ctx, platform);
}

function drawGroundDepth(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const depth = ctx.createLinearGradient(
    platform.x,
    platform.y + platform.height * 0.4,
    platform.x,
    platform.y + platform.height,
  );
  depth.addColorStop(0, 'rgba(0,0,0,0)');
  depth.addColorStop(1, 'rgba(0,0,0,0.18)');

  ctx.fillStyle = depth;
  ctx.fillRect(
    platform.x,
    platform.y + platform.height * 0.4,
    platform.width,
    platform.height * 0.6,
  );

  ctx.fillStyle = '#07080a';
  ctx.fillRect(platform.x, platform.y + platform.height - 8, platform.width, 8);

  ctx.strokeStyle = 'rgba(10, 10, 14, 0.44)';
  ctx.lineWidth = 1;
  ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
}

function drawGroundEdges(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const leftGlow = ctx.createLinearGradient(platform.x - 28, 0, platform.x + 8, 0);
  leftGlow.addColorStop(0, 'rgba(255, 142, 78, 0)');
  leftGlow.addColorStop(1, 'rgba(255, 142, 78, 0.12)');
  ctx.fillStyle = leftGlow;
  ctx.fillRect(platform.x - 28, platform.y + 4, 28, platform.height - 4);

  const rightGlow = ctx.createLinearGradient(
    platform.x + platform.width - 8,
    0,
    platform.x + platform.width + 28,
    0,
  );
  rightGlow.addColorStop(0, 'rgba(255, 142, 78, 0.12)');
  rightGlow.addColorStop(1, 'rgba(255, 142, 78, 0)');
  ctx.fillStyle = rightGlow;
  ctx.fillRect(platform.x + platform.width, platform.y + 4, 28, platform.height - 4);
}

function drawPit(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
): void {
  const pitWidth = endX - startX;
  const depthBottom = 720;

  const pitGradient = ctx.createLinearGradient(0, groundY, 0, depthBottom);
  pitGradient.addColorStop(0, 'rgba(16, 8, 14, 0.1)');
  pitGradient.addColorStop(0.14, 'rgba(12, 6, 12, 0.22)');
  pitGradient.addColorStop(0.34, 'rgba(8, 4, 10, 0.68)');
  pitGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = pitGradient;
  ctx.fillRect(startX, groundY, pitWidth, depthBottom - groundY);

  drawPitWalls(ctx, startX, endX, groundY);
}

function drawPitWalls(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
): void {
  ctx.fillStyle = 'rgba(255, 150, 88, 0.1)';

  ctx.beginPath();
  ctx.moveTo(startX, groundY + 2);
  ctx.lineTo(startX + 20, groundY + 26);
  ctx.lineTo(startX, groundY + 58);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(endX, groundY + 2);
  ctx.lineTo(endX - 20, groundY + 26);
  ctx.lineTo(endX, groundY + 58);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 170, 96, 0.18)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(startX, groundY + 3);
  ctx.lineTo(startX + 18, groundY + 24);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, groundY + 3);
  ctx.lineTo(endX - 18, groundY + 24);
  ctx.stroke();
}

function drawPlatform(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const slab = ctx.createLinearGradient(
    platform.x,
    platform.y,
    platform.x,
    platform.y + platform.height,
  );
  slab.addColorStop(0, '#ead2a8');
  slab.addColorStop(0.2, '#c4a37c');
  slab.addColorStop(0.55, '#876f62');
  slab.addColorStop(1, '#3b3134');

  ctx.fillStyle = slab;
  ctx.beginPath();
  ctx.moveTo(platform.x + 4, platform.y + 2);
  ctx.lineTo(platform.x + platform.width - 6, platform.y);
  ctx.lineTo(platform.x + platform.width, platform.y + 6);
  ctx.lineTo(platform.x + platform.width - 3, platform.y + platform.height);
  ctx.lineTo(platform.x + 2, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffe8bf';
  ctx.fillRect(platform.x + 4, platform.y, platform.width - 8, 3);

  ctx.fillStyle = '#98785a';
  ctx.fillRect(platform.x + 3, platform.y + 4, platform.width - 6, 2);

  ctx.strokeStyle = 'rgba(28, 22, 18, 0.42)';
  ctx.lineWidth = 1;
  ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

  ctx.strokeStyle = 'rgba(60, 44, 34, 0.12)';
  for (let crack = 14; crack < platform.width - 10; crack += 32) {
    ctx.beginPath();
    ctx.moveTo(platform.x + crack, platform.y + 4);
    ctx.lineTo(platform.x + crack - 3, platform.y + 10);
    ctx.lineTo(platform.x + crack + 2, platform.y + 16);
    ctx.stroke();
  }

  drawPlatformUnderside(ctx, platform);

  if (platform.fallAway) {
    drawFallAwayWarning(ctx, platform);
  }
}

function drawPlatformUnderside(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  ctx.strokeStyle = 'rgba(42, 28, 22, 0.22)';
  ctx.lineWidth = 1.5;

  for (let x = 12; x < platform.width - 10; x += 28) {
    const px = platform.x + x;
    const py = platform.y + platform.height - 1;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 3, py + 7);
    ctx.stroke();
  }
}

function drawFallAwayWarning(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  ctx.strokeStyle = 'rgba(255, 180, 92, 0.52)';
  ctx.lineWidth = 1;

  for (let x = 10; x < platform.width - 6; x += 18) {
    ctx.beginPath();
    ctx.moveTo(platform.x + x, platform.y + 5);
    ctx.lineTo(platform.x + x + 8, platform.y + 11);
    ctx.stroke();
  }
}

function drawPlatformSupportHint(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  if (platform.y >= 470) {
    return;
  }

  const supportCount = Math.max(1, Math.floor(platform.width / 110));
  const supportSpacing = platform.width / (supportCount + 1);
  const supportBottomY = Math.min(620, platform.y + 180);

  ctx.strokeStyle = 'rgba(92, 72, 56, 0.14)';
  ctx.lineWidth = 2;

  for (let index = 1; index <= supportCount; index += 1) {
    const supportX = platform.x + supportSpacing * index;

    ctx.beginPath();
    ctx.moveTo(supportX, platform.y + platform.height - 1);
    ctx.lineTo(supportX - 6, supportBottomY);
    ctx.stroke();
  }
}
