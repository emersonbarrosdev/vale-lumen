import { Boss } from '../../domain/bosses/boss.model';
import { BossProjectile } from '../../domain/bosses/boss-projectile.model';

export function drawBoss(
  ctx: CanvasRenderingContext2D,
  boss: Boss,
): void {
  if (!boss.active || boss.hp <= 0) {
    return;
  }

  const pulse = Math.sin(performance.now() / 180) * 0.5 + 0.5;
  const introBoost = boss.introPulse > 0 ? boss.introPulse * 0.35 : 0;
  const armMotion = Math.sin(boss.armSwing) * 0.32;
  const torsoLean =
    boss.castTimer > 0 ? -0.07 : Math.sin(performance.now() / 520) * 0.02;
  const jumpStretch = !boss.onGround ? 1.05 : 1;
  const jumpSquash = !boss.onGround ? 0.95 : 1;
  const landingSquash =
    boss.squashTimer > 0 ? 1 + (boss.squashTimer / 0.16) * 0.08 : 1;
  const landingCompressY =
    boss.squashTimer > 0 ? 1 - (boss.squashTimer / 0.16) * 0.06 : 1;

  ctx.save();
  ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);

  const auraRadius = 116 + pulse * 8 + introBoost * 40;
  const aura = ctx.createRadialGradient(0, -10, 12, 0, -10, auraRadius);
  aura.addColorStop(0, 'rgba(73, 8, 18, 0.82)');
  aura.addColorStop(0.38, 'rgba(104, 0, 41, 0.34)');
  aura.addColorStop(0.7, 'rgba(91, 16, 72, 0.12)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -10, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  const shadowScale = boss.onGround ? 1 : 0.72;
  const shadowAlpha = boss.onGround ? 0.3 : 0.18;
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    0,
    boss.height / 2 - 2,
    78 * shadowScale,
    14 * shadowScale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.save();
  ctx.scale(jumpStretch * landingSquash, jumpSquash * landingCompressY);
  ctx.rotate(torsoLean);

  ctx.fillStyle = boss.hitFlash > 0 ? '#f5ece5' : '#090a0f';
  ctx.beginPath();
  ctx.moveTo(-52, -52);
  ctx.lineTo(-26, -84);
  ctx.lineTo(30, -84);
  ctx.lineTo(50, -50);
  ctx.lineTo(40, 72);
  ctx.lineTo(-42, 72);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#131823';
  ctx.beginPath();
  ctx.moveTo(-24, -18);
  ctx.lineTo(4, -28);
  ctx.lineTo(26, -16);
  ctx.lineTo(18, 24);
  ctx.lineTo(-18, 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#171922';
  drawBossArm(
    ctx,
    -62,
    -26,
    -0.46 - armMotion - (boss.castTimer > 0 ? 0.3 : 0),
    true,
  );
  drawBossArm(
    ctx,
    60,
    -24,
    0.38 + armMotion + (boss.castTimer > 0 ? 0.1 : 0),
    false,
  );

  ctx.fillStyle = '#24121b';
  ctx.fillRect(-54, -8, 12, 36);
  ctx.fillRect(44, -8, 12, 34);

  ctx.fillStyle = '#240912';
  ctx.beginPath();
  ctx.moveTo(-40, -70);
  ctx.lineTo(-32, -88);
  ctx.lineTo(-24, -68);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(18, -68);
  ctx.lineTo(30, -90);
  ctx.lineTo(40, -70);
  ctx.closePath();
  ctx.fill();

  const coreGlow = ctx.createRadialGradient(4, -12, 4, 4, -12, 42 + pulse * 5);
  coreGlow.addColorStop(0, 'rgba(210, 250, 255, 1)');
  coreGlow.addColorStop(0.22, 'rgba(140, 232, 255, 0.95)');
  coreGlow.addColorStop(0.5, 'rgba(104, 202, 255, 0.7)');
  coreGlow.addColorStop(1, 'rgba(104, 202, 255, 0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(4, -12, 42 + pulse * 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9bf5ff';
  ctx.beginPath();
  ctx.arc(4, -12, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(125, 232, 255, ${0.35 + pulse * 0.2})`;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-30, -40);
  ctx.lineTo(4, -12);
  ctx.lineTo(32, -42);
  ctx.moveTo(-22, 16);
  ctx.lineTo(4, -12);
  ctx.lineTo(28, 16);
  ctx.stroke();

  ctx.fillStyle = '#171922';
  ctx.beginPath();
  ctx.moveTo(-18, 68);
  ctx.lineTo(10, 68);
  ctx.lineTo(14, 86);
  ctx.lineTo(-20, 86);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

export function drawBossProjectiles(
  ctx: CanvasRenderingContext2D,
  bossProjectiles: BossProjectile[],
): void {
  for (const projectile of bossProjectiles) {
    if (!projectile.active) {
      continue;
    }

    const glow = ctx.createRadialGradient(
      projectile.x,
      projectile.y,
      1,
      projectile.x,
      projectile.y,
      projectile.radius * 2.4,
    );

    if (projectile.kind === 'ultimate') {
      glow.addColorStop(0, 'rgba(255, 198, 137, 0.9)');
      glow.addColorStop(0.4, 'rgba(153, 69, 219, 0.62)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      glow.addColorStop(0, 'rgba(168, 240, 255, 0.9)');
      glow.addColorStop(0.32, 'rgba(134, 80, 255, 0.58)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
    }

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(
      projectile.x,
      projectile.y,
      projectile.radius * 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = projectile.kind === 'ultimate' ? '#ffb77a' : '#8deeff';
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle =
      projectile.kind === 'ultimate'
        ? 'rgba(255, 226, 190, 0.7)'
        : 'rgba(214, 251, 255, 0.7)';
    ctx.lineWidth = projectile.kind === 'ultimate' ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(projectile.x - 5, projectile.y - 6);
    ctx.lineTo(projectile.x + 2, projectile.y);
    ctx.lineTo(projectile.x - 2, projectile.y);
    ctx.lineTo(projectile.x + 6, projectile.y + 8);
    ctx.stroke();
  }
}

function drawBossArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  left: boolean,
): void {
  const length = 40;
  const handX = x + Math.cos(angle) * length;
  const handY = y + Math.sin(angle) * length;

  ctx.strokeStyle = '#171922';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  ctx.fillStyle = '#0e1016';
  ctx.beginPath();
  ctx.arc(handX, handY, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2a0c15';
  ctx.beginPath();
  if (left) {
    ctx.moveTo(handX - 8, handY);
    ctx.lineTo(handX - 16, handY + 8);
    ctx.lineTo(handX - 4, handY + 6);
  } else {
    ctx.moveTo(handX + 8, handY);
    ctx.lineTo(handX + 16, handY + 8);
    ctx.lineTo(handX + 4, handY + 6);
  }
  ctx.closePath();
  ctx.fill();
}
