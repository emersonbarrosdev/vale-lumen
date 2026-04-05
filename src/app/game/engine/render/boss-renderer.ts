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
    boss.castTimer > 0 ? -0.09 : Math.sin(performance.now() / 520) * 0.02;
  const jumpStretch = !boss.onGround ? 1.05 : 1;
  const jumpSquash = !boss.onGround ? 0.95 : 1;
  const landingSquash =
    boss.squashTimer > 0 ? 1 + (boss.squashTimer / 0.16) * 0.08 : 1;
  const landingCompressY =
    boss.squashTimer > 0 ? 1 - (boss.squashTimer / 0.16) * 0.06 : 1;

  ctx.save();
  ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);

  const auraRadius = 140 + pulse * 10 + introBoost * 46;
  const aura = ctx.createRadialGradient(0, -12, 12, 0, -12, auraRadius);
  aura.addColorStop(0, 'rgba(20, 44, 18, 0.9)');
  aura.addColorStop(0.34, 'rgba(29, 86, 37, 0.42)');
  aura.addColorStop(0.7, 'rgba(27, 60, 26, 0.14)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -10, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  const shadowScale = boss.onGround ? 1 : 0.72;
  const shadowAlpha = boss.onGround ? 0.34 : 0.18;
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    0,
    boss.height / 2 - 2,
    90 * shadowScale,
    18 * shadowScale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.save();
  ctx.scale(jumpStretch * landingSquash, jumpSquash * landingCompressY);
  ctx.rotate(torsoLean);

  ctx.fillStyle = boss.hitFlash > 0 ? '#dfe8da' : '#07090d';
  ctx.beginPath();
  ctx.moveTo(-60, -56);
  ctx.lineTo(-34, -92);
  ctx.lineTo(34, -92);
  ctx.lineTo(60, -56);
  ctx.lineTo(50, 82);
  ctx.lineTo(-50, 82);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0d1218';
  ctx.beginPath();
  ctx.moveTo(-34, -22);
  ctx.lineTo(0, -34);
  ctx.lineTo(34, -20);
  ctx.lineTo(26, 34);
  ctx.lineTo(-26, 34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#171f18';
  ctx.beginPath();
  ctx.moveTo(-28, -10);
  ctx.lineTo(0, -18);
  ctx.lineTo(28, -10);
  ctx.lineTo(18, 14);
  ctx.lineTo(-18, 14);
  ctx.closePath();
  ctx.fill();

  drawBossArm(
    ctx,
    -72,
    -30,
    -0.52 - armMotion - (boss.castTimer > 0 ? 0.34 : 0),
    true,
  );
  drawBossArm(
    ctx,
    72,
    -28,
    0.42 + armMotion + (boss.castTimer > 0 ? 0.14 : 0),
    false,
  );

  ctx.fillStyle = '#0d1215';
  ctx.fillRect(-62, -4, 14, 44);
  ctx.fillRect(48, -4, 14, 42);

  drawShoulderSpike(ctx, -44, -58, -1);
  drawShoulderSpike(ctx, 44, -58, 1);

  ctx.fillStyle = '#11181b';
  ctx.beginPath();
  ctx.moveTo(-22, 78);
  ctx.lineTo(14, 78);
  ctx.lineTo(18, 102);
  ctx.lineTo(-24, 102);
  ctx.closePath();
  ctx.fill();

  drawHead(ctx, pulse, boss.hitFlash > 0);

  ctx.restore();
  ctx.restore();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  pulse: number,
  isHitFlash: boolean,
): void {
  ctx.fillStyle = isHitFlash ? '#dfe8da' : '#090c11';
  ctx.beginPath();
  ctx.moveTo(-28, -72);
  ctx.lineTo(-14, -108);
  ctx.lineTo(18, -108);
  ctx.lineTo(30, -74);
  ctx.lineTo(18, -38);
  ctx.lineTo(-18, -38);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#15201a';
  ctx.beginPath();
  ctx.moveTo(-18, -72);
  ctx.lineTo(0, -84);
  ctx.lineTo(20, -72);
  ctx.lineTo(10, -56);
  ctx.lineTo(-12, -56);
  ctx.closePath();
  ctx.fill();

  drawHorn(ctx, -20, -90, -1);
  drawHorn(ctx, 20, -92, 1);

  const eyeGlow = ctx.createRadialGradient(0, -70, 4, 0, -70, 34 + pulse * 4);
  eyeGlow.addColorStop(0, 'rgba(142, 255, 162, 0.95)');
  eyeGlow.addColorStop(0.42, 'rgba(81, 214, 104, 0.62)');
  eyeGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(0, -70, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#b9ffd0';
  ctx.beginPath();
  ctx.ellipse(-8, -72, 4.8, 6.2, -0.18, 0, Math.PI * 2);
  ctx.ellipse(10, -72, 4.8, 6.2, 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(150, 255, 170, 0.72)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-20, -60);
  ctx.lineTo(-2, -50);
  ctx.lineTo(18, -60);
  ctx.stroke();

  ctx.fillStyle = '#1a261d';
  ctx.beginPath();
  ctx.moveTo(-6, -48);
  ctx.lineTo(8, -48);
  ctx.lineTo(4, -40);
  ctx.lineTo(-4, -40);
  ctx.closePath();
  ctx.fill();
}

function drawHorn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  ctx.fillStyle = '#172019';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -10, 24, -34);
  ctx.quadraticCurveTo(18, -18, 12, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawShoulderSpike(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  ctx.fillStyle = '#182019';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(26, -8);
  ctx.lineTo(10, 14);
  ctx.closePath();
  ctx.fill();

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

    if (projectile.kind === 'lob') {
      drawGooProjectile(ctx, projectile);
      continue;
    }

    const glow = ctx.createRadialGradient(
      projectile.x,
      projectile.y,
      1,
      projectile.x,
      projectile.y,
      projectile.radius * 2.6,
    );

    if (projectile.kind === 'ultimate') {
      glow.addColorStop(0, 'rgba(176, 255, 150, 0.95)');
      glow.addColorStop(0.32, 'rgba(44, 122, 52, 0.88)');
      glow.addColorStop(0.68, 'rgba(14, 54, 23, 0.45)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      glow.addColorStop(0, 'rgba(180, 255, 186, 0.92)');
      glow.addColorStop(0.34, 'rgba(79, 214, 102, 0.7)');
      glow.addColorStop(0.72, 'rgba(26, 88, 36, 0.26)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
    }

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(
      projectile.x,
      projectile.y,
      projectile.radius * 2.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = projectile.kind === 'ultimate' ? '#1e6c2a' : '#54d768';
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = projectile.kind === 'ultimate' ? '#c8ffd1' : '#e4ffea';
    ctx.beginPath();
    ctx.arc(
      projectile.x - projectile.radius * 0.24,
      projectile.y - projectile.radius * 0.3,
      Math.max(2, projectile.radius * 0.34),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawGooProjectile(
  ctx: CanvasRenderingContext2D,
  projectile: BossProjectile,
): void {
  const aura = ctx.createRadialGradient(
    projectile.x,
    projectile.y,
    1,
    projectile.x,
    projectile.y,
    projectile.radius * 2.8,
  );
  aura.addColorStop(0, 'rgba(181, 255, 176, 0.88)');
  aura.addColorStop(0.3, 'rgba(84, 210, 92, 0.72)');
  aura.addColorStop(0.65, 'rgba(22, 96, 34, 0.32)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(projectile.x, projectile.y, projectile.radius * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3ab34f';
  ctx.beginPath();
  ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(221, 255, 224, 0.88)';
  ctx.beginPath();
  ctx.arc(
    projectile.x - projectile.radius * 0.28,
    projectile.y - projectile.radius * 0.34,
    Math.max(2, projectile.radius * 0.28),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const splatCount = 4;
  for (let index = 0; index < splatCount; index += 1) {
    const angle = -1.8 + index * 0.65;
    const dist = projectile.radius + 4;
    const px = projectile.x + Math.cos(angle) * dist;
    const py = projectile.y + Math.sin(angle) * dist;

    ctx.fillStyle = 'rgba(95, 230, 110, 0.76)';
    ctx.beginPath();
    ctx.arc(px, py, 2.2 + (index % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBossArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  left: boolean,
): void {
  const length = 46;
  const handX = x + Math.cos(angle) * length;
  const handY = y + Math.sin(angle) * length;

  ctx.strokeStyle = '#12191a';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  ctx.fillStyle = '#0d1215';
  ctx.beginPath();
  ctx.arc(handX, handY, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#19301a';
  ctx.beginPath();
  if (left) {
    ctx.moveTo(handX - 8, handY);
    ctx.lineTo(handX - 20, handY + 10);
    ctx.lineTo(handX - 6, handY + 8);
  } else {
    ctx.moveTo(handX + 8, handY);
    ctx.lineTo(handX + 20, handY + 10);
    ctx.lineTo(handX + 6, handY + 8);
  }
  ctx.closePath();
  ctx.fill();
}
