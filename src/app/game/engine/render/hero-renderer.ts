import { Hero } from '../../domain/hero/hero.model';

const BASE_COLORS = {
  body: '#000000',
  glow: '#ff6a00',
  glowSoft: 'rgba(255, 106, 0, 0.28)',
  glowStrong: 'rgba(255, 140, 40, 0.72)',
};

const SPECIAL_COLORS = {
  body: '#000000',
  glow: '#82e8ff',
  glowSoft: 'rgba(130, 232, 255, 0.28)',
  glowStrong: 'rgba(255, 234, 128, 0.76)',
};

type HeroPalette = typeof BASE_COLORS;

export function drawHero(ctx: CanvasRenderingContext2D, hero: Hero): void {
  if (hero.invulnerabilityTimer > 0 && Math.floor(hero.invulnerabilityTimer * 20) % 2 === 0) {
    return;
  }

  const t = hero.animationTime;
  const isRun = hero.state === 'run';
  const isIdle = hero.state === 'idle';
  const isJump = hero.state === 'jump';
  const isFall = hero.state === 'fall';
  const isCast = hero.state === 'cast';
  const isAir = isJump || isFall;
  const isUpCast = isCast && hero.castAim === 'up';
  const isSpecialCast = isCast && hero.castDuration >= 0.45;
  const palette: HeroPalette = isSpecialCast ? SPECIAL_COLORS : BASE_COLORS;

  const runCycle = isRun ? t * 14 : 0;
  const castProgress = getCastProgress(hero, isCast);

  const bob = isRun
    ? Math.sin(runCycle * 2) * 1.8 + Math.cos(runCycle) * 0.35
    : isCast
      ? Math.sin(t * 9) * 0.05
      : Math.sin(t * 2.5) * 0.4;

  const lean = isIdle
    ? 0
    : isCast
      ? (isUpCast ? -0.02 : 0.04)
      : isRun
        ? 0.24 + Math.sin(runCycle) * 0.03
        : isAir
          ? 0.25
          : 0.05;

  ctx.save();
  ctx.translate(hero.x + hero.width / 2, hero.y + hero.height / 2 + bob + 10);
  ctx.scale(hero.direction * 1.1, 0.98);

  drawLeg(ctx, runCycle + Math.PI, isRun, isAir, isIdle, false, palette);
  drawArm(
    ctx,
    t,
    runCycle,
    false,
    isRun,
    isIdle,
    isAir,
    isCast,
    isSpecialCast,
    isUpCast,
    castProgress,
    palette,
  );

  ctx.save();
  ctx.rotate(lean);

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

  ctx.save();
  const headTranslateX = isUpCast ? 0 : (isRun || isAir ? 4.4 : isCast ? 1.4 : 0);
  const headTranslateY = isUpCast ? -38.5 : -35.8 + (isAir ? -1.8 : 0) + (isRun ? Math.sin(runCycle) * 0.35 : 0);

  ctx.translate(headTranslateX, headTranslateY);
  if (isUpCast) {
    ctx.rotate(-0.88);
  } else if (isRun) {
    ctx.rotate(Math.sin(runCycle) * 0.04);
  }

  drawMohawk(ctx, palette);

  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.glow;
  if (isUpCast) {
    ctx.beginPath();
    ctx.arc(-0.4, -4.7, 2.15, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(3.0, -0.8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (isSpecialCast) {
    drawSpecialAura(ctx, palette);
  }

  ctx.restore();

  drawLeg(ctx, runCycle, isRun, isAir, isIdle, true, palette);
  drawArm(
    ctx,
    t,
    runCycle + Math.PI,
    true,
    isRun,
    isIdle,
    isAir,
    isCast,
    isSpecialCast,
    isUpCast,
    castProgress,
    palette,
  );

  ctx.restore();
}

function drawSpecialAura(
  ctx: CanvasRenderingContext2D,
  palette: HeroPalette,
): void {
  const aura = ctx.createRadialGradient(0, -18, 6, 0, -18, 32);
  aura.addColorStop(0, palette.glowStrong);
  aura.addColorStop(0.45, palette.glowSoft);
  aura.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, -18, 30, 0, Math.PI * 2);
  ctx.fill();
}

function getCastProgress(hero: Hero, isCast: boolean): number {
  if (!isCast) return 0;

  if (typeof hero.castTimer === 'number' && typeof hero.castDuration === 'number' && hero.castDuration > 0) {
    return clamp01(1 - hero.castTimer / hero.castDuration);
  }

  return 0.65;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function drawMohawk(ctx: CanvasRenderingContext2D, palette: HeroPalette): void {
  ctx.fillStyle = palette.glow;

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

function drawArm(
  ctx: CanvasRenderingContext2D,
  t: number,
  cycle: number,
  isFront: boolean,
  isRun: boolean,
  isIdle: boolean,
  isAir: boolean,
  isCast: boolean,
  isSpecialCast: boolean,
  isUpCast: boolean,
  castProgress: number,
  palette: HeroPalette,
): void {
  ctx.save();

  const shoulderBaseY = -21.5;
  const shoulderBaseX = isFront ? 2 : -2;

  let shoulderX = shoulderBaseX;
  let shoulderY = shoulderBaseY;

  let armRot = 0;
  let elbowRot = 0;
  let handGlow = false;
  let handGlowStrength = 0;

  if (isCast) {
    const extend = smoothStep(0.08, 0.7, castProgress);
    const microA = Math.sin(t * 8) * 0.008;
    const microB = Math.cos(t * 7) * 0.008;

    if (isUpCast) {
      shoulderY -= 4 + extend * 2.2;
      shoulderX += isFront ? -0.4 : 0.4;

      armRot = Math.PI + (isFront ? microA * 0.04 : -microA * 0.04);
      elbowRot = microB * 0.03;

      handGlow = true;
      handGlowStrength = isFront ? 1 + extend * 0.88 : 0.82 + extend * 0.56;
    } else if (isSpecialCast) {
      if (isFront) {
        shoulderX += 1.15 + extend * 1.45;
        shoulderY -= 0.5;
        armRot = lerp(-0.78, -1.02, extend) + microA;
        elbowRot = lerp(0.02, -0.05, extend) + microB;
        handGlow = true;
        handGlowStrength = 0.82 + extend * 0.88;
      } else {
        shoulderX += 1.05 + extend * 1.35;
        shoulderY += 0.55;
        armRot = lerp(-0.16, -0.28, extend) + microA * 0.35;
        elbowRot = lerp(0.01, -0.02, extend) + microB * 0.25;
        handGlow = true;
        handGlowStrength = 0.58 + extend * 0.46;
      }
    } else {
      if (isFront) {
        shoulderX += 1 + extend * 1.25;
        shoulderY -= 0.25;
        armRot = lerp(-0.86, -1.16, extend) + microA;
        elbowRot = lerp(0.05, -0.05, extend) + microB;
        handGlow = true;
        handGlowStrength = 0.72 + extend * 0.72;
      } else {
        armRot = -0.06;
        elbowRot = 0.03;
      }
    }
  } else {
    if (isRun) {
      armRot = Math.sin(cycle) * 0.92 - 0.38;
      elbowRot = -0.82 + Math.sin(cycle * 2) * 0.06;
      shoulderY += Math.cos(cycle) * 0.4;
    } else if (isAir) {
      armRot = isFront ? -0.88 : -0.58;
      elbowRot = -0.32;
    } else if (isIdle) {
      armRot = isFront ? 0.08 : -0.08;
      elbowRot = 0.04;
    }
  }

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

  if (handGlow) {
    ctx.save();

    const outerRadius = 6 + handGlowStrength * 4;
    const handY = 8.4;
    const grad = ctx.createRadialGradient(0, handY, 1.2, 0, handY, outerRadius);
    grad.addColorStop(0, palette.glowStrong);
    grad.addColorStop(0.45, palette.glowSoft);
    grad.addColorStop(1, 'rgba(255, 106, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, handY, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(0, handY, 1.7 + handGlowStrength * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}
