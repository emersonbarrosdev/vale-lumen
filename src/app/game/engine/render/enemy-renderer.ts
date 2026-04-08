import { EnemyProjectile } from '../../domain/enemies/enemy-projectile.model';
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
      getEnemyBobAmount(enemy);

    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + bob);
    ctx.scale(enemy.direction, 1);

    switch (enemy.type) {
      case 'vigia':
        drawVigiaEnemy(ctx, enemy, pulse);
        break;

      case 'corvoCorrompido':
        drawCorruptedCrowEnemy(ctx, enemy, pulse);
        break;

      case 'gosmaPequena':
        drawSmallGooEnemy(ctx, enemy, pulse);
        break;

      case 'errante':
      default:
        drawErranteEnemy(ctx, enemy, pulse);
        break;
    }

    ctx.restore();
  }
}

export function drawEnemyProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: EnemyProjectile[],
): void {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    const glow = ctx.createRadialGradient(
      projectile.x,
      projectile.y,
      1,
      projectile.x,
      projectile.y,
      projectile.radius * 2.9,
    );
    glow.addColorStop(0, 'rgba(180, 255, 190, 0.94)');
    glow.addColorStop(0.32, 'rgba(82, 214, 104, 0.72)');
    glow.addColorStop(0.7, 'rgba(18, 83, 28, 0.26)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3ab34f';
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(232, 255, 237, 0.9)';
    ctx.beginPath();
    ctx.arc(
      projectile.x - projectile.radius * 0.25,
      projectile.y - projectile.radius * 0.28,
      Math.max(2, projectile.radius * 0.28),
      0,
      Math.PI * 2,
    );
    ctx.fill();

    const dropletCount = 4;
    for (let index = 0; index < dropletCount; index += 1) {
      const angle = -1.9 + index * 0.72;
      const dist = projectile.radius + 3;
      const px = projectile.x + Math.cos(angle) * dist;
      const py = projectile.y + Math.sin(angle) * dist;

      ctx.fillStyle = 'rgba(95, 230, 110, 0.76)';
      ctx.beginPath();
      ctx.arc(px, py, 1.8 + (index % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function getEnemyBobAmount(enemy: Enemy): number {
  switch (enemy.type) {
    case 'vigia':
      return 2;

    case 'corvoCorrompido':
      return 4.5;

    case 'gosmaPequena':
      return 0.8;

    case 'errante':
    default:
      return 1;
  }
}

function drawVigiaEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  pulse: number,
): void {
  const aura = ctx.createRadialGradient(0, -6, 2, 0, -6, 50);
  aura.addColorStop(0, 'rgba(143, 255, 162, 0.46)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -6, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = enemy.hitFlash > 0 ? '#dfe9dc' : '#0b0f15';
  ctx.beginPath();
  ctx.moveTo(-24, -10);
  ctx.lineTo(-12, -28);
  ctx.lineTo(18, -28);
  ctx.lineTo(28, -10);
  ctx.lineTo(20, 30);
  ctx.lineTo(-20, 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#152018';
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.lineTo(4, -10);
  ctx.lineTo(18, -2);
  ctx.lineTo(14, 16);
  ctx.lineTo(-10, 16);
  ctx.closePath();
  ctx.fill();

  const coreGlow = ctx.createRadialGradient(4, -5, 2, 4, -5, 20 + pulse * 3);
  coreGlow.addColorStop(0, 'rgba(225, 255, 233, 0.95)');
  coreGlow.addColorStop(0.3, 'rgba(145, 255, 166, 0.8)');
  coreGlow.addColorStop(0.7, 'rgba(72, 196, 94, 0.34)');
  coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(4, -5, 18 + pulse * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#bfffd0';
  ctx.beginPath();
  ctx.arc(4, -5, 8.8 + pulse * 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ebfff0';
  ctx.beginPath();
  ctx.arc(1.6, -7.3, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(145, 255, 166, ${0.44 + pulse * 0.18})`;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-13, -12);
  ctx.lineTo(-3, -8);
  ctx.lineTo(4, -5);
  ctx.lineTo(12, -11);
  ctx.lineTo(20, -14);

  ctx.moveTo(-9, 8);
  ctx.lineTo(-1, 2);
  ctx.lineTo(4, -5);
  ctx.lineTo(10, 1);
  ctx.lineTo(18, 7);

  ctx.moveTo(-2, -20);
  ctx.lineTo(2, -12);
  ctx.lineTo(4, -5);
  ctx.lineTo(8, -13);
  ctx.lineTo(12, -21);
  ctx.stroke();

  ctx.fillStyle = '#101713';
  ctx.fillRect(-18, -4, 8, 22);
  ctx.fillRect(20, -4, 8, 22);

  ctx.fillStyle = '#17301a';
  ctx.beginPath();
  ctx.moveTo(-16, -24);
  ctx.lineTo(-10, -34);
  ctx.lineTo(-8, -22);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, -22);
  ctx.lineTo(14, -34);
  ctx.lineTo(18, -24);
  ctx.closePath();
  ctx.fill();
}

function drawErranteEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  pulse: number,
): void {
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

function drawCorruptedCrowEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  pulse: number,
): void {
  const wingPhase = Math.sin(performance.now() * 0.02 + enemy.hoverOffset);

  const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
  aura.addColorStop(0, 'rgba(138, 255, 168, 0.18)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fill();

  const wingLift = 9 + wingPhase * 5;

  ctx.strokeStyle = enemy.hitFlash > 0 ? '#dce7de' : '#161a20';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(-16, -wingLift, -28, -2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, -2);
  ctx.quadraticCurveTo(18, -wingLift, 31, -1);
  ctx.stroke();

  ctx.fillStyle = enemy.hitFlash > 0 ? '#dce7de' : '#0f1318';
  ctx.beginPath();
  ctx.ellipse(0, 2, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(8, -3, 6.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1f252d';
  ctx.beginPath();
  ctx.moveTo(-8, 1);
  ctx.lineTo(-18, 10);
  ctx.lineTo(-4, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#89ffaf';
  ctx.beginPath();
  ctx.arc(10, -4, 2.6 + pulse * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f1fff4';
  ctx.beginPath();
  ctx.arc(10.6, -4.6, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#93d65c';
  ctx.beginPath();
  ctx.moveTo(14, -2);
  ctx.lineTo(22, 1);
  ctx.lineTo(13, 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(137, 255, 175, 0.3)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-20, -1);
  ctx.lineTo(-27, 5);
  ctx.moveTo(19, -1);
  ctx.lineTo(28, 5);
  ctx.stroke();
}

function drawSmallGooEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  pulse: number,
): void {
  const squash = 1 + Math.sin(performance.now() * 0.012 + enemy.hoverOffset) * 0.06;

  ctx.save();
  ctx.scale(1.05, squash);

  const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 24);
  glow.addColorStop(0, 'rgba(132, 255, 160, 0.26)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 2, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = enemy.hitFlash > 0 ? '#d8ffdf' : '#2e7d32';
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.quadraticCurveTo(-18, -10, -7, -14);
  ctx.quadraticCurveTo(0, -19, 7, -14);
  ctx.quadraticCurveTo(18, -10, 16, 10);
  ctx.quadraticCurveTo(0, 17, -16, 10);
  ctx.fill();

  ctx.fillStyle = '#49b84f';
  ctx.beginPath();
  ctx.moveTo(-11, 8);
  ctx.quadraticCurveTo(-10, -4, -3, -7);
  ctx.quadraticCurveTo(0, -9, 4, -7);
  ctx.quadraticCurveTo(10, -4, 11, 8);
  ctx.quadraticCurveTo(0, 12, -11, 8);
  ctx.fill();

  ctx.fillStyle = '#d6ffd9';
  ctx.beginPath();
  ctx.ellipse(-5, -1, 2.2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(5, -1, 2.2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0b1a0c';
  ctx.beginPath();
  ctx.arc(-5, 0, 1.1 + pulse * 0.15, 0, Math.PI * 2);
  ctx.arc(5, 0, 1.1 + pulse * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(214, 255, 217, 0.38)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-7, -8);
  ctx.quadraticCurveTo(-2, -12, 2, -10);
  ctx.stroke();

  ctx.restore();
}
