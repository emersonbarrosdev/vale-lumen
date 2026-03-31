import { Enemy } from '../../domain/enemies/enemy.model';

export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
): void {
  for (const enemy of enemies) {
    if (!enemy.active) {
      continue;
    }

    const pulse =
      Math.sin(performance.now() / 260 + enemy.hoverOffset) * 0.5 + 0.5;
    const bob =
      Math.sin(performance.now() / 300 + enemy.hoverOffset) *
      (enemy.type === 'vigia' ? 2 : 1);

    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + bob);
    ctx.scale(enemy.direction, 1);

    if (enemy.type === 'vigia') {
      const aura = ctx.createRadialGradient(0, -4, 2, 0, -4, 40);
      aura.addColorStop(0, 'rgba(114, 220, 255, 0.42)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -4, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = enemy.hitFlash > 0 ? '#efe3d7' : '#0b0f15';
      ctx.beginPath();
      ctx.moveTo(-22, -8);
      ctx.lineTo(-10, -24);
      ctx.lineTo(14, -24);
      ctx.lineTo(24, -8);
      ctx.lineTo(18, 28);
      ctx.lineTo(-16, 28);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#182131';
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(2, -8);
      ctx.lineTo(14, -2);
      ctx.lineTo(12, 14);
      ctx.lineTo(-8, 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#7be8ff';
      ctx.beginPath();
      ctx.arc(4, -4, 7 + pulse * 1.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(114, 220, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(4, -4);
      ctx.lineTo(14, -12);
      ctx.moveTo(-6, 10);
      ctx.lineTo(4, -4);
      ctx.lineTo(12, 8);
      ctx.stroke();

      ctx.fillStyle = '#24121b';
      ctx.fillRect(-18, -6, 8, 22);
      ctx.fillRect(18, -6, 8, 22);

      ctx.fillStyle = '#2a0c15';
      ctx.beginPath();
      ctx.moveTo(-14, -22);
      ctx.lineTo(-8, -30);
      ctx.lineTo(-6, -20);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, -20);
      ctx.lineTo(12, -30);
      ctx.lineTo(16, -22);
      ctx.closePath();
      ctx.fill();
    } else {
      const aura = ctx.createRadialGradient(0, -2, 1, 0, -2, 28);
      aura.addColorStop(0, 'rgba(125, 255, 178, 0.32)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -2, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = enemy.hitFlash > 0 ? '#efe3d7' : '#11151b';
      ctx.beginPath();
      ctx.moveTo(-16, -6);
      ctx.lineTo(-8, -16);
      ctx.lineTo(12, -16);
      ctx.lineTo(18, -4);
      ctx.lineTo(12, 18);
      ctx.lineTo(-12, 18);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#171c22';
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(6, -6);
      ctx.lineTo(14, 0);
      ctx.lineTo(10, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#7dffb2';
      ctx.beginPath();
      ctx.arc(1, -2, 5.5 + pulse * 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(125, 255, 178, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.lineTo(1, -2);
      ctx.lineTo(12, 10);
      ctx.stroke();

      ctx.fillStyle = '#0d1117';
      ctx.fillRect(-18, -2, 6, 16);
      ctx.fillRect(14, -2, 6, 16);
    }

    ctx.restore();
  }
}
