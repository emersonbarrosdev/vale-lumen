import { Platform } from '../../../domain/world/platform.model';

export function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
): void {
  const groundSegments = platforms
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

  const elevatedPlatforms = platforms.filter((platform) => platform.height < 70);
  for (const platform of elevatedPlatforms) {
    drawPlatform(ctx, platform);
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
  body.addColorStop(0, '#8b6a47');
  body.addColorStop(0.04, '#6b543d');
  body.addColorStop(0.14, '#43362c');
  body.addColorStop(0.45, '#221d1f');
  body.addColorStop(1, '#090a0d');

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(platform.x, platform.y + 8);

  for (let x = 0; x <= platform.width; x += 16) {
    const yOffset =
      Math.sin((platform.x + x) * 0.045) * 1.8 +
      Math.sin((platform.x + x) * 0.11) * 0.7;
    ctx.lineTo(platform.x + x, platform.y + yOffset);
  }

  ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + platform.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c09561';
  ctx.fillRect(platform.x, platform.y, platform.width, 4);

  ctx.fillStyle = '#6c5138';
  ctx.fillRect(platform.x, platform.y + 4, platform.width, 3);

  ctx.fillStyle = '#312827';
  for (let x = 12; x < platform.width - 10; x += 30) {
    const h = 8 + ((x / 30) % 3);
    ctx.fillRect(platform.x + x, platform.y + 9, 12, h);
    ctx.fillRect(platform.x + x + 10, platform.y + 12, 6, h + 3);
  }

  ctx.strokeStyle = 'rgba(28, 20, 18, 0.62)';
  ctx.lineWidth = 1.2;
  for (let crack = 20; crack < platform.width - 12; crack += 54) {
    ctx.beginPath();
    ctx.moveTo(platform.x + crack, platform.y + 8);
    ctx.lineTo(platform.x + crack - 5, platform.y + 18);
    ctx.lineTo(platform.x + crack + 3, platform.y + 30);
    ctx.lineTo(platform.x + crack - 4, platform.y + 44);
    ctx.stroke();
  }

  drawGroundGrassGlow(ctx, platform);
  drawGroundRoots(ctx, platform);
  drawGroundDepth(ctx, platform);
  drawGroundEdges(ctx, platform);
}

function drawGroundGrassGlow(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  ctx.fillStyle = 'rgba(255, 192, 94, 0.14)';

  for (let x = 6; x < platform.width - 4; x += 20) {
    const h = 3 + ((x / 20) % 2);
    ctx.beginPath();
    ctx.moveTo(platform.x + x, platform.y + 1);
    ctx.lineTo(platform.x + x + 3, platform.y - h);
    ctx.lineTo(platform.x + x + 6, platform.y + 1);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGroundRoots(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  ctx.strokeStyle = 'rgba(31, 20, 24, 0.72)';
  ctx.lineWidth = 3;

  for (let x = 18; x < platform.width - 10; x += 54) {
    const rootX = platform.x + x;
    const startY = platform.y + platform.height - 2;

    ctx.beginPath();
    ctx.moveTo(rootX, startY);
    ctx.bezierCurveTo(
      rootX - 6,
      startY + 18,
      rootX + 8,
      startY + 34,
      rootX - 3,
      startY + 52,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rootX + 8, startY + 8);
    ctx.bezierCurveTo(
      rootX + 18,
      startY + 20,
      rootX + 10,
      startY + 32,
      rootX + 16,
      startY + 42,
    );
    ctx.stroke();
  }
}

function drawGroundDepth(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const depth = ctx.createLinearGradient(
    platform.x,
    platform.y + platform.height * 0.45,
    platform.x,
    platform.y + platform.height,
  );
  depth.addColorStop(0, 'rgba(0,0,0,0)');
  depth.addColorStop(1, 'rgba(0,0,0,0.34)');

  ctx.fillStyle = depth;
  ctx.fillRect(
    platform.x,
    platform.y + platform.height * 0.45,
    platform.width,
    platform.height * 0.55,
  );

  ctx.fillStyle = '#050607';
  ctx.fillRect(platform.x, platform.y + platform.height - 10, platform.width, 10);

  ctx.strokeStyle = 'rgba(10, 10, 14, 0.86)';
  ctx.lineWidth = 1;
  ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
}

function drawGroundEdges(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const leftGlow = ctx.createLinearGradient(platform.x - 34, 0, platform.x + 8, 0);
  leftGlow.addColorStop(0, 'rgba(255, 142, 78, 0)');
  leftGlow.addColorStop(1, 'rgba(255, 142, 78, 0.24)');
  ctx.fillStyle = leftGlow;
  ctx.fillRect(platform.x - 34, platform.y + 4, 34, platform.height - 4);

  const rightGlow = ctx.createLinearGradient(
    platform.x + platform.width - 8,
    0,
    platform.x + platform.width + 34,
    0,
  );
  rightGlow.addColorStop(0, 'rgba(255, 142, 78, 0.24)');
  rightGlow.addColorStop(1, 'rgba(255, 142, 78, 0)');
  ctx.fillStyle = rightGlow;
  ctx.fillRect(platform.x + platform.width, platform.y + 4, 34, platform.height - 4);
}

function drawPit(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
): void {
  const pitWidth = endX - startX;
  const isEmptyPit = pitWidth >= 185;
  const depthBottom = 720;

  const pitGradient = ctx.createLinearGradient(0, groundY, 0, depthBottom);
  pitGradient.addColorStop(0, isEmptyPit ? 'rgba(28, 12, 18, 0.18)' : 'rgba(255, 98, 42, 0.14)');
  pitGradient.addColorStop(0.12, isEmptyPit ? 'rgba(18, 8, 14, 0.34)' : 'rgba(126, 24, 18, 0.22)');
  pitGradient.addColorStop(0.32, 'rgba(18, 6, 12, 0.78)');
  pitGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = pitGradient;
  ctx.fillRect(startX, groundY, pitWidth, depthBottom - groundY);

  drawPitWalls(ctx, startX, endX, groundY);

  if (!isEmptyPit) {
    drawPitEmbers(ctx, startX, pitWidth, groundY);
  }
}

function drawPitWalls(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
): void {
  ctx.fillStyle = 'rgba(255, 150, 88, 0.2)';

  ctx.beginPath();
  ctx.moveTo(startX, groundY + 2);
  ctx.lineTo(startX + 22, groundY + 28);
  ctx.lineTo(startX, groundY + 62);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(endX, groundY + 2);
  ctx.lineTo(endX - 22, groundY + 28);
  ctx.lineTo(endX, groundY + 62);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 170, 96, 0.36)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, groundY + 3);
  ctx.lineTo(startX + 20, groundY + 26);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, groundY + 3);
  ctx.lineTo(endX - 20, groundY + 26);
  ctx.stroke();
}

