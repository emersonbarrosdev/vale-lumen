// boss-renderer.ts
import { Boss } from '../../domain/bosses/boss.model';
import { BossProjectile } from '../../domain/bosses/boss-projectile.model';

const COLORS = {
  aura1: 'rgba(120, 255, 120, 0.18)',
  aura2: 'rgba(70, 220, 120, 0.12)',
  aura3: 'rgba(20, 120, 60, 0.08)',

  hornDark: '#153224',
  hornLight: '#2f6a4f',

  shellTop: '#97ff7a',
  shellMid: '#3fd85d',
  shellDark: '#0c6a33',
  shellDeep: '#062714',

  faceDark: '#0b2415',
  faceMid: '#163d24',

  crack: 'rgba(216, 255, 168, 0.26)',
  brow: '#20492b',
  eye: '#d8ff70',
  eyeCore: '#9bff55',

  mouth: '#183c24',
  spit: '#baff9f',
  spitSoft: 'rgba(186, 255, 159, 0.5)',

  coreGlow: '#dfffd0',
  coreMid: '#93ff7f',
  coreDark: '#29b553',

  armTop: '#62ef73',
  armDark: '#0d4b27',

  projBright: '#ecffa8',
  projMid: '#91ff5e',
  projDark: '#279c44',
  projLob: '#c8ff72',
};

