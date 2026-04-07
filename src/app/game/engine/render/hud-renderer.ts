import { Boss } from '../../domain/bosses/boss.model';
import { Hero } from '../../domain/hero/hero.model';

export function drawHud(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  hero: Hero,
  specialCharge: number,
  score: number,
  boss: Boss,
  phaseTitle: string,
  bossName: string,
  lives: number,
  maxLives: number,
  formattedTime: string,
  isTimeWarning: boolean,
): void {
  const leftPanelX = 20;
  const leftPanelY = 18;
  const leftPanelWidth = 382;
  const leftPanelHeight = 132;

  const rightPanelX = canvas.width - 272;
  const rightPanelY = 18;
  const rightPanelWidth = 252;
  const rightPanelHeight = 114;

  ctx.save();

  drawPanel(ctx, leftPanelX, leftPanelY, leftPanelWidth, leftPanelHeight);
  drawPanel(ctx, rightPanelX, rightPanelY, rightPanelWidth, rightPanelHeight);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4e7c7';
  ctx.font = 'bold 20px "Pixelify Sans", Arial';
  ctx.fillText(hero.name, leftPanelX + 18, leftPanelY + 28);

  drawLivesBlock(ctx, leftPanelX + 18, leftPanelY + 48, lives, maxLives);
  drawSpecialBlock(ctx, leftPanelX + 18, leftPanelY + 82, specialCharge);
  drawShieldBlock(ctx, leftPanelX + 214, leftPanelY + 82, hero.shieldActive);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4e7c7';
  ctx.font = 'bold 20px "Pixelify Sans", Arial';
  ctx.fillText(`Fase ${phaseTitle}`, canvas.width / 2, 42);

  drawTimerBlock(
    ctx,
    rightPanelX + 20,
    rightPanelY + 16,
    rightPanelWidth - 40,
    formattedTime,
    isTimeWarning,
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#d9deea';
  ctx.font = 'bold 19px "Pixelify Sans", Arial';
  ctx.fillText(`Pontos: ${score}`, canvas.width - 38, 86);

  ctx.fillStyle = 'rgba(217, 222, 234, 0.82)';
  ctx.font = '15px "Pixelify Sans", Arial';
  ctx.fillText('ESC pausa', canvas.width - 38, 108);

  if (boss.active && boss.hp > 0) {
    drawBossBar(ctx, canvas, boss, bossName);
  }

  if (specialCharge >= 100) {
    drawSpecialReadyAlert(ctx, leftPanelX, leftPanelY + leftPanelHeight + 10);
  }

  ctx.restore();
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const bg = ctx.createLinearGradient(x, y, x, y + height);
  bg.addColorStop(0, 'rgba(8, 11, 18, 0.82)');
  bg.addColorStop(1, 'rgba(5, 7, 11, 0.72)');

  ctx.fillStyle = bg;
  roundRect(ctx, x, y, width, height, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(244, 231, 199, 0.16)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, x, y, width, height, 16);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  roundRect(ctx, x + 3, y + 3, width - 6, height - 6, 13);
  ctx.stroke();
}

function drawLivesBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lives: number,
  maxLives: number,
): void {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d9deea';
  ctx.font = '14px "Pixelify Sans", Arial';
  ctx.fillText('Vidas', x, y);

  const iconY = y + 19;

  for (let index = 0; index < maxLives; index += 1) {
    const iconX = x + index * 28;
    const active = index < lives;
    drawLifeIcon(ctx, iconX, iconY, active);
  }

  ctx.fillStyle = '#fff4df';
  ctx.font = 'bold 16px "Pixelify Sans", Arial';
  ctx.fillText(`x ${lives}`, x + maxLives * 28 + 12, iconY + 5);
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
): void {
  const barWidth = 170;
  const barHeight = 14;
  const percent = Math.max(0, Math.min(1, specialCharge / 100));

  ctx.textAlign = 'left';
  ctx.fillStyle = '#d9deea';
  ctx.font = '14px "Pixelify Sans", Arial';
  ctx.fillText('Especial', x, y);

  const barY = y + 10;

  ctx.fillStyle = '#121923';
  roundRect(ctx, x, barY, barWidth, barHeight, 8);
  ctx.fill();

  const specialGradient = ctx.createLinearGradient(x, barY, x + barWidth, barY);
  specialGradient.addColorStop(0, '#5ac9ff');
  specialGradient.addColorStop(0.5, '#8eeaff');
  specialGradient.addColorStop(1, '#d6fbff');

  ctx.fillStyle = specialGradient;
  roundRect(ctx, x, barY, barWidth * percent, barHeight, 8);
  ctx.fill();

  ctx.strokeStyle =
    specialCharge >= 100 ? '#d6fbff' : 'rgba(141, 215, 255, 0.35)';
  ctx.lineWidth = specialCharge >= 100 ? 2.2 : 1.1;
  roundRect(ctx, x, barY, barWidth, barHeight, 8);
  ctx.stroke();

  ctx.fillStyle = '#fff4df';
  ctx.font = 'bold 14px "Pixelify Sans", Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(specialCharge)}%`, x + barWidth + 50, barY + 12);
}

function drawShieldBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shieldActive: boolean,
): void {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d9deea';
  ctx.font = '14px "Pixelify Sans", Arial';
  ctx.fillText('Proteção', x, y);

  const boxY = y + 8;
  const width = 130;
  const height = 18;

  ctx.fillStyle = 'rgba(18, 25, 35, 0.9)';
  roundRect(ctx, x, boxY, width, height, 8);
  ctx.fill();

  if (shieldActive) {
    const grad = ctx.createLinearGradient(x, boxY, x + width, boxY);
    grad.addColorStop(0, '#82e8ff');
    grad.addColorStop(1, '#d6fbff');
    ctx.fillStyle = grad;
    roundRect(ctx, x + 2, boxY + 2, width - 4, height - 4, 6);
    ctx.fill();

    ctx.fillStyle = '#08131c';
    ctx.font = 'bold 12px "Pixelify Sans", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ATIVA', x + width / 2, boxY + 13);
  } else {
    ctx.strokeStyle = 'rgba(130, 232, 255, 0.26)';
    ctx.lineWidth = 1.1;
    roundRect(ctx, x, boxY, width, height, 8);
    ctx.stroke();

    ctx.fillStyle = 'rgba(217, 222, 234, 0.66)';
    ctx.font = 'bold 12px "Pixelify Sans", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('INATIVA', x + width / 2, boxY + 13);
  }
}

function drawTimerBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  formattedTime: string,
  isTimeWarning: boolean,
): void {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d9deea';
  ctx.font = '14px "Pixelify Sans", Arial';
  ctx.fillText('Tempo', x, y);

  const timerBoxY = y + 8;
  const timerBoxHeight = 34;

  const timerBg = ctx.createLinearGradient(x, timerBoxY, x, timerBoxY + timerBoxHeight);
  if (isTimeWarning) {
    timerBg.addColorStop(0, 'rgba(74, 10, 14, 0.95)');
    timerBg.addColorStop(1, 'rgba(42, 6, 10, 0.95)');
  } else {
    timerBg.addColorStop(0, 'rgba(18, 22, 33, 0.95)');
    timerBg.addColorStop(1, 'rgba(10, 13, 20, 0.95)');
  }

  ctx.fillStyle = timerBg;
  roundRect(ctx, x, timerBoxY, width, timerBoxHeight, 10);
  ctx.fill();

  ctx.strokeStyle = isTimeWarning
    ? 'rgba(255, 92, 92, 0.62)'
    : 'rgba(244, 231, 199, 0.14)';
  ctx.lineWidth = isTimeWarning ? 1.8 : 1.1;
  roundRect(ctx, x, timerBoxY, width, timerBoxHeight, 10);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = isTimeWarning ? '#ff8e8e' : '#fff4df';
  ctx.font = 'bold 24px "Pixelify Sans", Arial';
  ctx.fillText(formattedTime, x + width / 2, timerBoxY + 24);
}

function drawBossBar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  boss: Boss,
  bossName: string,
): void {
  const barWidth = 420;
  const barHeight = 18;
  const x = canvas.width / 2 - barWidth / 2;
  const y = 70;

  ctx.fillStyle = 'rgba(8, 10, 14, 0.78)';
  roundRect(ctx, x - 12, y - 30, barWidth + 24, 54, 14);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f3d6c0';
  ctx.font = 'bold 18px "Pixelify Sans", Arial';
  ctx.fillText(bossName, canvas.width / 2, y - 10);

  ctx.fillStyle = '#181b24';
  roundRect(ctx, x, y, barWidth, barHeight, 10);
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
    10,
  );
  ctx.fill();

  ctx.strokeStyle = 'rgba(244, 231, 199, 0.2)';
  ctx.lineWidth = 1.1;
  roundRect(ctx, x, y, barWidth, barHeight, 10);
  ctx.stroke();
}

function drawSpecialReadyAlert(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const width = 248;
  const height = 36;
  const pulse = Math.sin(performance.now() * 0.012) * 0.5 + 0.5;

  const bg = ctx.createLinearGradient(x, y, x, y + height);
  bg.addColorStop(0, `rgba(32, 77, 95, ${0.8 + pulse * 0.08})`);
  bg.addColorStop(1, `rgba(10, 38, 48, ${0.8 + pulse * 0.08})`);

  ctx.fillStyle = bg;
  roundRect(ctx, x, y, width, height, 12);
  ctx.fill();

  ctx.strokeStyle = `rgba(168, 240, 255, ${0.35 + pulse * 0.25})`;
  ctx.lineWidth = 1.4;
  roundRect(ctx, x, y, width, height, 12);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#d6fbff';
  ctx.font = 'bold 18px "Pixelify Sans", Arial';
  ctx.fillText('Especial pronto (L)', x + 14, y + 24);
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