function drawPitEmbers(
  ctx: CanvasRenderingContext2D,
  startX: number,
  pitWidth: number,
  groundY: number,
): void {
  const emberY = groundY + 90;
  const total = Math.max(2, Math.floor(pitWidth / 64));

  for (let index = 0; index < total; index += 1) {
    const px =
      startX +
      28 +
      index * 58 +
      Math.sin(performance.now() * 0.003 + index) * 10;

    ctx.fillStyle = 'rgba(255, 132, 72, 0.2)';
    ctx.beginPath();
    ctx.arc(
      px,
      emberY + Math.sin(performance.now() * 0.004 + index) * 8,
      8,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 186, 115, 0.12)';
    ctx.beginPath();
    ctx.arc(
      px,
      emberY + 2 + Math.sin(performance.now() * 0.004 + index) * 6,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
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
  slab.addColorStop(0, '#b39a78');
  slab.addColorStop(0.18, '#8a755c');
  slab.addColorStop(0.52, '#53463f');
  slab.addColorStop(1, '#231f22');

  ctx.fillStyle = slab;
  ctx.beginPath();
  ctx.moveTo(platform.x + 4, platform.y + 2);
  ctx.lineTo(platform.x + platform.width - 8, platform.y);
  ctx.lineTo(platform.x + platform.width, platform.y + 7);
  ctx.lineTo(platform.x + platform.width - 4, platform.y + platform.height);
  ctx.lineTo(platform.x + 2, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#dcc49a';
  ctx.fillRect(platform.x + 4, platform.y, platform.width - 10, 3);

  ctx.fillStyle = '#5a4c45';
  ctx.fillRect(platform.x + 3, platform.y + 4, platform.width - 8, 2);

  ctx.strokeStyle = 'rgba(18, 16, 16, 0.82)';
  ctx.lineWidth = 1.1;
  ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

  for (let crack = 12; crack < platform.width - 10; crack += 28) {
    ctx.strokeStyle = 'rgba(45, 30, 24, 0.3)';
    ctx.beginPath();
    ctx.moveTo(platform.x + crack, platform.y + 3);
    ctx.lineTo(platform.x + crack - 4, platform.y + 10);
    ctx.lineTo(platform.x + crack + 2, platform.y + 17);
    ctx.stroke();
  }

  drawPlatformUnderside(ctx, platform);
}

function drawPlatformUnderside(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  ctx.strokeStyle = 'rgba(36, 24, 20, 0.56)';
  ctx.lineWidth = 2;

  for (let x = 10; x < platform.width - 8; x += 24) {
    const px = platform.x + x;
    const py = platform.y + platform.height - 1;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 4, py + 8);
    ctx.stroke();
  }
}
