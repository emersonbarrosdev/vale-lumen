import { Hero } from '../../domain/hero/hero.model';

const COLORS = {
  outline: '#161218',

  skin: '#d7a27d',
  skinLight: '#efc4a4',
  skinShadow: '#b57d59',

  hair: '#7c2d1c',
  hairDark: '#4d1b14',
  hairLight: '#ee8a34',

  coat: '#223d74',
  coatLight: '#4d78cb',
  coatDark: '#14284e',

  shirt: '#e7d5b4',
  belt: '#6b4a27',

  pants: '#66724a',
  pantsLight: '#849764',
  pantsDark: '#465132',

  boots: '#2d2118',
  bootsLight: '#4a372d',

  glove: '#d8cfc1',

  magic: '#ff9f43',
  magicLight: '#ffe08a',

  shadow: 'rgba(0, 0, 0, 0.28)',
};

export function drawHero(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
): void {
  if (
    hero.invulnerabilityTimer > 0 &&
    Math.floor(hero.invulnerabilityTimer * 20) % 2 === 0
  ) {
    return;
  }

  const t = hero.animationTime;
  const isRun = hero.state === 'run';
  const isCast = hero.state === 'cast';
  const isJump = hero.state === 'jump';
  const isFall = hero.state === 'fall';
  const isHurt = hero.state === 'hurt';

  const runCycle = Math.sin(t * 12);
  const runCycleOpposite = Math.sin(t * 12 + Math.PI);

  const bob = isRun ? Math.abs(Math.sin(t * 12)) * 3 : Math.sin(t * 3.5) * 1.2;
  const bodyLean = isRun ? 0.08 : isCast ? -0.05 : 0;
  const hurtShake = isHurt ? Math.sin(t * 35) * 2 : 0;

  const frontLegOffsetX = isRun ? runCycle * 9 : 4;
  const backLegOffsetX = isRun ? runCycleOpposite * 7 : -4;

  const frontLegLift = isRun
    ? Math.max(0, -runCycle) * 8
    : isJump
      ? 6
      : isFall
        ? -2
        : 0;

  const backLegLift = isRun
    ? Math.max(0, runCycle) * 6
    : isJump
      ? 4
      : isFall
        ? 1
        : 0;

  const frontArmAngle = isCast ? -1.0 : isRun ? runCycle * 0.75 : 0.18;
  const backArmAngle = isRun ? runCycleOpposite * 0.45 : -0.08;

  ctx.save();
  ctx.imageSmoothingEnabled = true;

  ctx.translate(
    hero.x + hero.width / 2 + hurtShake,
    hero.y + hero.height / 2 + bob,
  );

  drawGroundShadow(ctx, isRun, bob);

  /**
   * Mantido:
   * base olhando para a direita.
   */
  ctx.scale(hero.direction, 1);
  ctx.rotate(bodyLean);

  drawBackLeg(ctx, backLegOffsetX, backLegLift);
  drawBackArm(ctx, backArmAngle);
  drawTorso(ctx);
  drawHead(ctx);
  drawFrontLeg(ctx, frontLegOffsetX, frontLegLift);
  drawFrontArm(ctx, frontArmAngle, isCast);

  ctx.restore();
}

