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
): void {
  const heroPanelX = 20;
  const heroPanelY = 18;
  const heroPanelWidth = 360;
  const heroPanelHeight = 104;

  ctx.save();

  ctx.fillStyle = 'rgba(6, 8, 12, 0.62)';
  ctx.fillRect(heroPanelX, heroPanelY, heroPanelWidth, heroPanelHeight);
  ctx.fillRect(canvas.width - 250, 18, 230, 94);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4e7c7';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(hero.name, heroPanelX + 18, heroPanelY + 28);

  const hpBarX = heroPanelX + 18;
  const hpBarY = heroPanelY + 40;
  const hpBarWidth = 180;
  const hpBarHeight = 14;
  const hpPercent = hero.hp / hero.maxHp;

  ctx.fillStyle = '#181b24';
  ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

  let hpColor = '#58d26c';

  if (hpPercent <= 0.15) {
    const blink = Math.floor(performance.now() / 150) % 2 === 0;
    hpColor = blink ? '#ff425d' : '#8f182b';
  } else if (hpPercent <= 0.3) {
    hpColor = '#ff7b62';
  } else if (hpPercent <= 0.6) {
    hpColor = '#d9c85c';
  } else {
    hpColor = '#58d26c';
  }

  ctx.fillStyle = hpColor;
  ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

  ctx.strokeStyle = 'rgba(244, 231, 199, 0.22)';
  ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

  ctx.fillStyle = '#cfd8ea';
  ctx.font = '13px Arial';
  ctx.fillText('Vida', hpBarX + hpBarWidth + 14, hpBarY + 11);

  const specialBarX = heroPanelX + 18;
  const specialBarY = heroPanelY + 72;
  const specialBarWidth = 180;
  const specialBarHeight = 12;
  const specialPercent = specialCharge / 100;

  ctx.fillStyle = '#131923';
  ctx.fillRect(specialBarX, specialBarY, specialBarWidth, specialBarHeight);

  const specialGradient = ctx.createLinearGradient(
    specialBarX,
    specialBarY,
    specialBarX + specialBarWidth,
    specialBarY,
  );
  specialGradient.addColorStop(0, '#5ac9ff');
  specialGradient.addColorStop(0.5, '#8eeaff');
  specialGradient.addColorStop(1, '#d6fbff');

  ctx.fillStyle = specialGradient;
  ctx.fillRect(
    specialBarX,
    specialBarY,
    specialBarWidth * specialPercent,
    specialBarHeight,
  );

  ctx.strokeStyle =
    specialCharge >= 100 ? '#d6fbff' : 'rgba(141, 215, 255, 0.35)';
  ctx.lineWidth = specialCharge >= 100 ? 2.4 : 1;
  ctx.strokeRect(
    specialBarX,
    specialBarY,
    specialBarWidth,
    specialBarHeight,
  );

  if (specialCharge >= 100) {
    ctx.strokeStyle = 'rgba(168, 240, 255, 0.45)';
    ctx.strokeRect(
      specialBarX - 3,
      specialBarY - 3,
      specialBarWidth + 6,
      specialBarHeight + 6,
    );
  }

  ctx.fillStyle = '#d9deea';
  ctx.font = '15px Arial';
  ctx.fillText('Especial', specialBarX + specialBarWidth + 14, specialBarY + 10);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4e7c7';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`Fase ${phaseTitle}`, canvas.width / 2, 42);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#d9deea';
  ctx.font = '18px Arial';
  ctx.fillText(`Pontos: ${score}`, canvas.width - 40, 50);
  ctx.fillText('ESC pausa', canvas.width - 40, 84);

  if (boss.active && boss.hp > 0) {
    const barWidth = 420;
    const barHeight = 18;
    const x = canvas.width / 2 - barWidth / 2;
    const y = 70;

    ctx.fillStyle = 'rgba(8, 10, 14, 0.78)';
    ctx.fillRect(x - 12, y - 30, barWidth + 24, 54);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f3d6c0';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(bossName, canvas.width / 2, y - 10);

    ctx.fillStyle = '#181b24';
    ctx.fillRect(x, y, barWidth, barHeight);

    const bossBarGradient = ctx.createLinearGradient(x, y, x + barWidth, y);
    bossBarGradient.addColorStop(0, '#7a2030');
    bossBarGradient.addColorStop(0.5, '#c23f55');
    bossBarGradient.addColorStop(1, '#ff9c73');

    ctx.fillStyle = bossBarGradient;
    ctx.fillRect(
      x,
      y,
      (boss.hp / boss.maxHp) * barWidth,
      barHeight,
    );

    ctx.strokeStyle = 'rgba(244, 231, 199, 0.2)';
    ctx.strokeRect(x, y, barWidth, barHeight);
  }

  if (specialCharge >= 100) {
    ctx.fillStyle = 'rgba(117, 234, 255, 0.14)';
    ctx.fillRect(20, 132, 250, 34);
    ctx.fillStyle = '#d6fbff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Especial pronto (L)', 34, 154);
  }

  ctx.restore();
}
