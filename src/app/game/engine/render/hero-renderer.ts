import { Hero, HeroState } from '../../domain/hero/hero.model';

const COLORS = {
  outline: '#0d1015',
  deepShadow: '#11161d',
  shadow: '#1b222c',

  skin: '#d7cbbf',
  skinLight: '#f1e6da',
  skinShadow: '#a99b90',

  crack: '#e8c97a',
  crackGlow: '#fff2be',

  hair: '#241f26',
  hairLight: '#463b48',
  hairGlow: '#b9874d',
  hairShadow: '#151118',

  cape: '#6f2a31',
  capeLight: '#96434b',
  capeShadow: '#491a20',

  scarf: '#7d3438',
  scarfLight: '#a64a51',
  scarfShadow: '#592329',

  tunic: '#d8d0c3',
  tunicLight: '#eee6d8',
  tunicShadow: '#b8ae9f',

  vest: '#314457',
  vestLight: '#49627a',
  vestShadow: '#233241',

  belt: '#6d5338',
  beltLight: '#94704b',
  buckle: '#b8c0c8',
  pouch: '#59452f',

  pants: '#3f4752',
  pantsLight: '#56616d',
  pantsShadow: '#2b3139',

  boots: '#4d3a2d',
  bootsLight: '#6d5240',
  bootsShadow: '#30241c',

  glove: '#594534',
  gloveLight: '#765b43',

  eye: '#dcb16b',
  eyeGlow: '#fff0c6',

  ember: '#f1c775',
  emberLight: '#fff0bf',
};