export function drawBoss(
  ctx: CanvasRenderingContext2D,
  boss: Boss,
): void {
  if (!boss.active || boss.hp <= 0) {
    return;
  }

  const now = performance.now();
  const pulse = Math.sin(now / 180) * 0.5 + 0.5;
  const introBoost = boss.introPulse > 0 ? boss.introPulse * 0.35 : 0;
  const armMotion = Math.sin(boss.armSwing) * 0.32;
  const torsoSquash = boss.squashTimer > 0 ? 1 - boss.squashTimer * 0.2 : 1;
  const torsoStretch = boss.squashTimer > 0 ? 1 + boss.squashTimer * 0.12 : 1;
  const hover = Math.sin(now / 220) * 3;
  const scale = 1.16;

  ctx.save();
  ctx.translate(
    boss.x + boss.width / 2,
    boss.y + boss.height / 2 + hover,
  );
  ctx.scale(torsoStretch * scale, torsoSquash * scale);

  const aura = ctx.createRadialGradient(0, -10, 12, 0, -10, 90 + introBoost * 28);
  aura.addColorStop(0, `rgba(210, 255, 190, ${0.16 + introBoost * 0.14})`);
  aura.addColorStop(0.42, `rgba(110, 255, 160, ${0.12 + introBoost * 0.1})`);
  aura.addColorStop(0.72, `rgba(38, 170, 82, ${0.1 + introBoost * 0.06})`);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -8, 88 + introBoost * 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.hornDark;
  ctx.beginPath();
  ctx.moveTo(-38, -58);
  ctx.lineTo(-25, -98);
  ctx.lineTo(-12, -54);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(38, -58);
  ctx.lineTo(25, -98);
  ctx.lineTo(12, -54);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-16, -72);
  ctx.lineTo(0, -110);
  ctx.lineTo(16, -72);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.hornLight;
  ctx.beginPath();
  ctx.moveTo(-30, -69);
  ctx.lineTo(-24, -88);
  ctx.lineTo(-18, -66);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(30, -69);
  ctx.lineTo(24, -88);
  ctx.lineTo(18, -66);
  ctx.closePath();
  ctx.fill();

  const shellGradient = ctx.createLinearGradient(0, -84, 0, 98);
  shellGradient.addColorStop(0, boss.hitFlash > 0 ? '#f3ffe9' : COLORS.shellTop);
  shellGradient.addColorStop(0.38, boss.hitFlash > 0 ? '#cffff0' : COLORS.shellMid);
  shellGradient.addColorStop(0.72, boss.hitFlash > 0 ? '#81d799' : COLORS.shellDark);
  shellGradient.addColorStop(1, boss.hitFlash > 0 ? '#2c6a41' : COLORS.shellDeep);

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.moveTo(-52, -30);
  ctx.quadraticCurveTo(-64, 6, -56, 40);
  ctx.quadraticCurveTo(-46, 82, 0, 96);
  ctx.quadraticCurveTo(46, 82, 56, 40);
  ctx.quadraticCurveTo(64, 6, 52, -30);
  ctx.quadraticCurveTo(30, -82, 0, -88);
  ctx.quadraticCurveTo(-30, -82, -52, -30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(220,255,170,0.16)';
  ctx.beginPath();
  ctx.moveTo(-26, -52);
  ctx.quadraticCurveTo(-8, -68, 0, -64);
  ctx.quadraticCurveTo(8, -68, 26, -52);
  ctx.quadraticCurveTo(18, -20, 0, -16);
  ctx.quadraticCurveTo(-18, -20, -26, -52);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.crack;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-19, -4);
  ctx.lineTo(-30, 14);
  ctx.lineTo(-24, 34);
  ctx.moveTo(18, -2);
  ctx.lineTo(30, 20);
  ctx.lineTo(22, 42);
  ctx.moveTo(-2, 10);
  ctx.lineTo(4, 26);
  ctx.lineTo(-1, 42);
  ctx.stroke();

  const armGradient = ctx.createLinearGradient(0, -10, 0, 42);
  armGradient.addColorStop(0, COLORS.armTop);
  armGradient.addColorStop(1, COLORS.armDark);

  ctx.save();
  ctx.translate(-45, 2);
  ctx.rotate(-0.54 + armMotion);
  ctx.fillStyle = armGradient;
  ctx.beginPath();
  ctx.moveTo(-9, -10);
  ctx.quadraticCurveTo(-16, 10, -11, 35);
  ctx.quadraticCurveTo(-4, 44, 4, 34);
  ctx.quadraticCurveTo(8, 12, 2, -11);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(45, 2);
  ctx.rotate(0.54 - armMotion);
  ctx.fillStyle = armGradient;
  ctx.beginPath();
  ctx.moveTo(9, -10);
  ctx.quadraticCurveTo(16, 10, 11, 35);
  ctx.quadraticCurveTo(4, 44, -4, 34);
  ctx.quadraticCurveTo(-8, 12, -2, -11);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const faceGradient = ctx.createLinearGradient(0, -58, 0, 26);
  faceGradient.addColorStop(0, COLORS.faceMid);
  faceGradient.addColorStop(1, COLORS.faceDark);

  ctx.fillStyle = faceGradient;
  ctx.beginPath();
  ctx.moveTo(-35, -18);
  ctx.quadraticCurveTo(-27, -56, 0, -62);
  ctx.quadraticCurveTo(27, -56, 35, -18);
  ctx.quadraticCurveTo(33, 16, 19, 34);
  ctx.quadraticCurveTo(0, 42, -19, 34);
  ctx.quadraticCurveTo(-33, 16, -35, -18);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.brow;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-23, -19);
  ctx.lineTo(-5, -27);
  ctx.moveTo(23, -19);
  ctx.lineTo(5, -27);
  ctx.stroke();

  const eyeGlow = ctx.createRadialGradient(0, -10, 4, 0, -10, 28);
  eyeGlow.addColorStop(0, `rgba(230, 255, 140, ${0.24 + pulse * 0.14})`);
  eyeGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(-13, -10, 18, 0, Math.PI * 2);
  ctx.arc(13, -10, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.eyeCore;
  ctx.beginPath();
  ctx.moveTo(-22, -6);
  ctx.lineTo(-11, -16);
  ctx.lineTo(-4, -14);
  ctx.lineTo(-10, -2);
  ctx.lineTo(-20, -1);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(22, -6);
  ctx.lineTo(11, -16);
  ctx.lineTo(4, -14);
  ctx.lineTo(10, -2);
  ctx.lineTo(20, -1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.eye;
  ctx.beginPath();
  ctx.arc(-12, -9, 3, 0, Math.PI * 2);
  ctx.arc(12, -9, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.mouth;
  ctx.beginPath();
  ctx.moveTo(-17, 14);
  ctx.quadraticCurveTo(0, 30, 17, 14);
  ctx.quadraticCurveTo(10, 34, 0, 36);
  ctx.quadraticCurveTo(-10, 34, -17, 14);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e8f2de';
  for (let index = 0; index < 4; index += 1) {
    const x = -11 + index * 7;
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x + 3, 28);
    ctx.lineTo(x + 6, 18);
    ctx.closePath();
    ctx.fill();
  }

  const spitGlow = ctx.createRadialGradient(0, 26, 2, 0, 26, 18);
  spitGlow.addColorStop(0, COLORS.spitSoft);
  spitGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spitGlow;
  ctx.beginPath();
  ctx.arc(0, 26, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.spit;
  ctx.beginPath();
  ctx.arc(-7, 24, 3.8, 0, Math.PI * 2);
  ctx.arc(0, 28, 4.6, 0, Math.PI * 2);
  ctx.arc(8, 23, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(200,255,180,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-1, 29);
  ctx.quadraticCurveTo(2, 41, -3, 48);
  ctx.moveTo(6, 26);
  ctx.quadraticCurveTo(10, 35, 8, 41);
  ctx.stroke();

  const coreGlow = ctx.createRadialGradient(0, 22, 3, 0, 22, 34 + introBoost * 8);
  coreGlow.addColorStop(0, `rgba(240, 255, 220, ${0.72 + pulse * 0.08})`);
  coreGlow.addColorStop(0.35, `rgba(147, 255, 127, ${0.34 + introBoost * 0.16})`);
  coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(0, 22, 32 + introBoost * 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.coreDark;
  ctx.beginPath();
  ctx.moveTo(0, 38);
  ctx.quadraticCurveTo(-16, 26, -9, 5);
  ctx.quadraticCurveTo(-3, -8, 0, -2);
  ctx.quadraticCurveTo(3, -8, 9, 5);
  ctx.quadraticCurveTo(16, 26, 0, 38);
  ctx.fill();

  ctx.fillStyle = COLORS.coreMid;
  ctx.beginPath();
  ctx.moveTo(0, 31);
  ctx.quadraticCurveTo(-10, 23, -5, 10);
  ctx.quadraticCurveTo(-1, 4, 0, 8);
  ctx.quadraticCurveTo(1, 4, 5, 10);
  ctx.quadraticCurveTo(10, 23, 0, 31);
  ctx.fill();

  ctx.fillStyle = COLORS.coreGlow;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.quadraticCurveTo(-4, 15, 0, 9);
  ctx.quadraticCurveTo(4, 15, 0, 22);
  ctx.fill();

  if (boss.castTimer > 0) {
    const castPower = Math.min(1, boss.castTimer * 3.2);
    const rise = 24 + castPower * 34 + pulse * 4;
    const burstRadius = 10 + castPower * 8;

    const burst = ctx.createRadialGradient(0, -46 - rise, 2, 0, -46 - rise, 20 + burstRadius);
    burst.addColorStop(0, 'rgba(238,255,180,0.95)');
    burst.addColorStop(0.45, 'rgba(150,255,102,0.55)');
    burst.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = burst;
    ctx.beginPath();
    ctx.arc(0, -46 - rise, 18 + burstRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(176,255,120,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-6, -28, -4, -46 - rise * 0.55);
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(6, -28, 4, -46 - rise * 0.55);
    ctx.stroke();

    for (let index = 0; index < 4; index += 1) {
      const angle = (-0.8 + index * 0.55) + pulse * 0.08;
      const px = Math.cos(angle) * (8 + index * 2);
      const py = -46 - rise + Math.sin(angle) * 6;
      ctx.fillStyle = 'rgba(205,255,146,0.75)';
      ctx.beginPath();
      ctx.arc(px, py, 2.6 + (index % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawBossProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: BossProjectile[],
): void {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    const pulse = Math.sin(performance.now() / 120 + projectile.elapsed * 8) * 0.5 + 0.5;
    const wobble = Math.sin(projectile.elapsed * 10) * 1.4;
    const isUltimate = projectile.kind === 'ultimate';
    const isLob = projectile.kind === 'lob';

    const glow = ctx.createRadialGradient(
      projectile.x,
      projectile.y,
      2,
      projectile.x,
      projectile.y,
      projectile.radius * (isLob ? 3.2 : 2.6),
    );

    glow.addColorStop(
      0,
      isUltimate
        ? 'rgba(240, 255, 190, 0.96)'
        : isLob
          ? 'rgba(232, 255, 180, 0.92)'
          : 'rgba(220, 255, 175, 0.88)',
    );
    glow.addColorStop(
      0.42,
      isUltimate
        ? 'rgba(154, 255, 90, 0.52)'
        : isLob
          ? 'rgba(118, 255, 90, 0.46)'
          : 'rgba(64, 255, 120, 0.34)',
    );
    glow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(
      projectile.x,
      projectile.y,
      projectile.radius * (isLob ? 2.8 : 2.3) + pulse * 1.8,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    if (isLob) {
      ctx.strokeStyle = 'rgba(182,255,120,0.32)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y + projectile.radius);
      ctx.quadraticCurveTo(
        projectile.x - 8 + wobble,
        projectile.y + 12,
        projectile.x - 3,
        projectile.y + 24,
      );
      ctx.moveTo(projectile.x + 2, projectile.y + projectile.radius * 0.6);
      ctx.quadraticCurveTo(
        projectile.x + 10 - wobble,
        projectile.y + 8,
        projectile.x + 6,
        projectile.y + 20,
      );
      ctx.stroke();
    }

    ctx.fillStyle = isUltimate
      ? COLORS.projLob
      : isLob
        ? COLORS.projLob
        : COLORS.projMid;

    ctx.beginPath();
    if (isLob) {
      ctx.ellipse(
        projectile.x,
        projectile.y,
        projectile.radius * 1.16,
        projectile.radius * 0.94,
        projectile.elapsed * 2.3,
        0,
        Math.PI * 2,
      );
    } else {
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = COLORS.projBright;
    ctx.beginPath();
    ctx.arc(
      projectile.x - projectile.radius * 0.28,
      projectile.y - projectile.radius * 0.22,
      Math.max(2, projectile.radius * 0.34),
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = isUltimate ? '#efffb4' : '#d8ff98';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isLob) {
      ctx.ellipse(
        projectile.x,
        projectile.y,
        projectile.radius * 0.72,
        projectile.radius * 0.56,
        projectile.elapsed * 2.3,
        0,
        Math.PI * 2,
      );
    } else {
      ctx.arc(projectile.x, projectile.y, projectile.radius * 0.62, 0, Math.PI * 2);
    }
    ctx.stroke();

    if (isLob) {
      ctx.fillStyle = 'rgba(228,255,160,0.26)';
      ctx.beginPath();
      ctx.arc(projectile.x - 7, projectile.y + 6, projectile.radius * 0.45, 0, Math.PI * 2);
      ctx.arc(projectile.x + 6, projectile.y - 5, projectile.radius * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
