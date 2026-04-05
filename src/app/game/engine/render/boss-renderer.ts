import { Boss } from '../../domain/bosses/boss.model';
import { BossProjectile } from '../../domain/bosses/boss-projectile.model';

const COLORS = {
  auraCore: 'rgba(143, 255, 162, 0.18)',
  auraMid: 'rgba(82, 214, 104, 0.1)',

  bodyDark: '#120d1d',
  bodyMid: '#241638',
  bodyDeep: '#09070f',

  armorDark: '#16111f',
  armorMid: '#261c34',
  armorLight: '#3a2d52',

  crystalDark: '#43246a',
  crystalMid: '#7a46c2',
  crystalLight: '#c6a7ff',

  wartBase: '#523078',
  wartGlow: 'rgba(170, 110, 255, 0.2)',

  ringDark: '#314135',
  ringMid: '#5f7965',
  ringLight: '#a9c8b0',

  coreGlowA: 'rgba(225, 255, 233, 0.95)',
  coreGlowB: 'rgba(145, 255, 166, 0.8)',
  coreGlowC: 'rgba(72, 196, 94, 0.34)',
  coreSolid: '#bfffd0',
  coreHighlight: '#ebfff0',

  eyeGlow: '#d8ff70',
  eyeCore: '#9cff55',

  mouthGlow: 'rgba(125, 255, 178, 0.32)',
  mouth: '#17301a',
  mouthBright: '#7dffb2',
  tooth: '#f1fff3',

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
  const pulse = Math.sin(now / 260) * 0.5 + 0.5;
  const bob = Math.sin(now / 300) * 2.2;
  const introBoost = boss.introPulse > 0 ? boss.introPulse * 0.35 : 0;
  const castLean = boss.castTimer > 0 ? -0.04 : 0;
  const squashX = boss.squashTimer > 0 ? 1 + (boss.squashTimer / 0.16) * 0.08 : 1;
  const squashY = boss.squashTimer > 0 ? 1 - (boss.squashTimer / 0.16) * 0.06 : 1;

  const scale = 1.7;

  ctx.save();
  ctx.translate(
    boss.x + boss.width / 2,
    boss.y + boss.height / 2 - 52 + bob,
  );
  ctx.scale(squashX * scale, squashY * scale);
  ctx.rotate(castLean);

  const aura = ctx.createRadialGradient(0, -20, 4, 0, -20, 90 + introBoost * 28);
  aura.addColorStop(0, COLORS.auraCore);
  aura.addColorStop(0.45, COLORS.auraMid);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -20, 86 + introBoost * 18, 0, Math.PI * 2);
  ctx.fill();

  drawBackCrystals(ctx);
  drawEarStructures(ctx);
  drawShoulderMass(ctx);

  const bodyGradient = ctx.createLinearGradient(0, -96, 0, 102);
  bodyGradient.addColorStop(0, boss.hitFlash > 0 ? '#efe7ff' : COLORS.bodyDark);
  bodyGradient.addColorStop(0.42, boss.hitFlash > 0 ? '#d9caef' : COLORS.bodyMid);
  bodyGradient.addColorStop(1, boss.hitFlash > 0 ? '#7f6b9f' : COLORS.bodyDeep);

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-36, -78);
  ctx.lineTo(36, -78);
  ctx.lineTo(60, -56);
  ctx.lineTo(74, -14);
  ctx.lineTo(70, 34);
  ctx.lineTo(48, 78);
  ctx.lineTo(20, 100);
  ctx.lineTo(-20, 100);
  ctx.lineTo(-48, 78);
  ctx.lineTo(-70, 34);
  ctx.lineTo(-74, -14);
  ctx.lineTo(-60, -56);
  ctx.closePath();
  ctx.fill();

  const chestGradient = ctx.createLinearGradient(0, -68, 0, 86);
  chestGradient.addColorStop(0, COLORS.armorLight);
  chestGradient.addColorStop(0.5, COLORS.armorMid);
  chestGradient.addColorStop(1, COLORS.armorDark);

  ctx.fillStyle = chestGradient;
  ctx.beginPath();
  ctx.moveTo(-44, -50);
  ctx.lineTo(-18, -70);
  ctx.lineTo(18, -70);
  ctx.lineTo(44, -50);
  ctx.lineTo(52, -6);
  ctx.lineTo(42, 50);
  ctx.lineTo(18, 82);
  ctx.lineTo(-18, 82);
  ctx.lineTo(-42, 50);
  ctx.lineTo(-52, -6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(210,255,185,0.06)';
  ctx.beginPath();
  ctx.moveTo(-20, -46);
  ctx.lineTo(0, -56);
  ctx.lineTo(20, -46);
  ctx.lineTo(14, -18);
  ctx.lineTo(-14, -18);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(145, 255, 166, 0.16)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-24, -8);
  ctx.lineTo(-31, 16);
  ctx.lineTo(-24, 40);

  ctx.moveTo(24, -8);
  ctx.lineTo(31, 16);
  ctx.lineTo(24, 40);

  ctx.moveTo(0, 4);
  ctx.lineTo(5, 24);
  ctx.lineTo(0, 42);
  ctx.stroke();

  drawHead(ctx, pulse, boss.hitFlash > 0);
  drawMouthRings(ctx);
  drawWarts(ctx, pulse);
  drawCore(ctx, pulse, introBoost);

  if (boss.castTimer > 0) {
    drawCastEnergy(ctx, pulse);
  }

  ctx.restore();
}

