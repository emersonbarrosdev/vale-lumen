import { Hero } from '../../domain/hero/hero.model';

const BASE_COLORS = {
  body: '#000000',
  glow: '#ffffff',
  glowSoft: 'rgba(255, 106, 0, 0.28)',
  glowStrong: 'rgba(255, 140, 40, 0.72)',
  weaponDark: '#101216',
  weaponMid: '#ff9900',
  weaponLight: '#804603',
  weaponGlow: '#ffb15c',
  hair: '#ffffff',
};

const SPECIAL_COLORS = {
  body: '#000000',
  glow: '#82e8ff',
  glowSoft: 'rgba(130, 232, 255, 0.28)',
  glowStrong: 'rgba(255, 234, 128, 0.76)',
  weaponDark: '#0f1218',
  weaponMid: '#dfe7f1',
  weaponLight: '#fbfdff',
  weaponGlow: '#d6fbff',
  hair: '#82e8ff',
};

const MEGA_COLORS = {
  body: '#000000',
  glow: '#ff6e2e',
  glowSoft: 'rgba(255, 110, 46, 0.28)',
  glowStrong: 'rgba(255, 194, 110, 0.82)',
  weaponDark: '#121212',
  weaponMid: '#eceff4',
  weaponLight: '#ffffff',
  weaponGlow: '#ffd29c',
  hair: '#ff8b3d',
};

type HeroPalette = typeof BASE_COLORS;

