import { Collectible } from '../../../domain/world/collectible.model';

export function drawCollectibles(
  ctx: CanvasRenderingContext2D,
  collectibles: Collectible[],
): void {
  const time = performance.now();

  for (const item of collectibles) {
    if (item.collected) {
      continue;
    }

    const bob = Math.sin(time * 0.0022 + item.x * 0.015) * 3;
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2 + bob;

    if (item.type === 'coin') {
      drawCoinMarioStyle(ctx, centerX, centerY, time, false);
      continue;
    }

    if (item.type === 'lifeFragment') {
      drawLifeFragment(ctx, centerX, centerY);
      continue;
    }

    if (item.type === 'specialSpark') {
      drawSpecialSpark(ctx, centerX, centerY, time);
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

    if (item.type === 'shieldOrb') {
      drawShieldOrb(ctx, centerX, centerY);
      continue;
    }

    drawRay(ctx, centerX, centerY);
  }
}

function drawCoinMarioStyle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  special: boolean,
): void {
  const spin = Math.sin(time * 0.0048 + x * 0.01);
  const widthFactor = Math.max(0.22, Math.abs(spin));
  const frontFacing = spin >= 0;

  const coinWidth = (special ? 10 : 8) * widthFactor;
  const coinHeight = special ? 13 : 11;

  const glow = ctx.createRadialGradient(x, y, 1, x, y, special ? 22 : 18);
  glow.addColorStop(
    0,
    special ? 'rgba(255, 244, 168, 0.56)' : 'rgba(255, 227, 122, 0.42)',
  );
  glow.addColorStop(
    0.45,
    special ? 'rgba(255, 196, 64, 0.24)' : 'rgba(255, 184, 72, 0.18)',
  );
  glow.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, special ? 20 : 16, 0, Math.PI * 2);
  ctx.fill();

  if (coinWidth <= 2.4) {
    ctx.fillStyle = special ? '#ffe78c' : '#ffd95b';
    ctx.fillRect(x - 1.2, y - coinHeight, 2.4, coinHeight * 2);

    ctx.strokeStyle = special ? '#d6a21b' : '#d79814';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x - 1.2, y - coinHeight, 2.4, coinHeight * 2);
    return;
  }

  const outerColor = special ? '#f8d14f' : '#f8c431';
  const innerColor = special ? '#ffe78c' : '#ffd95b';
  const strokeColor = special ? '#d19a12' : '#d79814';
  const markColor = special ? '#fff7bf' : '#fff2a9';

  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.ellipse(x, y, coinWidth, coinHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = innerColor;
  ctx.beginPath();
  ctx.ellipse(x - 1, y - 0.5, Math.max(1.6, coinWidth - 2), coinHeight - 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = special ? 2 : 1.8;
  ctx.beginPath();
  ctx.ellipse(x, y, coinWidth, coinHeight, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (frontFacing) {
    ctx.strokeStyle = markColor;
    ctx.lineWidth = special ? 1.5 : 1.3;
    ctx.lineCap = 'round';

    if (special) {
      drawStarMark(ctx, x, y, Math.min(5.4, coinWidth - 1));
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y - 6.5);
      ctx.lineTo(x, y + 6.5);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = markColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - coinWidth * 0.3, y - coinHeight + 2);
    ctx.lineTo(x + coinWidth * 0.3, y + coinHeight - 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath();
  ctx.ellipse(
    x - Math.max(1.8, coinWidth * 0.28),
    y - coinHeight * 0.4,
    Math.max(1, coinWidth * 0.18),
    2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawStarMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
): void {
  const inner = radius * 0.45;

  ctx.beginPath();

  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI / 5) * i;
    const r = i % 2 === 0 ? radius : inner;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
  ctx.stroke();
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

function drawLifeFragment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 18);
  glow.addColorStop(0, 'rgba(255, 165, 173, 0.34)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff9aa2';
  ctx.beginPath();
  ctx.moveTo(x, y + 7);
  ctx.bezierCurveTo(x - 8, y + 1, x - 8, y - 8, x - 1.5, y - 8);
  ctx.bezierCurveTo(x + 0.5, y - 8, x + 1, y - 6, x, y - 4.5);
  ctx.bezierCurveTo(x + 1, y - 6, x + 1.5, y - 8, x + 4, y - 8);
  ctx.bezierCurveTo(x + 10, y - 8, x + 10, y + 1, x, y + 7);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(x - 2.2, y - 4.2, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpecialSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
): void {
  const pulse = Math.sin(time * 0.01 + x * 0.03) * 0.5 + 0.5;

  const glow = ctx.createRadialGradient(x, y, 1, x, y, 20);
  glow.addColorStop(0, 'rgba(142, 234, 255, 0.5)');
  glow.addColorStop(0.45, 'rgba(101, 208, 255, 0.22)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8eeaff';
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 8);
  ctx.lineTo(x + 1, y - 1);
  ctx.lineTo(x - 2, y - 1);
  ctx.lineTo(x + 6, y + 8);
  ctx.stroke();

  ctx.strokeStyle = `rgba(214, 251, 255, ${0.45 + pulse * 0.35})`;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x - 5, y);
  ctx.moveTo(x + 5, y);
  ctx.lineTo(x + 9, y);
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y - 6);
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + 10);
  ctx.stroke();
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

function drawShieldOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 24);
  glow.addColorStop(0, 'rgba(214, 251, 255, 0.6)');
  glow.addColorStop(0.38, 'rgba(130, 232, 255, 0.46)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(130, 232, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(x, y, 10.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#d6fbff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 9);
  ctx.lineTo(x + 7, y - 5);
  ctx.lineTo(x + 5.5, y + 4);
  ctx.lineTo(x, y + 9);
  ctx.lineTo(x - 5.5, y + 4);
  ctx.lineTo(x - 7, y - 5);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#82e8ff';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, 13.5, 0, Math.PI * 2);
  ctx.stroke();
}
