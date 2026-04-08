import { Boss } from '../../domain/bosses/boss.model';
import { Hero } from '../../domain/hero/hero.model';

export function drawHud(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  hero: Hero,
  specialCharge: number,
  score: number,
  coins: number,
  boss: Boss,
  bossName: string,
  lives: number,
  formattedTime: string,
  isTimeWarning: boolean,
  specialHudLabel = 'Especial',
): void {
  const leftX = 18;
  const topY = 14;

  const centerX = canvas.width / 2;
  const rightX = canvas.width - 18;

  ctx.save();

  drawLeftBlock(ctx, hero, specialCharge, lives, leftX, topY, specialHudLabel);
  drawCenterBlock(ctx, centerX, topY, formattedTime, isTimeWarning);
  drawRightBlock(ctx, rightX, topY, coins, score);

  if (boss.active && boss.hp > 0) {
    drawBossBar(ctx, canvas, boss, bossName);
  }

  if (specialCharge >= 100) {
    drawSpecialReadyAlert(ctx, leftX, topY + 90, specialHudLabel);
  }

  ctx.restore();
}

function drawLeftBlock(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  specialCharge: number,
  lives: number,
  x: number,
  y: number,
  specialHudLabel: string,
): void {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4e7c7';
  ctx.font = 'bold 16px "Press Start 2P", Arial';
  ctx.fillText(hero.name, x, y + 12);

  drawLivesBlock(ctx, x, y + 34, lives);
  drawSpecialBlock(ctx, x, y + 68, specialCharge, specialHudLabel);
}

function drawCenterBlock(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  formattedTime: string,
  isTimeWarning: boolean,
): void {
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(217, 222, 234, 0.88)';
  ctx.font = '11px "Press Start 2P", Arial';
  ctx.fillText('Tempo', centerX, y + 10);

  ctx.fillStyle = isTimeWarning ? '#ff9f9f' : '#fff4df';
  ctx.font = 'bold 15px "Press Start 2P", Arial';
  ctx.fillText(formattedTime, centerX, y + 30);
}

function drawRightBlock(
  ctx: CanvasRenderingContext2D,
  rightX: number,
  y: number,
  coins: number,
  score: number,
): void {
  drawCoinsLine(ctx, rightX, y + 10, coins);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff4df';
  ctx.font = 'bold 14px "Press Start 2P", Arial';
  ctx.fillText(`${score}`, rightX, y + 42);

  ctx.fillStyle = 'rgba(217, 222, 234, 0.82)';
  ctx.font = '11px "Press Start 2P", Arial';
  ctx.fillText('ESC pausa', rightX, y + 62);
}

function drawLivesBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lives: number,
): void {
  const iconCenterY = y;

  drawLifeIcon(ctx, x + 8, iconCenterY, true);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff4df';
  ctx.font = 'bold 15px "Press Start 2P", Arial';
  ctx.fillText(`x${lives}`, x + 22, iconCenterY);
  ctx.textBaseline = 'alphabetic';
}

function drawLifeIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  active: boolean,
): void {
  ctx.save();
  ctx.translate(x, y);

  if (active) {
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 14);
    glow.addColorStop(0, 'rgba(255, 175, 88, 0.42)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = active ? '#ff8c57' : '#42353c';
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-11, 2, -11, -9, -3, -9);
  ctx.bezierCurveTo(0, -9, 1, -6, 0, -4);
  ctx.bezierCurveTo(1, -6, 3, -9, 6, -9);
  ctx.bezierCurveTo(14, -9, 14, 2, 0, 10);
  ctx.fill();

  ctx.fillStyle = active ? '#ffd7b8' : '#6f6068';
  ctx.beginPath();
  ctx.arc(-2, -3, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSpecialBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  specialCharge: number,
  specialHudLabel: string,
): void {
  const barWidth = 184;
  const barHeight = 12;
  const percent = Math.max(0, Math.min(1, specialCharge / 100));
  const isSuperSpecial = specialCharge >= 100;

  ctx.textAlign = 'left';
  ctx.fillStyle = isSuperSpecial ? '#ffbb88' : 'rgba(217, 222, 234, 0.88)';
  ctx.font = '10px "Press Start 2P", Arial';
  ctx.fillText(specialHudLabel.toUpperCase(), x, y - 6);

  ctx.fillStyle = '#121923';
  roundRect(ctx, x, y, barWidth, barHeight, 7);
  ctx.fill();

  const specialGradient = ctx.createLinearGradient(x, y, x + barWidth, y);

  if (isSuperSpecial) {
    specialGradient.addColorStop(0, '#ff6a2a');
    specialGradient.addColorStop(0.5, '#ff8e3c');
    specialGradient.addColorStop(1, '#ffd08f');
  } else {
    specialGradient.addColorStop(0, '#5ac9ff');
    specialGradient.addColorStop(0.5, '#8eeaff');
    specialGradient.addColorStop(1, '#d6fbff');
  }

  ctx.fillStyle = specialGradient;
  roundRect(ctx, x, y, barWidth * percent, barHeight, 7);
  ctx.fill();

  drawSpecialSegments(ctx, x, y, barWidth, barHeight);

  if (isSuperSpecial) {
    const pulse = Math.sin(performance.now() * 0.012) * 0.5 + 0.5;
    const glow = ctx.createLinearGradient(x, y, x + barWidth, y);
    glow.addColorStop(0, `rgba(255, 96, 32, ${0.18 + pulse * 0.18})`);
    glow.addColorStop(0.5, `rgba(255, 140, 60, ${0.26 + pulse * 0.22})`);
    glow.addColorStop(1, `rgba(255, 208, 143, ${0.16 + pulse * 0.16})`);

    ctx.fillStyle = glow;
    roundRect(ctx, x - 2, y - 2, barWidth + 4, barHeight + 4, 9);
    ctx.fill();
  }

  ctx.strokeStyle =
    isSuperSpecial ? '#ffb36a' : 'rgba(141, 215, 255, 0.35)';
  ctx.lineWidth = isSuperSpecial ? 1.9 : 1;
  roundRect(ctx, x, y, barWidth, barHeight, 7);
  ctx.stroke();

  ctx.fillStyle = '#fff4df';
  ctx.font = 'bold 11px "Press Start 2P", Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.round(specialCharge)}%`, x + barWidth + 10, y + 10);
}

function drawSpecialSegments(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  barWidth: number,
  barHeight: number,
): void {
  const section = barWidth / 3;

  ctx.strokeStyle = 'rgba(12, 18, 28, 0.72)';
  ctx.lineWidth = 2;

  for (let index = 1; index <= 2; index += 1) {
    const lineX = x + section * index;

    ctx.beginPath();
    ctx.moveTo(lineX, y + 1.5);
    ctx.lineTo(lineX, y + barHeight - 1.5);
    ctx.stroke();
  }
}

function drawCoinsLine(
  ctx: CanvasRenderingContext2D,
  rightX: number,
  centerY: number,
  coins: number,
): void {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffe3a0';
  ctx.font = 'bold 13px "Press Start 2P", Arial';
  ctx.fillText(`x${coins}`, rightX, centerY);

  const coinOffset = 46;
  drawCoinIcon(ctx, rightX - coinOffset, centerY);
  ctx.textBaseline = 'alphabetic';
}

function drawCoinIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  ctx.save();
  ctx.translate(x, y);

  const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 12);
  glow.addColorStop(0, 'rgba(255, 212, 90, 0.38)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  const gold = ctx.createLinearGradient(0, -8, 0, 8);
  gold.addColorStop(0, '#ffe79b');
  gold.addColorStop(0.55, '#ffcc4d');
  gold.addColorStop(1, '#d89b1d');

  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8f6412';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 245, 196, 0.78)';
  ctx.beginPath();
  ctx.arc(-2, -2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBossBar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  boss: Boss,
  bossName: string,
): void {
  const barWidth = 400;
  const barHeight = 16;
  const x = canvas.width / 2 - barWidth / 2;
  const y = 66;

  ctx.fillStyle = 'rgba(8, 10, 14, 0.78)';
  roundRect(ctx, x - 12, y - 28, barWidth + 24, 48, 14);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f3d6c0';
  ctx.font = 'bold 14px "Press Start 2P", Arial';
  ctx.fillText(bossName, canvas.width / 2, y - 9);

  ctx.fillStyle = '#181b24';
  roundRect(ctx, x, y, barWidth, barHeight, 9);
  ctx.fill();

  const bossBarGradient = ctx.createLinearGradient(x, y, x + barWidth, y);
  bossBarGradient.addColorStop(0, '#7a2030');
  bossBarGradient.addColorStop(0.5, '#c23f55');
  bossBarGradient.addColorStop(1, '#ff9c73');

  ctx.fillStyle = bossBarGradient;
  roundRect(
    ctx,
    x,
    y,
    Math.max(0, (boss.hp / boss.maxHp) * barWidth),
    barHeight,
    9,
  );
  ctx.fill();

  ctx.strokeStyle = 'rgba(244, 231, 199, 0.2)';
  ctx.lineWidth = 1.1;
  roundRect(ctx, x, y, barWidth, barHeight, 9);
  ctx.stroke();
}

function drawSpecialReadyAlert(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  specialHudLabel: string,
): void {
  const width = 228;
  const height = 32;
  const pulse = Math.sin(performance.now() * 0.012) * 0.5 + 0.5;
  const isSuperSpecial = specialHudLabel === 'Super Especial';

  const bg = ctx.createLinearGradient(x, y, x, y + height);

  if (isSuperSpecial) {
    bg.addColorStop(0, `rgba(120, 34, 18, ${0.84 + pulse * 0.08})`);
    bg.addColorStop(1, `rgba(58, 17, 10, ${0.84 + pulse * 0.08})`);
  } else {
    bg.addColorStop(0, `rgba(32, 77, 95, ${0.8 + pulse * 0.08})`);
    bg.addColorStop(1, `rgba(10, 38, 48, ${0.8 + pulse * 0.08})`);
  }

  ctx.fillStyle = bg;
  roundRect(ctx, x, y, width, height, 10);
  ctx.fill();

  ctx.strokeStyle = isSuperSpecial
    ? `rgba(255, 183, 106, ${0.35 + pulse * 0.25})`
    : `rgba(168, 240, 255, ${0.35 + pulse * 0.25})`;
  ctx.lineWidth = 1.2;
  roundRect(ctx, x, y, width, height, 10);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = isSuperSpecial ? '#ffd3a3' : '#d6fbff';
  ctx.font = 'bold 13px "Press Start 2P", Arial';
  ctx.fillText(
    isSuperSpecial ? 'Super Especial (J + L)' : 'Especial (L)',
    x + 12,
    y + 21,
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}
