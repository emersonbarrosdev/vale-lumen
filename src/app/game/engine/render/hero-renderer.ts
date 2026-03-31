import { Hero } from '../../domain/hero/hero.model';

export function drawHero(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
): void {
  const flicker =
    hero.invulnerabilityTimer > 0 &&
    Math.floor(hero.invulnerabilityTimer * 18) % 2 === 0;

  if (flicker) {
    return;
  }

  const t = hero.animationTime;
  const runCycle = Math.sin(t * 10);
  const runOpposite = Math.sin(t * 10 + Math.PI);
  const idleFloat = Math.sin(t * 2.4) * 1.5;
  const landingCompression =
    hero.landingTimer > 0 ? hero.landingTimer / 0.16 : 0;

  let bodyBob = 0;
  let frontLegAngle = 0;
  let backLegAngle = 0;
  let frontArmAngle = 0;
  let backArmAngle = 0;
  let handGlow = 0;

  switch (hero.state) {
    case 'idle':
      bodyBob = idleFloat;
      frontLegAngle = 0.04;
      backLegAngle = -0.04;
      frontArmAngle = -0.08;
      backArmAngle = 0.08;
      break;
    case 'run':
      bodyBob = Math.abs(runCycle) * 2.4;
      frontLegAngle = runCycle * 0.85;
      backLegAngle = runOpposite * 0.7;
      frontArmAngle = runOpposite * 0.28;
      backArmAngle = runCycle * 0.22;
      break;
    case 'jump':
      bodyBob = -2;
      frontLegAngle = 0.42;
      backLegAngle = -0.16;
      frontArmAngle = -0.2;
      backArmAngle = -0.36;
      break;
    case 'fall':
      bodyBob = 1.5;
      frontLegAngle = -0.18;
      backLegAngle = 0.28;
      frontArmAngle = 0.22;
      backArmAngle = -0.1;
      break;
    case 'cast':
      bodyBob = 0;
      frontLegAngle = 0.08;
      backLegAngle = -0.04;
      frontArmAngle = -1.05;
      backArmAngle = 0.1;
      handGlow = 1;
      break;
    case 'hurt':
      bodyBob = 1;
      frontLegAngle = -0.26;
      backLegAngle = 0.26;
      frontArmAngle = 0.34;
      backArmAngle = -0.14;
      break;
  }

  bodyBob += landingCompression * 2.2;

  const centerX = hero.x + hero.width / 2;
  const topY = hero.y + 8 + bodyBob;

  ctx.save();
  ctx.translate(centerX, topY);
  ctx.scale(hero.direction, 1);

  const cloakGradient = ctx.createLinearGradient(-12, 6, -20, 54);
  cloakGradient.addColorStop(0, 'rgba(127, 22, 35, 0.72)');
  cloakGradient.addColorStop(1, 'rgba(35, 9, 14, 0.08)');
  ctx.fillStyle = cloakGradient;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.lineTo(-20, 18);
  ctx.lineTo(-18, 55 + runOpposite * 1.5);
  ctx.lineTo(-7, 46);
  ctx.closePath();
  ctx.fill();

  drawLimb(ctx, -5, 40, backLegAngle, 13, 12, '#2b3148', '#4d5a79', 0.88);
  drawLimb(ctx, 6, 40, frontLegAngle, 13, 12, '#353d57', '#5b6b90', 1);

  drawLimb(ctx, -7, 18, backArmAngle, 11, 0, '#35435d', '#9bb1d7', 0.84);
  drawLimb(ctx, 9, 18, frontArmAngle, 15, 0, '#435674', '#c2d6ff', 1);

  const torsoGradient = ctx.createLinearGradient(0, 4, 0, 34);
  torsoGradient.addColorStop(0, '#2d4664');
  torsoGradient.addColorStop(0.55, '#23384d');
  torsoGradient.addColorStop(1, '#17212f');

  ctx.fillStyle = torsoGradient;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.lineTo(9, 7);
  ctx.lineTo(11, 32);
  ctx.lineTo(2, 40);
  ctx.lineTo(-9, 36);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#191f2d';
  ctx.fillRect(-8, 28, 18, 10);

  ctx.fillStyle = '#601926';
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.lineTo(-2, 8);
  ctx.lineTo(-4, 30);
  ctx.lineTo(-9, 26);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d8ba9a';
  ctx.beginPath();
  ctx.ellipse(2, 1, 9, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#14161d';
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.lineTo(-3, -10);
  ctx.lineTo(5, -11);
  ctx.lineTo(10, -5);
  ctx.lineTo(8, 2);
  ctx.lineTo(1, 2);
  ctx.lineTo(-6, 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0f1117';
  ctx.fillRect(3, -1, 2, 2);
  ctx.fillRect(6, 1, 2, 1);

  if (handGlow > 0) {
    const handX = 9 + Math.cos(frontArmAngle) * 15;
    const handY = 18 + Math.sin(frontArmAngle) * 15;

    ctx.strokeStyle = 'rgba(255, 174, 102, 0.95)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(handX - 5, handY - 8);
    ctx.lineTo(handX + 1, handY - 1);
    ctx.lineTo(handX - 3, handY - 1);
    ctx.lineTo(handX + 5, handY + 10);
    ctx.stroke();
  }

  ctx.restore();
}

function drawLimb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  firstLength: number,
  secondLength: number,
  primaryColor: string,
  secondaryColor: string,
  alpha: number,
): void {
  const jointX = x + Math.sin(angle) * firstLength;
  const jointY = y + Math.cos(angle) * firstLength;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';

  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(jointX, jointY);
  ctx.stroke();

  if (secondLength > 0) {
    const footX = jointX + Math.sin(angle * 0.75) * secondLength;
    const footY = jointY + Math.cos(angle * 0.75) * secondLength;

    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(jointX, jointY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    ctx.strokeStyle = '#151922';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(footX - 4, footY);
    ctx.lineTo(footX + 4, footY);
    ctx.stroke();
  } else {
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(jointX, jointY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