export function drawHero(ctx: CanvasRenderingContext2D, hero: Hero): void {
  const shouldBlink =
    hero.shieldGraceTimer > 0 &&
    Math.floor(performance.now() / 90) % 2 === 0;

  if (
    (hero.invulnerabilityTimer > 0 && Math.floor(hero.invulnerabilityTimer * 20) % 2 === 0) ||
    shouldBlink
  ) {
    return;
  }

  const t = hero.animationTime;
  const speedAbs = Math.abs(hero.vx);

  const isRun = hero.state === 'run';
  const isIdle = hero.state === 'idle';
  const isJump = hero.state === 'jump';
  const isFall = hero.state === 'fall';
  const isCast = hero.state === 'cast';
  const isCrouch = hero.state === 'crouch';
  const isAir = isJump || isFall;

  const isAimingUp = hero.aimingUp && !isCast;
  const isUpShot = (isCast && hero.castAim === 'up') || isAimingUp;
  const isSpecialShot = hero.specialCasting;
  const isMegaShot = hero.megaCasting || hero.megaVisualTimer > 0;
  const isCrouchShot =
    hero.crouching &&
    isCast &&
    hero.castAim === 'forward' &&
    !isSpecialShot &&
    !isMegaShot;

  const isRunShot =
    isCast &&
    hero.castAim === 'forward' &&
    !isSpecialShot &&
    !isMegaShot &&
    !isAir &&
    !hero.crouching &&
    speedAbs > 70;

  const palette: HeroPalette = isMegaShot
    ? MEGA_COLORS
    : isSpecialShot
      ? SPECIAL_COLORS
      : BASE_COLORS;

  const runCycleBase = t * 14;
  const runCycle = (isRun || isRunShot) ? runCycleBase : 0;

  const bob = isCrouchShot || isCrouch
    ? Math.sin(t * 8) * 0.16
    : isRunShot
      ? Math.sin(runCycle * 2) * 1.5 + Math.cos(runCycle) * 0.25
      : isRun
        ? Math.sin(runCycle * 2) * 1.8 + Math.cos(runCycle) * 0.35
        : isCast || isAimingUp
          ? Math.sin(t * 10) * 0.04
          : Math.sin(t * 2.5) * 0.4;

  const lean = isCrouchShot || isCrouch
    ? -0.12
    : isIdle
      ? (isAimingUp ? -0.015 : 0)
      : isRunShot
        ? 0.18 + Math.sin(runCycle) * 0.025
        : isCast || isAimingUp
          ? (isUpShot ? -0.025 : isMegaShot ? 0 : -0.06)
          : isRun
            ? 0.22 + Math.sin(runCycle) * 0.03
            : isAir
              ? 0.24
              : 0.04;

  ctx.save();
  ctx.translate(
    hero.x + hero.width / 2,
    hero.y + hero.height / 2 + bob + (hero.crouching ? 18 : 10),
  );
  ctx.scale(hero.direction * 1.1, hero.crouching ? 0.82 : 0.98);

  if (!hero.crouching) {
    drawLeg(
      ctx,
      runCycle + Math.PI,
      isRun || isRunShot,
      isAir,
      isIdle,
      false,
      palette,
    );
  } else {
    drawCrouchLeg(ctx, false, palette);
  }

  ctx.save();
  ctx.rotate(lean);

  drawArmBack(
    ctx,
    runCycle,
    isRun || isRunShot,
    isIdle,
    isAir,
    isCast || isAimingUp,
    isUpShot,
    isMegaShot,
    isRunShot,
    hero.crouching,
    palette,
  );

  if (hero.crouching) {
    drawCrouchBody(ctx, palette);
  } else {
    drawStandingBody(ctx, palette);
  }

  ctx.save();
  const headTranslateX = hero.crouching
    ? (isUpShot ? -0.8 : 0.6)
    : isUpShot
      ? -1.8
      : isRunShot
        ? 3.2
        : (isRun || isAir ? 4.2 : isCast ? 1.2 : 0);

  const headTranslateY = hero.crouching
    ? -23.8
    : isUpShot
      ? -34.8
      : -35.8 + (isAir ? -1.8 : 0) + ((isRun || isRunShot) ? Math.sin(runCycle) * 0.35 : 0);

  ctx.translate(headTranslateX, headTranslateY);

  if (isUpShot) {
    ctx.rotate(-0.28);
  } else if (isRun || isRunShot) {
    ctx.rotate(Math.sin(runCycle) * 0.04);
  } else if (hero.crouching) {
    ctx.rotate(-0.08);
  }

  drawMohawk(ctx, palette);

  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.arc(0, 0, hero.crouching ? 7.7 : 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.glow;
  if (isUpShot) {
    ctx.beginPath();
    ctx.arc(0.6, -3.8, 2.05, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(hero.crouching ? 2.5 : 3.0, hero.crouching ? -0.4 : -0.8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (hero.shieldActive || hero.shieldGraceTimer > 0) {
    drawProtectionRunes(ctx, hero.shieldGraceTimer > 0);
  }

  if (isSpecialShot) {
    drawSpecialAura(ctx, palette, false);
  }

  if (isMegaShot) {
    drawSpecialAura(ctx, palette, true);
    drawChestAura(ctx, palette);
  }

  if (isUpShot) {
    drawArmFront(
      ctx,
      runCycle + Math.PI,
      isRun || isRunShot,
      isIdle,
      isAir,
      isCast || isAimingUp,
      isUpShot,
      isMegaShot,
      isRunShot,
      hero.crouching,
      palette,
    );
    drawWeapon(
      ctx,
      isRun || isRunShot,
      isAir,
      isCast || isAimingUp,
      isUpShot,
      isSpecialShot || isMegaShot,
      isRunShot,
      hero.crouching,
      runCycle,
      palette,
    );
  } else {
    drawWeapon(
      ctx,
      isRun || isRunShot,
      isAir,
      isCast || isAimingUp,
      isUpShot,
      isSpecialShot || isMegaShot,
      isRunShot,
      hero.crouching,
      runCycle,
      palette,
    );
    drawArmFront(
      ctx,
      runCycle + Math.PI,
      isRun || isRunShot,
      isIdle,
      isAir,
      isCast || isAimingUp,
      isUpShot,
      isMegaShot,
      isRunShot,
      hero.crouching,
      palette,
    );
  }

  ctx.restore();

  if (!hero.crouching) {
    drawLeg(
      ctx,
      runCycle,
      isRun || isRunShot,
      isAir,
      isIdle,
      true,
      palette,
    );
  } else {
    drawCrouchLeg(ctx, true, palette);
  }

  ctx.restore();
}

function drawStandingBody(
  ctx: CanvasRenderingContext2D,
  palette: HeroPalette,
): void {
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.moveTo(-6, -27.5);
  ctx.quadraticCurveTo(0, -29.5, 6, -27.5);
  ctx.quadraticCurveTo(11, -14.2, 7, 0.6);
  ctx.quadraticCurveTo(0, 3.4, -7, 0.6);
  ctx.quadraticCurveTo(-11, -14.2, -6, -27.5);
  ctx.fill();

  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-4, -28);
  ctx.quadraticCurveTo(-8, -27, -9, -20);
  ctx.stroke();

  ctx.save();
  ctx.fillStyle = palette.body;
  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6, -28);
  ctx.quadraticCurveTo(-11, -27, -11, -20);
  ctx.quadraticCurveTo(-11, -8, -6, -10);
  ctx.quadraticCurveTo(-3, -11, -5, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10.5, -22);
  ctx.quadraticCurveTo(-11, -12, -7, -11);
  ctx.stroke();

  ctx.fillStyle = palette.glow;
  ctx.beginPath();
  ctx.arc(-10.5, -22, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-4, -29);
  ctx.bezierCurveTo(2, -30, 6, -24, 5, -18);
  ctx.stroke();

  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.moveTo(-3, -27.5);
  ctx.quadraticCurveTo(0, -29.2, 3, -27.5);
  ctx.lineTo(2.5, -31.2);
  ctx.quadraticCurveTo(0, -32.2, -2.5, -31.2);
  ctx.closePath();
  ctx.fill();
}

function drawCrouchBody(
  ctx: CanvasRenderingContext2D,
  palette: HeroPalette,
): void {
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.moveTo(-9, -16.5);
  ctx.quadraticCurveTo(-2, -24, 8, -20);
  ctx.quadraticCurveTo(12, -12, 9, -3);
  ctx.quadraticCurveTo(2, 3.5, -9, 0.2);
  ctx.quadraticCurveTo(-12, -8, -9, -16.5);
  ctx.fill();

  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.quadraticCurveTo(-8.5, -14, -8, -7);
  ctx.stroke();

  ctx.save();
  ctx.fillStyle = palette.body;
  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-8.5, -16.5);
  ctx.quadraticCurveTo(-12.2, -14.2, -11.7, -8.2);
  ctx.quadraticCurveTo(-11.2, -2.4, -6.8, -3.7);
  ctx.quadraticCurveTo(-3.8, -4.3, -4.9, -8.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawProtectionRunes(
  ctx: CanvasRenderingContext2D,
  isGraceState: boolean,
): void {
  const now = performance.now() * 0.004;
  const baseColor = isGraceState ? '#d6fbff' : '#82e8ff';
  const softColor = isGraceState
    ? 'rgba(214, 251, 255, 0.18)'
    : 'rgba(130, 232, 255, 0.16)';

  const aura = ctx.createRadialGradient(0, -18, 8, 0, -18, 28);
  aura.addColorStop(0, softColor);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -18, 28, 0, Math.PI * 2);
  ctx.fill();

  const runePoints = [
    { angle: now, radius: 20 },
    { angle: now + Math.PI * 0.66, radius: 18 },
    { angle: now + Math.PI * 1.33, radius: 19 },
  ];

  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';

  for (const rune of runePoints) {
    const x = Math.cos(rune.angle) * rune.radius;
    const y = -18 + Math.sin(rune.angle) * (rune.radius * 0.55);

    drawRune(ctx, x, y, baseColor);
  }

  drawSpark(ctx, Math.cos(now * 1.8) * 12, -31 + Math.sin(now * 1.6) * 4, baseColor);
  drawSpark(ctx, Math.cos(now * 1.4 + 1.4) * 15, -11 + Math.sin(now * 1.7 + 0.8) * 5, baseColor);
  drawSpark(ctx, Math.cos(now * 1.2 + 2.1) * 10, -24 + Math.sin(now * 1.4 + 1.6) * 3, baseColor);
}

function drawRune(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.15;

  ctx.beginPath();
  ctx.moveTo(-3, -4);
  ctx.lineTo(0, -7);
  ctx.lineTo(3, -4);
  ctx.moveTo(-3, 4);
  ctx.lineTo(0, 7);
  ctx.lineTo(3, 4);
  ctx.moveTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.stroke();

  ctx.restore();
}

function drawSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-1.6, 0);
  ctx.lineTo(1.6, 0);
  ctx.moveTo(0, -1.6);
  ctx.lineTo(0, 1.6);
  ctx.stroke();

  ctx.restore();
}

