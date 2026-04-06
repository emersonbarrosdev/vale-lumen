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
  topGradient.addColorStop(0, '#6f5d48');
  topGradient.addColorStop(0.06, '#4c4136');
  topGradient.addColorStop(0.14, '#2a2827');
  topGradient.addColorStop(0.5, '#16161c');
  topGradient.addColorStop(1, '#07080b');

  ctx.fillStyle = topGradient;
  ctx.beginPath();
  ctx.moveTo(platform.x, platform.y + 8);

  for (let x = 0; x <= platform.width; x += 18) {
    const yOffset = Math.sin((platform.x + x) * 0.06) * 2.6;
    ctx.lineTo(platform.x + x, platform.y + yOffset);
  }

  ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + platform.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#947253';
  ctx.fillRect(platform.x, platform.y, platform.width, 5);

  ctx.fillStyle = '#3b312f';
  for (let x = 10; x < platform.width - 8; x += 34) {
    ctx.fillRect(platform.x + x, platform.y + 7, 14, 10);
    ctx.fillRect(platform.x + x + 12, platform.y + 12, 8, 8);
  }

  ctx.strokeStyle = 'rgba(255, 160, 84, 0.12)';
  ctx.lineWidth = 1;
  for (let crack = 24; crack < platform.width - 12; crack += 58) {
    ctx.beginPath();
    ctx.moveTo(platform.x + crack, platform.y + 10);
    ctx.lineTo(platform.x + crack - 6, platform.y + 22);
    ctx.lineTo(platform.x + crack + 2, platform.y + 36);
    ctx.lineTo(platform.x + crack - 5, platform.y + 56);
    ctx.stroke();
  }

  ctx.fillStyle = '#0b0c10';
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
  ctx.strokeStyle = 'rgba(31, 20, 24, 0.74)';
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

function drawGroundEdges(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const leftGlow = ctx.createLinearGradient(platform.x - 32, 0, platform.x + 10, 0);
  leftGlow.addColorStop(0, 'rgba(255, 132, 74, 0)');
  leftGlow.addColorStop(1, 'rgba(255, 132, 74, 0.28)');
  ctx.fillStyle = leftGlow;
  ctx.fillRect(platform.x - 32, platform.y + 6, 32, platform.height - 6);

  const rightGlow = ctx.createLinearGradient(
    platform.x + platform.width - 10,
    0,
    platform.x + platform.width + 32,
    0,
  );
  rightGlow.addColorStop(0, 'rgba(255, 132, 74, 0.28)');
  rightGlow.addColorStop(1, 'rgba(255, 132, 74, 0)');
  ctx.fillStyle = rightGlow;
  ctx.fillRect(platform.x + platform.width, platform.y + 6, 32, platform.height - 6);
}

function drawPit(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
): void {
  const pitWidth = endX - startX;

  const pitGradient = ctx.createLinearGradient(0, groundY, 0, 720);
  pitGradient.addColorStop(0, 'rgba(255, 98, 42, 0.14)');
  pitGradient.addColorStop(0.08, 'rgba(126, 24, 18, 0.22)');
  pitGradient.addColorStop(0.24, 'rgba(28, 6, 10, 0.76)');
  pitGradient.addColorStop(1, 'rgba(0, 0, 0, 0.99)');
  ctx.fillStyle = pitGradient;
  ctx.fillRect(startX, groundY, pitWidth, 138);

  ctx.fillStyle = 'rgba(255, 140, 72, 0.2)';
  ctx.beginPath();
  ctx.moveTo(startX, groundY + 4);
  ctx.lineTo(startX + 20, groundY + 30);
  ctx.lineTo(startX, groundY + 60);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(endX, groundY + 4);
  ctx.lineTo(endX - 20, groundY + 30);
  ctx.lineTo(endX, groundY + 60);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 160, 90, 0.34)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, groundY + 3);
  ctx.lineTo(startX + 18, groundY + 26);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, groundY + 3);
  ctx.lineTo(endX - 18, groundY + 26);
  ctx.stroke();

  const emberY = groundY + 92;

  for (let index = 0; index < Math.max(2, Math.floor(pitWidth / 64)); index += 1) {
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
  slab.addColorStop(0, '#7f786d');
  slab.addColorStop(0.2, '#5a544c');
  slab.addColorStop(1, '#231f22');

  ctx.fillStyle = slab;
  ctx.beginPath();
  ctx.moveTo(platform.x + 6, platform.y);
  ctx.lineTo(platform.x + platform.width - 10, platform.y);
  ctx.lineTo(platform.x + platform.width, platform.y + 8);
  ctx.lineTo(platform.x + platform.width - 4, platform.y + platform.height);
  ctx.lineTo(platform.x + 2, platform.y + platform.height);
  ctx.lineTo(platform.x, platform.y + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#a4937c';
  ctx.fillRect(platform.x + 6, platform.y, platform.width - 16, 3);

  ctx.strokeStyle = 'rgba(18, 16, 16, 0.8)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

  for (let crack = 12; crack < platform.width - 10; crack += 28) {
    ctx.strokeStyle = 'rgba(45, 30, 24, 0.36)';
    ctx.beginPath();
    ctx.moveTo(platform.x + crack, platform.y + 3);
    ctx.lineTo(platform.x + crack - 4, platform.y + 10);
    ctx.lineTo(platform.x + crack + 2, platform.y + 17);
    ctx.stroke();
  }
}
