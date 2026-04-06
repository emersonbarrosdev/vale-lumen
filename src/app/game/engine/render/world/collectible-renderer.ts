import { Collectible } from '../../../domain/world/collectible.model';

export function drawCollectibles(
  ctx: CanvasRenderingContext2D,
  collectibles: Collectible[],
): void {
  for (const item of collectibles) {
    if (item.collected) {
      continue;
    }

    const bob = Math.sin(performance.now() * 0.004 + item.x * 0.02) * 4;
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2 + bob;

    if (item.type === 'coin') {
      drawCoin(ctx, centerX, centerY);
      continue;
    }

    if (item.type === 'heart') {
      drawHeart(ctx, centerX, centerY);
      continue;
    }

    if (item.type === 'flameVial') {
      drawFlameVial(ctx, centerX, centerY);
      continue;
    }

    drawRay(ctx, centerX, centerY);
  }
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 16);
  glow.addColorStop(0, 'rgba(255, 220, 120, 0.38)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f2c14b';
  ctx.beginPath();
  ctx.ellipse(x, y, 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.ellipse(x - 2, y - 2, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 18);
  glow.addColorStop(0, 'rgba(255, 146, 146, 0.35)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff7b7b';
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.bezierCurveTo(x - 10, y + 1, x - 10, y - 10, x - 2, y - 10);
  ctx.bezierCurveTo(x + 1, y - 10, x + 2, y - 7, x, y - 5);
  ctx.bezierCurveTo(x + 2, y - 7, x + 3, y - 10, x + 6, y - 10);
  ctx.bezierCurveTo(x + 14, y - 10, x + 14, y + 1, x, y + 8);
  ctx.fill();
}

function drawRay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 18);
  glow.addColorStop(0, 'rgba(125, 232, 255, 0.46)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8eeaff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 8);
  ctx.lineTo(x + 1, y - 1);
  ctx.lineTo(x - 1, y - 1);
  ctx.lineTo(x + 5, y + 8);
  ctx.stroke();
}

function drawFlameVial(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 20);
  glow.addColorStop(0, 'rgba(255, 178, 82, 0.45)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9fd6ff';
  ctx.fillRect(x - 5, y - 8, 10, 14);

  ctx.fillStyle = '#d9f1ff';
  ctx.fillRect(x - 3, y - 12, 6, 4);

  ctx.fillStyle = '#ff9b42';
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.quadraticCurveTo(x + 6, y, x, y + 6);
  ctx.quadraticCurveTo(x - 5, y, x, y - 6);
  ctx.fill();
}
