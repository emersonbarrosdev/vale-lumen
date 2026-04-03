import { Hero, HeroState } from '../../domain/hero/hero.model';

// --- PALETA DE CORES E MATERIAIS ---
// Altere os códigos hexadecimais (#000000) para mudar as cores de cada parte.
const COLORS = {
  outline: '#0d1015',      // Cor da linha de contorno (borda) de todo o personagem
  deepShadow: '#11161d',   // Sombra mais escura para profundidade
  shadow: '#1b222c',       // Sombra padrão

  skin: '#d7cbbf',         // Cor principal da pele (rosto e pescoço)
  skinLight: '#f1e6da',    // Cor da pele sob luz
  skinShadow: '#a99b90',   // Sombra da pele (usada no pescoço)

  crack: '#e8c97a',        // Cor do "Core" (joia) no peito e rachaduras
  crackGlow: '#fff2be',    // Cor do brilho intenso da joia

  hair: '#241f26',         // Cor principal do cabelo
  hairLight: '#463b48',    // Brilho do cabelo
  hairGlow: '#b9874d',     // Reflexo de luz mágica no cabelo
  hairShadow: '#151118',   // Sombra do cabelo

  scarf: '#7d3438',        // Cor da gola/cachecol
  scarfLight: '#a64a51',   // Luz na gola
  scarfShadow: '#592329',  // Sombra na gola

  shirt: '#d8d0c3',        // Cor da camisa que aparece por baixo da jaqueta
  shirtLight: '#eee6d8',
  shirtShadow: '#b8ae9f',

  jacket: '#3f4752',       // Cor principal da Jaqueta de Couro
  jacketLight: '#56616d',  // Brilho/Luz no couro da jaqueta
  jacketShadow: '#2b3139', // Sombra e dobras da jaqueta

  belt: '#6d5338',         // Cor do couro do cinto
  beltLight: '#94704b',
  buckle: '#b8c0c8',       // Cor da fivela metálica do cinto
  pouch: '#59452f',        // Cor das bolsas/algibeiras

  pants: '#314457',        // Cor das calças
  pantsLight: '#49627a',
  pantsShadow: '#233241',

  boots: '#4d3a2d',        // Cor das botas
  bootsLight: '#6d5240',
  bootsShadow: '#30241c',

  glove: '#594534',        // Cor das luvas/mãos (parte principal)
  gloveLight: '#765b43',   // Cor das luvas/mãos (parte clara/dedos)

  eye: '#dcb16b',          // Cor da íris do olho
  eyeGlow: '#fff0c6',      // Cor do olho brilhando (quando usa magia)

  ember: '#f1c775',        // Cor de partículas ou brasas
  emberLight: '#fff0bf',
};