function drawBackCrystals(ctx: CanvasRenderingContext2D): void {
  const crystals = [
    { x: -34, y: -88, w: 12, h: 28, tilt: -0.2 },
    { x: -16, y: -100, w: 14, h: 34, tilt: -0.1 },
    { x: 0, y: -114, w: 16, h: 42, tilt: 0 },
    { x: 16, y: -100, w: 14, h: 34, tilt: 0.1 },
    { x: 34, y: -88, w: 12, h: 28, tilt: 0.2 },
  ];

  for (const crystal of crystals) {
    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    ctx.rotate(crystal.tilt);

    const grad = ctx.createLinearGradient(0, 0, 0, crystal.h);
    grad.addColorStop(0, COLORS.crystalLight);
    grad.addColorStop(0.45, COLORS.crystalMid);
    grad.addColorStop(1, COLORS.crystalDark);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-crystal.w / 2, crystal.h);
    ctx.lineTo(0, crystal.h - 8);
    ctx.lineTo(crystal.w / 2, crystal.h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(-2, crystal.h - 10);
    ctx.lineTo(2, crystal.h - 12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

function drawEarStructures(ctx: CanvasRenderingContext2D): void {
  drawSingleEar(ctx, -40, -54, -1);
  drawSingleEar(ctx, 40, -54, 1);
}

function drawSingleEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  const grad = ctx.createLinearGradient(0, -8, 26, 26);
  grad.addColorStop(0, COLORS.armorLight);
  grad.addColorStop(0.55, COLORS.armorMid);
  grad.addColorStop(1, COLORS.armorDark);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(20, -12);
  ctx.lineTo(28, 8);
  ctx.lineTo(20, 30);
  ctx.lineTo(0, 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(18, -6);
  ctx.lineTo(14, 10);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawShoulderMass(ctx: CanvasRenderingContext2D): void {
  drawSingleShoulderMass(ctx, -58, -40, -1);
  drawSingleShoulderMass(ctx, 58, -40, 1);
}

function drawSingleShoulderMass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  const grad = ctx.createLinearGradient(0, -10, 30, 22);
  grad.addColorStop(0, COLORS.armorLight);
  grad.addColorStop(1, COLORS.armorDark);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(30, -8);
  ctx.lineTo(26, 20);
  ctx.lineTo(0, 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.moveTo(4, 2);
  ctx.lineTo(20, -3);
  ctx.lineTo(14, 9);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  pulse: number,
  hitFlash: boolean,
): void {
  const headGradient = ctx.createLinearGradient(0, -78, 0, 34);
  headGradient.addColorStop(0, hitFlash ? '#efe7ff' : COLORS.bodyDark);
  headGradient.addColorStop(0.5, hitFlash ? '#d9caef' : COLORS.bodyMid);
  headGradient.addColorStop(1, hitFlash ? '#7f6b9f' : COLORS.bodyDeep);

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.moveTo(-31, -54);
  ctx.lineTo(-18, -76);
  ctx.lineTo(18, -76);
  ctx.lineTo(31, -54);
  ctx.lineTo(35, -14);
  ctx.lineTo(24, 12);
  ctx.lineTo(10, 26);
  ctx.lineTo(-10, 26);
  ctx.lineTo(-24, 12);
  ctx.lineTo(-35, -14);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.armorMid;
  ctx.beginPath();
  ctx.moveTo(-18, -12);
  ctx.lineTo(0, -21);
  ctx.lineTo(18, -12);
  ctx.lineTo(14, 9);
  ctx.lineTo(-14, 9);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#4aa55a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-21, -20);
  ctx.lineTo(-5, -28);
  ctx.moveTo(21, -20);
  ctx.lineTo(5, -28);
  ctx.stroke();

  const eyeGlow = ctx.createRadialGradient(0, -10, 4, 0, -10, 24 + pulse * 4);
  eyeGlow.addColorStop(0, `rgba(216, 255, 112, ${0.22 + pulse * 0.14})`);
  eyeGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(-11, -10, 16, 0, Math.PI * 2);
  ctx.arc(11, -10, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.eyeCore;
  ctx.beginPath();
  ctx.moveTo(-19, -7);
  ctx.lineTo(-10, -15);
  ctx.lineTo(-4, -13);
  ctx.lineTo(-9, -2);
  ctx.lineTo(-17, -1);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(19, -7);
  ctx.lineTo(10, -15);
  ctx.lineTo(4, -13);
  ctx.lineTo(9, -2);
  ctx.lineTo(17, -1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.eyeGlow;
  ctx.beginPath();
  ctx.arc(-10, -9, 2.8, 0, Math.PI * 2);
  ctx.arc(10, -9, 2.8, 0, Math.PI * 2);
  ctx.fill();

  const mouthGlow = ctx.createRadialGradient(0, 17, 2, 0, 17, 18);
  mouthGlow.addColorStop(0, COLORS.mouthGlow);
  mouthGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mouthGlow;
  ctx.beginPath();
  ctx.arc(0, 18, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.mouth;
  ctx.beginPath();
  ctx.moveTo(-16, 15);
  ctx.quadraticCurveTo(0, 26, 16, 15);
  ctx.quadraticCurveTo(10, 32, 0, 34);
  ctx.quadraticCurveTo(-10, 32, -16, 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.mouthBright;
  ctx.beginPath();
  ctx.moveTo(-10, 18);
  ctx.quadraticCurveTo(0, 25, 10, 18);
  ctx.quadraticCurveTo(6, 28, 0, 29);
  ctx.quadraticCurveTo(-6, 28, -10, 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.tooth;
  for (let index = 0; index < 4; index += 1) {
    const x = -10 + index * 6.5;
    ctx.beginPath();
    ctx.moveTo(x, 16);
    ctx.lineTo(x + 3, 25);
    ctx.lineTo(x + 6, 16);
    ctx.closePath();
    ctx.fill();
  }
}

function drawMouthRings(ctx: CanvasRenderingContext2D): void {
  drawRingChain(ctx, -8, 18, -30, -28, true);
  drawRingChain(ctx, 8, 18, 30, -28, false);
}

function drawRingChain(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  left: boolean,
): void {
  const segments = 5;

  for (let index = 0; index < segments; index += 1) {
    const t = index / (segments - 1);
    const arcLift = Math.sin(t * Math.PI) * 7;
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t - arcLift;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((left ? -0.35 : 0.35) + t * (left ? 0.2 : -0.2));

    ctx.strokeStyle = COLORS.ringMid;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = COLORS.ringLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-0.5, -0.3, 4.2, 2.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  ctx.fillStyle = COLORS.ringDark;
  ctx.beginPath();
  ctx.arc(endX, endY, 4.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.ringLight;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(endX, endY, 2.6, 0, Math.PI * 2);
  ctx.stroke();
}

function drawWarts(
  ctx: CanvasRenderingContext2D,
  pulse: number,
): void {
  const warts = [
    { x: -36, y: -12, r: 5.4 },
    { x: 39, y: -6, r: 4.8 },
    { x: -28, y: 26, r: 5.8 },
    { x: 30, y: 34, r: 5.2 },
    { x: -12, y: 58, r: 5.0 },
    { x: 14, y: 54, r: 5.6 },
    { x: -4, y: -34, r: 4.6 },
    { x: 18, y: -30, r: 4.2 },
  ];

  for (const wart of warts) {
    const glow = ctx.createRadialGradient(wart.x, wart.y, 1, wart.x, wart.y, wart.r * 2.8);
    glow.addColorStop(0, COLORS.wartGlow);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(wart.x, wart.y, wart.r * 2.4 + pulse * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.wartBase;
    ctx.beginPath();
    ctx.arc(wart.x, wart.y, wart.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(wart.x - wart.r * 0.25, wart.y - wart.r * 0.3, wart.r * 0.34, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCore(
  ctx: CanvasRenderingContext2D,
  pulse: number,
  introBoost: number,
): void {
  const coreGlow = ctx.createRadialGradient(0, 32, 2, 0, 32, 24 + introBoost * 8);
  coreGlow.addColorStop(0, COLORS.coreGlowA);
  coreGlow.addColorStop(0.3, COLORS.coreGlowB);
  coreGlow.addColorStop(0.7, COLORS.coreGlowC);
  coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(0, 32, 20 + pulse * 2.2 + introBoost * 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.coreSolid;
  ctx.beginPath();
  ctx.arc(0, 32, 9 + pulse * 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.coreHighlight;
  ctx.beginPath();
  ctx.arc(-2.4, 29.6, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(145, 255, 166, ${0.4 + pulse * 0.18})`;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-16, 26);
  ctx.lineTo(-7, 29);
  ctx.lineTo(0, 32);
  ctx.lineTo(8, 27);
  ctx.lineTo(16, 24);

  ctx.moveTo(-11, 42);
  ctx.lineTo(-4, 37);
  ctx.lineTo(0, 32);
  ctx.lineTo(6, 37);
  ctx.lineTo(13, 42);

  ctx.moveTo(-2, 16);
  ctx.lineTo(0, 24);
  ctx.lineTo(0, 32);
  ctx.lineTo(4, 22);
  ctx.lineTo(8, 14);
  ctx.stroke();
}

function drawCastEnergy(
  ctx: CanvasRenderingContext2D,
  pulse: number,
): void {
  const glow = ctx.createRadialGradient(0, 32, 2, 0, 32, 34 + pulse * 8);
  glow.addColorStop(0, 'rgba(225,255,180,0.34)');
  glow.addColorStop(0.45, 'rgba(110,255,120,0.14)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 32, 26 + pulse * 4, 0, Math.PI * 2);
  ctx.fill();
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