function drawSpecialAura(
  ctx: CanvasRenderingContext2D,
  palette: HeroPalette,
  isMega: boolean,
): void {
  const aura = ctx.createRadialGradient(0, -18, 6, 0, -18, isMega ? 40 : 32);
  aura.addColorStop(0, palette.glowStrong);
  aura.addColorStop(0.45, palette.glowSoft);
  aura.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -18, isMega ? 36 : 30, 0, Math.PI * 2);
  ctx.fill();
}

function drawChestAura(
  ctx: CanvasRenderingContext2D,
  palette: HeroPalette,
): void {
  const aura = ctx.createRadialGradient(0, -14, 4, 0, -6, 30);
  aura.addColorStop(0, palette.glowStrong);
  aura.addColorStop(0.34, palette.glowSoft);
  aura.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -8, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-11, -7);
  ctx.lineTo(-4, -10);
  ctx.lineTo(0, -15);
  ctx.lineTo(4, -10);
  ctx.lineTo(11, -7);

  ctx.moveTo(-8, 0);
  ctx.lineTo(-2, -3);
  ctx.lineTo(0, -8);
  ctx.lineTo(2, -3);
  ctx.lineTo(8, 0);
  ctx.stroke();
}

function drawMohawk(ctx: CanvasRenderingContext2D, palette: HeroPalette): void {
  ctx.fillStyle = palette.hair;

  const spikes = [
    { x: -7.4, y: 1, h: 6.8, w: 4, rot: -1.8 },
    { x: -8.2, y: -3.6, h: 9.4, w: 5, rot: -1.2 },
    { x: -5.6, y: -7.8, h: 11.8, w: 6, rot: -0.6 },
    { x: 0, y: -9.1, h: 13.6, w: 7, rot: 0 },
    { x: 4.6, y: -7.9, h: 11.2, w: 5, rot: 0.5 },
  ];

  spikes.forEach((s) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.beginPath();
    ctx.moveTo(-s.w / 2, 0);
    ctx.quadraticCurveTo(-s.w * 0.1, -s.h * 0.3, 0, -s.h);
    ctx.quadraticCurveTo(s.w * 0.1, -s.h * 0.3, s.w / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  isRun: boolean,
  isAir: boolean,
  isIdle: boolean,
  isFront: boolean,
  palette: HeroPalette,
): void {
  ctx.save();

  let hipRot = 0;
  let kneeRot = 0;

  if (isRun) {
    hipRot = Math.sin(cycle) * 0.78 + (isFront ? 0.06 : -0.06);
    kneeRot = Math.max(0, -Math.cos(cycle)) * 1.12 + Math.sin(cycle * 2) * 0.06;
  } else if (isIdle) {
    hipRot = isFront ? 0.04 : -0.04;
    kneeRot = 0;
  } else if (isAir) {
    hipRot = isFront ? 0.34 : -0.26;
    kneeRot = isFront ? 0.16 : 0.68;
  }

  ctx.rotate(hipRot);
  ctx.fillStyle = palette.body;

  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.quadraticCurveTo(-4, 6.9, -2.5, 13.1);
  ctx.lineTo(2.5, 13.1);
  ctx.quadraticCurveTo(4, 6.9, 3, 0);
  ctx.fill();

  ctx.translate(0, 13.1);
  ctx.rotate(kneeRot);

  ctx.beginPath();
  ctx.moveTo(-2.5, 0);
  ctx.lineTo(-2.5, 9.8);
  ctx.quadraticCurveTo(6, 9.8, 5, 13.1);
  ctx.lineTo(-3, 13.1);
  ctx.lineTo(-3, 0);
  ctx.fill();

  ctx.restore();
}

function drawCrouchLeg(
  ctx: CanvasRenderingContext2D,
  isFront: boolean,
  palette: HeroPalette,
): void {
  ctx.save();
  ctx.translate(isFront ? 4.2 : -4.2, 0);
  ctx.fillStyle = palette.body;

  ctx.beginPath();
  ctx.moveTo(-7, 0.5);
  ctx.quadraticCurveTo(-4, 4.4, 1, 5.2);
  ctx.quadraticCurveTo(7.5, 5.4, 10.5, 8.5);
  ctx.lineTo(9.3, 11.7);
  ctx.quadraticCurveTo(3.8, 10.7, -1.5, 9.8);
  ctx.quadraticCurveTo(-6.5, 8.8, -9.6, 5.8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawArmBack(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  isRun: boolean,
  isIdle: boolean,
  isAir: boolean,
  isCast: boolean,
  isUpShot: boolean,
  isMegaShot: boolean,
  isRunShot: boolean,
  isCrouching: boolean,
  palette: HeroPalette,
): void {
  ctx.save();

  let shoulderX = -2;
  let shoulderY = -21.5;
  let armRot = 0;
  let elbowRot = 0;

  if (isCrouching) {
    shoulderX = -4.2;
    shoulderY = -11.2;
    armRot = isCast ? -0.48 : 0.22;
    elbowRot = isCast ? 0.08 : 0.42;
  } else if (isRunShot) {
    shoulderX = -2.6;
    shoulderY = -21.1;
    armRot = Math.sin(cycle) * 0.48 - 0.22;
    elbowRot = -0.36 + Math.sin(cycle * 2) * 0.04;
  } else if (isCast) {
    if (isUpShot) {
      shoulderX = -4.4;
      shoulderY = -20.8;
      armRot = -3.08;
      elbowRot = 0.02;
    } else if (isMegaShot) {
      shoulderX = -5.4;
      shoulderY = -21.2;
      armRot = -2.02;
      elbowRot = 0.14;
    } else {
      shoulderX = -0.5;
      shoulderY = -20.2;
      armRot = -0.5;
      elbowRot = 0.12;
    }
  } else if (isRun) {
    armRot = Math.sin(cycle) * 0.92 - 0.38;
    elbowRot = -0.82 + Math.sin(cycle * 2) * 0.06;
  } else if (isAir) {
    armRot = -0.58;
    elbowRot = -0.22;
  } else if (isIdle) {
    armRot = -0.08;
    elbowRot = 0.04;
  }

  drawArmShape(ctx, shoulderX, shoulderY, armRot, elbowRot, palette);
  ctx.restore();
}

function drawArmFront(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  isRun: boolean,
  isIdle: boolean,
  isAir: boolean,
  isCast: boolean,
  isUpShot: boolean,
  isMegaShot: boolean,
  isRunShot: boolean,
  isCrouching: boolean,
  palette: HeroPalette,
): void {
  ctx.save();

  let shoulderX = 2;
  let shoulderY = -21.5;
  let armRot = 0;
  let elbowRot = 0;

  if (isCrouching) {
    shoulderX = 4.8;
    shoulderY = -11.1;
    armRot = isCast ? -0.9 : -0.22;
    elbowRot = isCast ? -0.22 : 0.3;
  } else if (isRunShot) {
    shoulderX = 4.8;
    shoulderY = -20.9;
    armRot = -0.54 + Math.sin(cycle) * 0.12;
    elbowRot = -0.2 + Math.sin(cycle * 2) * 0.02;
  } else if (isCast) {
    if (isUpShot) {
      shoulderX = 5.0;
      shoulderY = -21.2;
      armRot = -3.09;
      elbowRot = 0.02;
    } else if (isMegaShot) {
      shoulderX = 6.2;
      shoulderY = -21.2;
      armRot = -1.18;
      elbowRot = -0.12;
    } else {
      shoulderX = 5.1;
      shoulderY = -20.0;
      armRot = -1.04;
      elbowRot = -0.12;
    }
  } else if (isRun) {
    armRot = Math.sin(cycle) * 0.92 - 0.38;
    elbowRot = -0.82 + Math.sin(cycle * 2) * 0.06;
  } else if (isAir) {
    armRot = -0.88;
    elbowRot = -0.3;
  } else if (isIdle) {
    armRot = 0.08;
    elbowRot = 0.04;
  }

  drawArmShape(ctx, shoulderX, shoulderY, armRot, elbowRot, palette);
  ctx.restore();
}

function drawArmShape(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  armRot: number,
  elbowRot: number,
  palette: HeroPalette,
): void {
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(armRot);
  ctx.fillStyle = palette.body;

  ctx.beginPath();
  ctx.arc(0, 0, 3, Math.PI, 0);
  ctx.lineTo(2.2, 11.8);
  ctx.quadraticCurveTo(0, 13.6, -2.2, 11.8);
  ctx.lineTo(-3, 0);
  ctx.closePath();
  ctx.fill();

  ctx.translate(0, 11.8);
  ctx.rotate(elbowRot);

  ctx.beginPath();
  ctx.moveTo(-2.2, 0);
  ctx.lineTo(-2.2, 6.5);
  ctx.arc(0, 8.4, 3.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawWeapon(
  ctx: CanvasRenderingContext2D,
  isRun: boolean,
  isAir: boolean,
  isCast: boolean,
  isUpShot: boolean,
  isSpecialShot: boolean,
  isRunShot: boolean,
  isCrouching: boolean,
  runCycle: number,
  palette: HeroPalette,
): void {
  ctx.save();

  let weaponX = 9.2;
  let weaponY = -18.2;
  let weaponRot = -0.06;

  if (isCrouching) {
    weaponX = 15.4;
    weaponY = -9.2;
    weaponRot = -0.02;
  } else if (isRunShot) {
    weaponX = 13.1;
    weaponY = -19.0 + Math.sin(runCycle) * 0.14;
    weaponRot = -0.14 + Math.sin(runCycle) * 0.02;
  } else if (isCast) {
    if (isUpShot) {
      weaponX = 0.2;
      weaponY = -48.5;
      weaponRot = -1.57;
    } else {
      weaponX = 15.0;
      weaponY = -17.6;
      weaponRot = isSpecialShot ? -0.12 : -0.08;
    }
  } else if (isRun) {
    weaponX = 9.2;
    weaponY = -18.2 + Math.sin(runCycle) * 0.24;
    weaponRot = -0.08 + Math.sin(runCycle) * 0.03;
  } else if (isAir) {
    weaponX = 10.6;
    weaponY = -18.2;
    weaponRot = -0.14;
  }

  ctx.translate(weaponX, weaponY);
  ctx.rotate(weaponRot);

  const muzzleGlow = ctx.createRadialGradient(14.8, -0.35, 1, 14.8, -0.35, isSpecialShot ? 10 : 6);
  muzzleGlow.addColorStop(0, palette.glowStrong);
  muzzleGlow.addColorStop(0.4, palette.glowSoft);
  muzzleGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = muzzleGlow;
  ctx.beginPath();
  ctx.arc(14.8, -0.35, isSpecialShot ? 8 : 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.weaponDark;
  roundRect(ctx, -7, -2.8, 19, 5.6, 2.2);
  ctx.fill();

  ctx.fillStyle = palette.weaponMid;
  roundRect(ctx, -0.8, -4.6, 8.2, 3.2, 1.4);
  ctx.fill();

  ctx.fillStyle = palette.weaponLight;
  roundRect(ctx, -8.4, -1.7, 3.4, 3.4, 1.1);
  ctx.fill();

  ctx.fillStyle = palette.weaponLight;
  roundRect(ctx, 10.8, -1.7, 5.6, 2.8, 1.1);
  ctx.fill();

  ctx.fillStyle = palette.weaponGlow;
  roundRect(ctx, 14.8, -1.5, 3.3, 2.3, 0.9);
  ctx.fill();

  ctx.fillStyle = palette.weaponMid;
  ctx.save();
  ctx.translate(-0.2, 3.4);
  ctx.rotate(0.5);
  roundRect(ctx, -1.1, 0, 2.6, 6.6, 1.1);
  ctx.fill();
  ctx.restore();

  ctx.restore();
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