function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  isRun: boolean,
  bob: number,
): void {
  ctx.save();
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, 28 - bob, isRun ? 18 : 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBackLeg(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  lift: number,
): void {
  ctx.save();
  ctx.translate(offsetX - 3, 10 - lift);

  ctx.fillStyle = COLORS.pantsDark;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  /**
   * Coxa e canela traseiras
   */
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.quadraticCurveTo(-8, 7, -6, 16);
  ctx.quadraticCurveTo(-4, 24, 3, 24);
  ctx.lineTo(7, 24);
  ctx.quadraticCurveTo(8, 13, 4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.pants;
  ctx.beginPath();
  ctx.ellipse(1, 7, 4, 6, 0.1, 0, Math.PI * 2);
  ctx.fill();

  /**
   * Bota traseira
   */
  ctx.fillStyle = COLORS.bootsLight;
  ctx.beginPath();
  ctx.roundRect(-6, 24, 12, 7, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.boots;
  ctx.beginPath();
  ctx.roundRect(-7, 28, 14, 4, 2);
  ctx.fill();

  ctx.restore();
}

function drawFrontLeg(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  lift: number,
): void {
  ctx.save();
  ctx.translate(offsetX + 5, 9 - lift);

  ctx.fillStyle = COLORS.pants;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  /**
   * Perna da frente mais forte e menos “molenga”
   */
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.quadraticCurveTo(-10, 6, -8, 16);
  ctx.quadraticCurveTo(-6, 25, 2, 25);
  ctx.lineTo(9, 25);
  ctx.quadraticCurveTo(10, 13, 5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.pantsLight;
  ctx.beginPath();
  ctx.ellipse(2, 8, 5, 7, 0.08, 0, Math.PI * 2);
  ctx.fill();

  /**
   * Bota da frente mais pesada
   */
  ctx.fillStyle = COLORS.bootsLight;
  ctx.beginPath();
  ctx.roundRect(-7, 25, 15, 8, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.boots;
  ctx.beginPath();
  ctx.roundRect(-8, 29, 17, 4, 2);
  ctx.fill();

  ctx.restore();
}

function drawBackArm(
  ctx: CanvasRenderingContext2D,
  angle: number,
): void {
  ctx.save();
  ctx.translate(-11, -15);
  ctx.rotate(angle);

  ctx.fillStyle = COLORS.coatDark;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  /**
   * Ombro traseiro
   */
  ctx.beginPath();
  ctx.ellipse(0, 3, 6, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /**
   * Braço traseiro
   */
  ctx.beginPath();
  ctx.roundRect(-5, 4, 10, 15, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.glove;
  ctx.beginPath();
  ctx.arc(0, 21, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawFrontArm(
  ctx: CanvasRenderingContext2D,
  angle: number,
  isCast: boolean,
): void {
  ctx.save();
  ctx.translate(12, -15);
  ctx.rotate(angle);

  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  /**
   * Ombro frontal
   */
  ctx.fillStyle = COLORS.coatLight;
  ctx.beginPath();
  ctx.ellipse(0, 3, 7, 8, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /**
   * Braço frontal
   */
  ctx.fillStyle = isCast ? COLORS.coatLight : COLORS.skinLight;
  ctx.beginPath();
  ctx.roundRect(-5, 4, 10, isCast ? 19 : 15, 4);
  ctx.fill();
  ctx.stroke();

  /**
   * Mão
   */
  ctx.fillStyle = COLORS.glove;
  ctx.beginPath();
  ctx.arc(0, isCast ? 22 : 19, 4.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (isCast) {
    drawMagic(ctx, 0, 29);
  }

  ctx.restore();
}

function drawTorso(ctx: CanvasRenderingContext2D): void {
  ctx.save();

  ctx.fillStyle = COLORS.coat;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';

  /**
   * Tronco mais heroico e mais proporcional
   */
  ctx.beginPath();
  ctx.moveTo(-15, -22);
  ctx.quadraticCurveTo(-11, -31, 3, -32);
  ctx.quadraticCurveTo(18, -31, 25, -20);
  ctx.quadraticCurveTo(27, -6, 20, 10);
  ctx.quadraticCurveTo(12, 17, -3, 16);
  ctx.quadraticCurveTo(-14, 12, -17, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  /**
   * Volume do peito
   */
  ctx.fillStyle = COLORS.coatLight;
  ctx.beginPath();
  ctx.ellipse(10, -15, 7, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  /**
   * Parte interna da roupa
   */
  ctx.fillStyle = COLORS.shirt;
  ctx.beginPath();
  ctx.moveTo(2, -21);
  ctx.lineTo(15, -14);
  ctx.lineTo(10, -1);
  ctx.lineTo(0, -8);
  ctx.closePath();
  ctx.fill();

  /**
   * Cinto
   */
  ctx.fillStyle = COLORS.belt;
  ctx.beginPath();
  ctx.roundRect(-7, 11, 20, 4, 2);
  ctx.fill();

  ctx.restore();
}

function drawHead(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.translate(7, -35);

  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';

  /**
   * Cabeça 3/4 mais marcante
   */
  ctx.beginPath();
  ctx.moveTo(-7, -6);
  ctx.quadraticCurveTo(2, -16, 16, -12);
  ctx.quadraticCurveTo(25, -8, 25, 2);
  ctx.quadraticCurveTo(24, 11, 15, 16);
  ctx.quadraticCurveTo(6, 19, -3, 13);
  ctx.quadraticCurveTo(-10, 7, -10, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  /**
   * Luz no rosto
   */
  ctx.fillStyle = COLORS.skinLight;
  ctx.beginPath();
  ctx.ellipse(11, -1, 8, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  /**
   * Sombra do maxilar / lateral
   */
  ctx.fillStyle = COLORS.skinShadow;
  ctx.beginPath();
  ctx.ellipse(18, 6, 4, 5, -0.25, 0, Math.PI * 2);
  ctx.fill();

  /**
   * Olhos
   */
  ctx.fillStyle = COLORS.outline;
  ctx.beginPath();
  ctx.ellipse(8, -1, 1.5, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(13, 0, 1.3, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  /**
   * Boca
   */
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(13, 8);
  ctx.quadraticCurveTo(16, 9, 19, 7);
  ctx.stroke();

  /**
   * Cabelo / moicano com mais personalidade
   */
  ctx.fillStyle = COLORS.hair;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.lineTo(-2, -13);
  ctx.lineTo(3, -11);
  ctx.lineTo(8, -19);
  ctx.lineTo(14, -14);
  ctx.lineTo(19, -20);
  ctx.lineTo(24, -11);
  ctx.lineTo(21, -1);
  ctx.quadraticCurveTo(10, -6, -6, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  /**
   * Luz do cabelo
   */
  ctx.fillStyle = COLORS.hairLight;
  ctx.beginPath();
  ctx.ellipse(10, -11, 5, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();

  /**
   * Massa traseira do cabelo
   */
  ctx.fillStyle = COLORS.hairDark;
  ctx.beginPath();
  ctx.moveTo(-9, -2);
  ctx.quadraticCurveTo(-15, 8, -11, 17);
  ctx.quadraticCurveTo(-3, 15, -1, 6);
  ctx.quadraticCurveTo(-2, -1, -9, -2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawMagic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = COLORS.magic;
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.magicLight;
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