export function drawHero(ctx: CanvasRenderingContext2D, hero: Hero): void {
  // --- LÓGICA DE INVULNERABILIDADE ---
  // Faz o herói piscar se estiver invulnerável (timer > 0)
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

  // --- AJUSTE DE MOVIMENTO VERTICAL (BOBBING) ---
  // Altere os valores multiplicadores (1.2 ou 0.4) para o herói pular mais ou menos enquanto corre/parado
  const bob = isRun
    ? Math.sin(runCycle * 2) * 1.2
    : isCrouch
      ? 0
      : Math.sin(t * 2.5) * 0.4;

  // --- AJUSTE DE INCLINAÇÃO DO CORPO ---
  // Altere o 0.12 para ele correr mais "curvado" para frente
  const lean = isRun
    ? 0.12 + Math.sin(runCycle) * 0.02
    : isCast
      ? 0.05
      : isHurt
        ? -0.15
        : 0;

  const crouchOffsetY = isCrouch ? 12 : 0;

  ctx.save();
  // Centraliza o desenho. Ajuste o + bob para mexer na altura geral.
  ctx.translate(
    hero.x + hero.width / 2,
    hero.y + hero.height / 2 + bob + crouchOffsetY,
  );

  // --- ESCALA GERAL DO PERSONAGEM ---
  // Altere o 1.1 para aumentar ou diminuir o herói inteiro
  ctx.scale(hero.direction * 1.1, 1.1);

  // Perna de trás (fica atrás de tudo)
  drawLeg(ctx, runCycle + Math.PI, false, isRun, isAir, isCrouch);

  // Braço traseiro (Desenha atrás do tronco no estado parado para pose imponente)
  if (hero.state === 'idle') {
    drawArm(ctx, hero, runCycle, false, isRun, isAir, isCrouch, castProgress);
  }

  // --- TRONCO (CAMISA E JAQUETA) ---
  ctx.save();
  ctx.rotate(lean);
  drawTorso(ctx, hero, t, isAir, isCrouch, castProgress);
  ctx.restore();

  // Perna da frente (fica na frente do tronco)
  drawLeg(ctx, runCycle, true, isRun, isAir, isCrouch);

  // Braço traseiro (Desenha na frente do tronco se estiver em MOVIMENTO para parecer natural)
  if (hero.state !== 'idle') {
    drawArm(ctx, hero, runCycle, false, isRun, isAir, isCrouch, castProgress);
  }

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

  // Cabeça (desenhada por último para ficar sobre a gola)
  drawHead(ctx, hero.state, t, isRun, isAir, isCrouch, lean, castProgress);

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

  // --- POSIÇÃO DA CABEÇA ---
  // headY (-38) controla a altura do pescoço. Valores mais negativos = pescoço mais longo.
  const headX = isRun ? 4 : 2;
  const headY = -38 + (isAir ? -1 : 0) + (isCrouch ? 6 : 0);
  const faceTilt = isCast ? Math.sin(castProgress * Math.PI) * -0.1 : 0;

  ctx.translate(headX, headY);
  ctx.rotate(lean * 0.2 + faceTilt);

  drawNeck(ctx, isCast, castProgress);

  // --- FORMATO DO ROSTO ---
  // Altere os pontos do moveTo/lineTo para mudar o queixo ou largura da face
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
  ctx.lineTo(0, 7.5); // Ponta do queixo (0, 7.5). Aumente o 7.5 para queixo mais "V" ou comprido.
  ctx.lineTo(-3.0, 4.5);
  ctx.lineTo(-4.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- CABELO ---
  // Altere esses pontos para criar topetes, cabelos longos ou franjas
  ctx.fillStyle = COLORS.hair;
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.lineTo(-4.5, -8.5); // Altura do topo do cabelo. Aumente negativo (-12) para cabelo "alto".
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

  // --- OLHOS ---
  // Rect(X, Y, largura, altura). Altere (1.0, -1) para mudar a posição dos olhos no rosto.
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

  // --- CAMISA (BASE DO TRONCO) ---
  // Ombro: Y=-32. Cintura: Y=2.
  // Aumente o -32 para o tronco (peito) ficar mais alto/longo.
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.2;
  ctx.fillStyle = COLORS.shirt;
  ctx.beginPath();
  ctx.moveTo(-7, -32);
  ctx.lineTo(7, -32);
  ctx.lineTo(6, 2);
  ctx.lineTo(-6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- JAQUETA (LATERAIS) ---
  // Altere o ponto central (-2 ou 2) para deixar a jaqueta mais aberta ou fechada no peito
  ctx.fillStyle = COLORS.jacket;

  // Lado esquerdo da jaqueta
  ctx.beginPath();
  ctx.moveTo(-7.5, -31);
  ctx.lineTo(-2, -30); // Ponto de abertura da jaqueta
  ctx.lineTo(-2.5, -5);
  ctx.lineTo(-7, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lado direito da jaqueta
  ctx.beginPath();
  ctx.moveTo(7.5, -31);
  ctx.lineTo(2, -30); // Ponto de abertura da jaqueta
  ctx.lineTo(2.5, -5);
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

  // --- LÓGICA DE ROTAÇÃO DAS PERNAS ---
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

  // --- COXA ---
  // Altere o 16 (Y) para deixar as pernas (parte superior) mais longas ou curtas
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.2;
  ctx.fillStyle = isFront ? COLORS.pantsLight : COLORS.pants;
  ctx.beginPath();
  ctx.moveTo(-2.5, 0);
  ctx.lineTo(2.5, 0);
  ctx.lineTo(2, 16);
  ctx.lineTo(-2, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- CANELA ---
  ctx.translate(0, 16); // Deve bater com o valor da coxa acima para não "descolar" o joelho
  ctx.rotate(kneeRot);

  ctx.fillStyle = isFront ? COLORS.pants : COLORS.pantsShadow;
  ctx.fillRect(-2, 0, 4, 14); // 14 é a altura da canela. Aumente para pernas mais longas.
  ctx.strokeRect(-2, 0, 4, 14);

  // --- PÉ / BOTA ---
  // Pé: (-2.5 a 5). Aumente o 5 para o bico da bota ficar mais comprido.
  ctx.fillStyle = COLORS.boots;
  ctx.beginPath();
  ctx.moveTo(-2.5, 12);
  ctx.lineTo(5, 12);
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
  // shoulderY controla onde o braço se conecta ao tronco
  const shoulderY = isCrouch ? -22 : -28;
  const shoulderX = isFront ? 7 : -7;
  ctx.translate(shoulderX, shoulderY);

  // --- LÓGICA DE ROTAÇÃO DOS BRAÇOS ---
  let armRot = 0;
  let elbowRot = 0;

  if (isRun) {
    armRot = Math.sin(cycle) * 0.7;
    elbowRot = -0.9;
  } else if (hero.state === 'cast') {
    armRot = isFront ? -1.4 : 0.2;
    elbowRot = isFront ? 0.4 : 0.2;
  } else if (hero.state === 'idle') {
    // Pose imponente: Braços ligeiramente recuados (negativo)
    armRot = isFront ? -0.1 : -0.2;
    elbowRot = -0.1;
  } else {
    armRot = 0.1;
    elbowRot = 0.2;
  }

  ctx.rotate(armRot);

  // --- BRAÇO SUPERIOR (BÍCEPS) ---
  // Altere o 14 para braços mais longos ou 1.8 para braços mais "fortes"/largos
  ctx.fillStyle = isFront ? COLORS.jacketLight : COLORS.jacket;
  ctx.strokeStyle = COLORS.outline;
  ctx.beginPath();
  ctx.moveTo(-1.8, 0);
  ctx.lineTo(1.8, 0);
  ctx.lineTo(1.5, 14);
  ctx.lineTo(-1.5, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- ANTEBRAÇO (MANGA DA JAQUETA) ---
  ctx.translate(0, 14); // Posição do cotovelo
  ctx.rotate(elbowRot);
  ctx.fillStyle = isFront ? COLORS.jacketLight : COLORS.jacket;
  ctx.fillRect(-1.8, 0, 3.6, 10); // 10 é o comprimento da manga
  ctx.strokeRect(-1.8, 0, 3.6, 10);

  // --- MÃO / LUVA ---
  // Rect(-2, 10, largura, altura). Aumente o 5 para mãos maiores.
  ctx.fillStyle = isFront ? COLORS.gloveLight : COLORS.glove;
  ctx.beginPath();
  ctx.roundRect(-2, 10, 4, 5, 1); // 1 é o arredondamento dos cantos
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawNeck(
  ctx: CanvasRenderingContext2D,
  isCast: boolean,
  castProgress: number,
): void {
  // Ajuste o 2.4 (largura) e 4 (altura) para pescoço mais robusto ou fino
  ctx.fillStyle = COLORS.skinShadow;
  ctx.fillRect(-1.2, 5, 2.4, 4);
}

function drawChestCore(
  ctx: CanvasRenderingContext2D,
  isCast: boolean,
  castProgress: number,
): void {
  // Ajuste o -20 para subir ou descer a "joia" no peito. 3.5 é o tamanho do raio do círculo.
  const pulse = isCast ? 1 + Math.sin(castProgress * Math.PI) * 0.3 : 0.9;
  ctx.fillStyle = COLORS.crack;
  ctx.beginPath();
  ctx.arc(0, -20, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Brilho radial (Glow effect)
  const glow = ctx.createRadialGradient(0, -20, 1, 0, -20, 8 * pulse);
  glow.addColorStop(0, 'rgba(255, 242, 190, 0.8)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fill();
}

function drawBelt(ctx: CanvasRenderingContext2D): void {
  // Cinto: Posicionado em Y=0. Ajuste largura (-6.5 até 13)
  ctx.fillStyle = COLORS.belt;
  ctx.fillRect(-6.5, 0, 13, 3);
  ctx.fillStyle = COLORS.buckle; // Fivela
  ctx.fillRect(-1, -0.5, 2, 4);
}

function drawScarfCollar(
  ctx: CanvasRenderingContext2D,
  isCast: boolean,
  castProgress: number,
): void {
  // Gola/Detalhe do pescoço. MoveTo(-4, 5) controla a largura da gola.
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