export function drawHero(ctx: CanvasRenderingContext2D, hero: Hero): void {
  if (
    hero.invulnerabilityTimer > 0 &&
    Math.floor(hero.invulnerabilityTimer * 20) % 2 === 0
  ) {
    return;
  }

  const t = hero.animationTime;
  const isRun = hero.state === 'run';
  const isAir = hero.state === 'jump' || hero.state === 'fall';
  const isCast = hero.state === 'cast';
  const isCrouch = hero.state === 'crouch';
  const isHurt = hero.state === 'hurt';

  const runCycle = isRun ? t * 12 : 0;

  const castProgress =
    hero.castDuration > 0 && hero.castTimer > 0
      ? 1 - hero.castTimer / hero.castDuration
      : 0;

  // Ajuste de Bobbing (movimento vertical) mais sutil para humanos
  const bob = isRun
    ? Math.sin(runCycle * 2) * 1.2
    : isCrouch
      ? 0
      : Math.sin(t * 2.5) * 0.4;

  const lean = isRun
    ? 0.12 + Math.sin(runCycle) * 0.02
    : isCast
      ? 0.05
      : isHurt
        ? -0.15
        : 0;

  const crouchOffsetY = isCrouch ? 12 : 0;

  ctx.save();
  // Centralização baseada no pé para facilitar proporção
  ctx.translate(
    hero.x + hero.width / 2,
    hero.y + hero.height / 2 + bob + crouchOffsetY,
  );

  // Escala levemente reduzida para compensar o aumento das pernas
  ctx.scale(hero.direction * 1.1, 1.1);

  // Ordem de renderização: Camadas de trás para frente
  drawBackCape(ctx, t, runCycle, isRun, isAir, isCrouch, isCast, castProgress);

  // Perna de trás
  drawLeg(ctx, runCycle + Math.PI, false, isRun, isAir, isCrouch);

  // Braço de trás
  drawArm(ctx, hero, runCycle, false, isRun, isAir, isCrouch, castProgress);

  // Tronco (mais longo e estreito)
  ctx.save();
  ctx.rotate(lean);
  drawTorso(ctx, hero, t, isAir, isCrouch, castProgress);
  ctx.restore();

  // Perna da frente
  drawLeg(ctx, runCycle, true, isRun, isAir, isCrouch);

  // Braço da frente
  drawArm(
    ctx,
    hero,
    runCycle + Math.PI,
    true,
    isRun,
    isAir,
    isCrouch,
    castProgress,
  );

  // Cabeça (proporcionalmente menor que no anterior)
  drawHead(ctx, hero.state, t, isRun, isAir, isCrouch, lean, castProgress);

  drawFrontCape(ctx, runCycle, isRun, isAir, isCrouch, isCast, castProgress);

  ctx.restore();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  state: HeroState,
  t: number,
  isRun: boolean,
  isAir: boolean,
  isCrouch: boolean,
  lean: number,
  castProgress: number,
): void {
  ctx.save();
  const isCast = state === 'cast';

  // Posição da cabeça muito mais alta para proporção humana
  const headX = isRun ? 4 : 2;
  const headY = -38 + (isAir ? -1 : 0) + (isCrouch ? 6 : 0);
  const faceTilt = isCast ? Math.sin(castProgress * Math.PI) * -0.1 : 0;

  ctx.translate(headX, headY);
  ctx.rotate(lean * 0.2 + faceTilt);

  drawNeck(ctx, isCast, castProgress);

  // Formato de rosto mais oval/adulto
  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-3.5, -5.5);
  ctx.lineTo(-1.5, -7.5);
  ctx.lineTo(1.5, -7.5);
  ctx.lineTo(4.0, -5.0);
  ctx.lineTo(4.5, 0);
  ctx.lineTo(3.5, 4.5);
  ctx.lineTo(0, 7.5); // Queixo mais fino
  ctx.lineTo(-3.0, 4.5);
  ctx.lineTo(-4.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cabelo curto conforme solicitado anteriormente, mas adaptado à cabeça menor
  ctx.fillStyle = COLORS.hair;
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.lineTo(-4.5, -8.5);
  ctx.lineTo(-1, -10.5);
  ctx.lineTo(3, -9.5);
  ctx.lineTo(5, -5);
  ctx.lineTo(4, -3.5);
  ctx.lineTo(2, -4.5);
  ctx.lineTo(0, -3.5);
  ctx.lineTo(-2.5, -4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Olhos menores e mais sérios
  ctx.fillStyle = isCast ? COLORS.eyeGlow : COLORS.eye;
  ctx.fillRect(1.0, -1, 2.5, 1.2);
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(1.0, -1.5, 2.8, 0.6); // Sobrancelha

  drawScarfCollar(ctx, isCast, castProgress);
  ctx.restore();
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  t: number,
  isAir: boolean,
  isCrouch: boolean,
  castProgress: number,
): void {
  ctx.save();
  const isCast = hero.state === 'cast';
  const torsoShiftY = isCrouch ? 6 : 0;

  ctx.translate(0, torsoShiftY);

  // Base da Túnica (Mais longa e definida)
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.2;
  ctx.fillStyle = COLORS.tunic;
  ctx.beginPath();
  ctx.moveTo(-7, -32); // Ombro
  ctx.lineTo(7, -32); // Ombro
  ctx.lineTo(6, 2); // Cintura
  ctx.lineTo(-6, 2); // Cintura
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Colete/Armadura de peito
  ctx.fillStyle = COLORS.vest;
  ctx.beginPath();
  ctx.moveTo(-7.5, -31);
  ctx.lineTo(-3, -30);
  ctx.lineTo(-3.5, -5);
  ctx.lineTo(-7, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(7.5, -31);
  ctx.lineTo(3, -30);
  ctx.lineTo(3.5, -5);
  ctx.lineTo(7, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawChestCore(ctx, isCast, castProgress);
  drawBelt(ctx);
  ctx.restore();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  isFront: boolean,
  isRun: boolean,
  isAir: boolean,
  isCrouch: boolean,
): void {
  ctx.save();
  const hipY = isCrouch ? 8 : 2;
  ctx.translate(isFront ? 3 : -3, hipY);

  let hipRot = 0;
  let kneeRot = 0;

  if (isRun) {
    hipRot = Math.sin(cycle) * 0.6;
    kneeRot = Math.max(0, -Math.cos(cycle)) * 1.1;
  } else if (isAir) {
    hipRot = isFront ? -0.4 : 0.5;
    kneeRot = 0.4;
  } else if (isCrouch) {
    hipRot = isFront ? 1.2 : -0.2;
    kneeRot = isFront ? -1.4 : -1.1;
  }

  ctx.rotate(hipRot);

  // Coxa (Mais longa)
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.2;
  ctx.fillStyle = isFront ? COLORS.pantsLight : COLORS.pants;
  ctx.beginPath();
  ctx.moveTo(-2.5, 0);
  ctx.lineTo(2.5, 0);
  ctx.lineTo(2, 16); // Comprimento aumentado
  ctx.lineTo(-2, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Canela e Bota
  ctx.translate(0, 16);
  ctx.rotate(kneeRot);

  ctx.fillStyle = isFront ? COLORS.pants : COLORS.pantsShadow;
  ctx.fillRect(-2, 0, 4, 14);
  ctx.strokeRect(-2, 0, 4, 14);

  // Bota com detalhe de pé humano
  ctx.fillStyle = COLORS.boots;
  ctx.beginPath();
  ctx.moveTo(-2.5, 12);
  ctx.lineTo(5, 12); // Pé apontando para frente
  ctx.lineTo(5, 16);
  ctx.lineTo(-2.5, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  cycle: number,
  isFront: boolean,
  isRun: boolean,
  isAir: boolean,
  isCrouch: boolean,
  castProgress: number,
): void {
  ctx.save();
  const shoulderY = isCrouch ? -22 : -28;
  const shoulderX = isFront ? 7 : -7;
  ctx.translate(shoulderX, shoulderY);

  let armRot = 0;
  let elbowRot = 0;

  if (isRun) {
    armRot = Math.sin(cycle) * 0.7;
    elbowRot = -0.9;
  } else if (hero.state === 'cast') {
    armRot = isFront ? -1.4 : 0.2;
    elbowRot = isFront ? 0.4 : 0.2;
  } else {
    armRot = 0.1;
    elbowRot = 0.2;
  }

  ctx.rotate(armRot);

  // Braço superior
  ctx.fillStyle = isFront ? COLORS.tunic : COLORS.tunicShadow;
  ctx.strokeStyle = COLORS.outline;
  ctx.beginPath();
  ctx.moveTo(-1.8, 0);
  ctx.lineTo(1.8, 0);
  ctx.lineTo(1.5, 14);
  ctx.lineTo(-1.5, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Antebraço e Mão
  ctx.translate(0, 14);
  ctx.rotate(elbowRot);
  ctx.fillStyle = isFront ? COLORS.gloveLight : COLORS.glove;
  ctx.fillRect(-1.8, 0, 3.6, 12);
  ctx.strokeRect(-1.8, 0, 3.6, 12);

  ctx.restore();
}

// Reutilização otimizada das funções de detalhe (ajustadas para escala)
function drawNeck(
  ctx: CanvasRenderingContext2D,
  isCast: boolean,
  castProgress: number,
): void {
  ctx.fillStyle = COLORS.skinShadow;
  ctx.fillRect(-1.2, 5, 2.4, 4);
}

function drawChestCore(
  ctx: CanvasRenderingContext2D,
  isCast: boolean,
  castProgress: number,
): void {
  const pulse = isCast ? 1 + Math.sin(castProgress * Math.PI) * 0.3 : 0.9;
  ctx.fillStyle = COLORS.crack;
  ctx.beginPath();
  ctx.arc(0, -20, 3.5, 0, Math.PI * 2);
  ctx.fill();

  const glow = ctx.createRadialGradient(0, -20, 1, 0, -20, 8 * pulse);
  glow.addColorStop(0, 'rgba(255, 242, 190, 0.8)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fill();
}

function drawBelt(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.belt;
  ctx.fillRect(-6.5, 0, 13, 3);
  ctx.fillStyle = COLORS.buckle;
  ctx.fillRect(-1, -0.5, 2, 4);
}

function drawScarfCollar(
  ctx: CanvasRenderingContext2D,
  isCast: boolean,
  castProgress: number,
): void {
  ctx.fillStyle = COLORS.scarf;
  ctx.beginPath();
  ctx.moveTo(-4, 5);
  ctx.lineTo(4, 5);
  ctx.lineTo(3, 8);
  ctx.lineTo(-3, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBackCape(
  ctx: CanvasRenderingContext2D,
  t: number,
  cycle: number,
  isRun: boolean,
  isAir: boolean,
  isCrouch: boolean,
  isCast: boolean,
  castProgress: number,
): void {
  ctx.save();
  const sway = isRun ? Math.sin(cycle) * 6 : isAir ? -10 : Math.sin(t * 3) * 2;
  ctx.translate(-4, isCrouch ? -15 : -28);
  ctx.rotate((sway * Math.PI) / 180);
  ctx.fillStyle = COLORS.capeShadow;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-12, 10);
  ctx.lineTo(-10, 45); // Capa longa
  ctx.lineTo(0, 38);
  ctx.lineTo(10, 45);
  ctx.lineTo(8, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFrontCape(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  isRun: boolean,
  isAir: boolean,
  isCrouch: boolean,
  isCast: boolean,
  castProgress: number,
): void {
  // Versão humanoide geralmente usa menos a capa frontal para não poluir o sprite, mas mantemos o gancho
  ctx.save();
  ctx.translate(5, isCrouch ? -15 : -26);
  ctx.rotate(isRun ? Math.cos(cycle) * 0.1 : 0);
  ctx.fillStyle = COLORS.cape;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(6, 15);
  ctx.lineTo(2, 35);
  ctx.lineTo(-2, 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
