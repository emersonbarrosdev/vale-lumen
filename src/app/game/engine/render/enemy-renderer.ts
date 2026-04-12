import { EnemyProjectile } from '../../domain/enemies/enemy-projectile.model';
import { Enemy } from '../../domain/enemies/enemy.model';

const GROUND_ENEMY_LINE_OFFSET = 1;

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
      getEnemyBob(enemy);

    const groundAlignedBob =
      enemy.type === 'gosmaPequena' || enemy.type === 'errante'
        ? 0
        : bob;

    ctx.save();
    ctx.translate(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2 + groundAlignedBob,
    );
    ctx.scale(enemy.direction, 1);

    if (enemy.type === 'vigia') {
      drawVigia(ctx, enemy, pulse);
    } else if (enemy.type === 'corvoCorrompido') {
      drawCorruptedCrow(ctx, enemy, pulse);
    } else if (enemy.type === 'gosmaPequena') {
      drawSmallRadioactiveGoo(ctx, enemy, pulse);
    } else {
      drawErrante(ctx, enemy, pulse);
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

function getEnemyBob(enemy: Enemy): number {
  switch (enemy.type) {
    case 'vigia':
      return 2;
    case 'corvoCorrompido':
      return 4;
    case 'gosmaPequena':
      return 0;
    case 'errante':
    default:
      return 0;
  }
}

function drawVigia(
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

function drawErrante(
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

function drawCorruptedCrow(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  pulse: number,
): void {
  const flap = Math.sin(performance.now() * 0.018 + enemy.hoverOffset) * 5;

  const aura = ctx.createRadialGradient(0, -2, 1, 0, -2, 24);
  aura.addColorStop(0, 'rgba(115, 255, 172, 0.20)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -2, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = enemy.hitFlash > 0 ? '#d8e7db' : '#10151a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.quadraticCurveTo(-14, -11 - flap, -26, -1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.quadraticCurveTo(15, -11 - flap, 28, 0);
  ctx.stroke();

  ctx.fillStyle = enemy.hitFlash > 0 ? '#d8e7db' : '#141a20';
  ctx.beginPath();
  ctx.ellipse(0, 2, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(8, -3, 6.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#84ffb2';
  ctx.beginPath();
  ctx.arc(10, -4, 2.2 + pulse * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f5fff7';
  ctx.beginPath();
  ctx.arc(10.5, -4.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#97d866';
  ctx.beginPath();
  ctx.moveTo(13, -2);
  ctx.lineTo(21, 1);
  ctx.lineTo(13, 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(132, 255, 178, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-18, 3);
  ctx.lineTo(-25, 8);
  ctx.moveTo(18, 3);
  ctx.lineTo(25, 8);
  ctx.stroke();
}

function drawSmallRadioactiveGoo(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  pulse: number,
): void {
  const time = performance.now();
  const wobble = Math.sin(time * 0.006 + enemy.hoverOffset) * 0.05;
  const innerPulse = Math.sin(time * 0.009 + enemy.hoverOffset) * 0.5 + 0.5;

  /**
   * Mantém a gosma visualmente apoiada na mesma linha do herói.
   */
  ctx.save();
  ctx.translate(0, GROUND_ENEMY_LINE_OFFSET);
  ctx.scale(1.75, 0.88 + wobble);

  const aura = ctx.createRadialGradient(0, 8, 2, 0, 8, 30);
  aura.addColorStop(0, 'rgba(188, 116, 255, 0.20)');
  aura.addColorStop(0.35, 'rgba(118, 255, 128, 0.16)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 8, 28, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createLinearGradient(-18, -6, 18, 12);
  core.addColorStop(0, enemy.hitFlash > 0 ? '#e8fff1' : '#3a7f3f');
  core.addColorStop(0.38, enemy.hitFlash > 0 ? '#d9ffe7' : '#57d66a');
  core.addColorStop(0.72, enemy.hitFlash > 0 ? '#f2e2ff' : '#8b5cff');
  core.addColorStop(1, enemy.hitFlash > 0 ? '#ffffff' : '#b06dff');
  ctx.fillStyle = core;

  ctx.beginPath();
  ctx.moveTo(-20, 10);
  ctx.quadraticCurveTo(-19, -2, -12, -6);
  ctx.quadraticCurveTo(-7, -10, -2, -7);
  ctx.quadraticCurveTo(4, -12, 10, -8);
  ctx.quadraticCurveTo(18, -3, 19, 10);
  ctx.quadraticCurveTo(10, 15, 2, 14);
  ctx.quadraticCurveTo(-8, 16, -20, 10);
  ctx.fill();

  const innerGlow = ctx.createRadialGradient(2, 2, 1, 2, 2, 14);
  innerGlow.addColorStop(0, `rgba(214, 255, 210, ${0.28 + innerPulse * 0.12})`);
  innerGlow.addColorStop(0.45, `rgba(186, 132, 255, ${0.18 + pulse * 0.12})`);
  innerGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.ellipse(2, 3, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(225, 255, 214, 0.34)';
  ctx.beginPath();
  ctx.ellipse(-8, -2, 3.5, 2.1, -0.3, 0, Math.PI * 2);
  ctx.ellipse(2, -4, 2.8, 1.8, 0.1, 0, Math.PI * 2);
  ctx.ellipse(10, -1, 2.4, 1.4, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1b2a18';
  ctx.beginPath();
  ctx.arc(-5, 2, 1.6 + pulse * 0.1, 0, Math.PI * 2);
  ctx.arc(6, 3, 1.4 + pulse * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(226, 198, 255, 0.26)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, 9);
  ctx.lineTo(-12, 14);
  ctx.moveTo(-1, 10);
  ctx.lineTo(-2, 16);
  ctx.moveTo(7, 9);
  ctx.lineTo(11, 15);
  ctx.stroke();

  const dripXs = [-15, -7, 1, 10, 16];
  for (const dripX of dripXs) {
    const dripLength = 2 + Math.abs(Math.sin(time * 0.004 + dripX)) * 4;

    ctx.strokeStyle = 'rgba(132, 255, 126, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(dripX, 10);
    ctx.lineTo(dripX, 10 + dripLength);
    ctx.stroke();

    ctx.fillStyle = 'rgba(192, 118, 255, 0.72)';
    ctx.beginPath();
    ctx.arc(dripX, 10 + dripLength + 1.2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
