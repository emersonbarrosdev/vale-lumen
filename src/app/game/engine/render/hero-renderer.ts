import { Hero, HeroState } from '../../domain/hero/hero.model';

const COLORS = {
  outline: '#05070b',
  shadow: '#0b1018',
  skin: '#d7b08e',
  skinShadow: '#b58767',

  // Cores do Cabelo (Cinzento/Azulado Determinado)
  hair: '#e1e5f0',
  hairShadow: '#949fb5',
  hairGlow: '#ffffff',

  scarf: '#6d1f2b',
  scarfShadow: '#43131c',
  coat: '#1b2433',
  coatLight: '#2a3548',
  coatShadow: '#101722',
  belt: '#5b472e',
  beltMetal: '#9ca3af',
  pants: '#141a24',
  pantsLight: '#232c39',
  boots: '#2e241d',
  bootsLight: '#4a3a2d',
  glove: '#161c26',
  eye: '#57c7ff',
  eyeGlow: '#a8ebff',
  rune: '#4fd3ff',
};

export function drawHero(ctx: CanvasRenderingContext2D, hero: Hero): void {
  if (hero.invulnerabilityTimer > 0 && Math.floor(hero.invulnerabilityTimer * 20) % 2 === 0) return;

  const t = hero.animationTime;
  const isRun = hero.state === 'run';
  const isAir = hero.state === 'jump' || hero.state === 'fall';

  const speed = 14;
  const cycle = isRun ? t * speed : 0;

  const bob = isRun ? Math.sin(cycle * 2) * 2 : Math.sin(t * 3) * 0.5;
  const lean = isRun ? 0.22 : 0;

  ctx.save();
  ctx.translate(hero.x + hero.width / 2, hero.y + hero.height / 2 + bob);
  ctx.scale(hero.direction * 1.3, 1.3);

  // 1. Capa Traseira
  drawBackCape(ctx, cycle, isRun, isAir);

  // 2. Membros de TRÁS
  drawPixelLeg(ctx, cycle + Math.PI, false, isRun, isAir);
  drawArmArticulated(ctx, cycle, false, isRun, isAir);

  // 3. CORPO
  ctx.save();
  ctx.rotate(lean);
  drawPixelTorso(ctx, t, isAir);
  ctx.restore();

  // 4. Membros da FRENTE
  drawPixelLeg(ctx, cycle, true, isRun, isAir);
  drawArmArticulated(ctx, cycle + Math.PI, true, isRun, isAir);

  // 5. CABEÇA (CORRIGIDA: Rosto determinado em perfil total)
  drawPixelHeadCorrected(ctx, isRun, isAir, lean);

  // 6. Cachecol frontal
  drawFrontScarfTail(ctx, cycle, isRun, isAir);

  ctx.restore();
}

/**
 * DESENHO DA CABEÇA EM PERFIL TOTAL (PLATAFORMA 2D)
 */
function drawPixelHeadCorrected(ctx: CanvasRenderingContext2D, isRun: boolean, isAir: boolean, lean: number): void {
  ctx.save();
  const neckX = (isRun ? 5 : 1);
  const neckY = -24 + (isAir ? -1 : 0);
  ctx.translate(neckX, neckY);

  // Cabelo Traseiro
  ctx.fillStyle = COLORS.hairShadow;
  ctx.beginPath();
  ctx.moveTo(-9, -8);
  ctx.lineTo(-13, -18); ctx.lineTo(-7, -23);
  ctx.lineTo(-3, -27); ctx.lineTo(3, -25);
  ctx.lineTo(8, -21); ctx.lineTo(10, -12);
  ctx.lineTo(7, -6);
  ctx.closePath();
  ctx.fill();

  // --- ROSTO DETERMINADO EM PERFIL TOTAL (CORRIGIDO) ---
  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6, -5); ctx.lineTo(5, -5); ctx.lineTo(7, -1); ctx.lineTo(6, 4);
  ctx.lineTo(3, 7); ctx.lineTo(-2, 8); ctx.lineTo(-6, 5); ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Olho determinado nítido focado na frente
  ctx.fillStyle = COLORS.shadow; ctx.fillRect(-6, -2, 11, 4);
  ctx.fillStyle = COLORS.eye; ctx.fillRect(1, -1, 3, 2);
  ctx.fillStyle = COLORS.eyeGlow; ctx.fillRect(3, -1, 1, 1);

  // Cabelo Frontal
  ctx.fillStyle = COLORS.hair;
  ctx.strokeStyle = COLORS.outline;
  ctx.beginPath();
  ctx.moveTo(-11, -6);
  ctx.bezierCurveTo(-16, -20, -10, -18, -4, -28);
  ctx.bezierCurveTo(-2, -22, 1, -22, 5, -30);
  ctx.bezierCurveTo(9, -20, 15, -23, 13, -8);
  ctx.bezierCurveTo(10, -12, 5, -12, 3, -6);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Brilho
  ctx.fillStyle = COLORS.hairGlow;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-3, -23); ctx.lineTo(2, -25); ctx.lineTo(0, -18);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  // Cachecol
  ctx.fillStyle = COLORS.scarf;
  ctx.strokeStyle = COLORS.outline;
  ctx.fillRect(-6, 7, 12, 3);
  ctx.strokeRect(-6, 7, 12, 3);

  ctx.restore();
}

// MANTIDAS TODAS AS SUAS FUNÇÕES ORIGINAIS DE LOGICA ABAIXO, SEM ALTERAÇÕES:

function drawArmArticulated(ctx: CanvasRenderingContext2D, cycle: number, isFront: boolean, isRun: boolean, isAir: boolean): void {
  ctx.save();
  ctx.translate(isFront ? 6 : -6, -15);
  const armRot = isRun ? Math.sin(cycle) * 0.7 : (isAir ? -0.5 : 0);
  ctx.rotate(armRot);
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.2;
  ctx.fillStyle = isFront ? COLORS.coatLight : COLORS.coatShadow;
  ctx.fillRect(-2.5, 0, 5, 8);
  ctx.strokeRect(-2.5, 0, 5, 8);
  ctx.translate(0, 7);
  const elbowRot = isRun ? -1.1 : (isAir ? 0.4 : 0.2);
  ctx.rotate(elbowRot);
  ctx.fillStyle = COLORS.coat;
  ctx.fillRect(-2, 0, 4, 8);
  ctx.strokeRect(-2, 0, 4, 8);
  ctx.fillStyle = COLORS.glove;
  ctx.fillRect(-2.5, 6, 5, 4);
  ctx.strokeRect(-2.5, 6, 5, 4);
  ctx.restore();
}

function drawPixelLeg(ctx: CanvasRenderingContext2D, cycle: number, isFront: boolean, isRun: boolean, isAir: boolean): void {
  ctx.save();
  ctx.translate(isFront ? 3 : -3, 4);
  const hipRot = isRun ? Math.sin(cycle) * 0.65 : (isAir ? (isFront ? -0.5 : 0.5) : 0);
  const kneeRot = isRun ? Math.max(0, -Math.cos(cycle - 0.2)) * 1.3 : (isAir ? 0.4 : 0);
  ctx.rotate(hipRot);
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = isFront ? COLORS.pantsLight : COLORS.pants;
  ctx.fillRect(-3.5, 0, 7, 10);
  ctx.strokeRect(-3.5, 0, 7, 10);
  ctx.translate(0, 9);
  ctx.rotate(kneeRot);
  ctx.fillStyle = isFront ? COLORS.pants : COLORS.coatShadow;
  ctx.fillRect(-3, 0, 6, 10);
  ctx.strokeRect(-3, 0, 6, 10);
  ctx.fillStyle = COLORS.boots;
  ctx.fillRect(-3.5, 9, 9, 5);
  ctx.strokeRect(-3.5, 9, 9, 5);
  ctx.restore();
}

function drawPixelTorso(ctx: CanvasRenderingContext2D, t: number, isAir: boolean): void {
  ctx.save();
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.fillStyle = COLORS.coat;
  ctx.beginPath();
  ctx.moveTo(-10, -18); ctx.lineTo(10, -18); ctx.lineTo(8, 4); ctx.lineTo(-8, 4);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = COLORS.coatLight;
  ctx.fillRect(-6, -17, 3, 10); ctx.fillRect(3, -17, 3, 10);
  ctx.fillStyle = COLORS.rune; ctx.globalAlpha = 0.8; ctx.fillRect(-1, -10, 3, 3); ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.belt;
  ctx.fillRect(-9, 1, 18, 4); ctx.strokeRect(-9, 1, 18, 4);
  ctx.fillStyle = COLORS.beltMetal; ctx.fillRect(-1, 1, 4, 4);
  ctx.restore();
}

function drawBackCape(ctx: CanvasRenderingContext2D, cycle: number, isRun: boolean, isAir: boolean): void {
  ctx.save();
  const sway = isRun ? Math.sin(cycle) * 5 : (isAir ? -8 : 0);
  ctx.translate(-3, -10);
  ctx.rotate(sway * Math.PI / 180);
  ctx.fillStyle = COLORS.shadow;
  ctx.strokeStyle = COLORS.outline;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-10, 10); ctx.lineTo(-7, 22); ctx.lineTo(0, 16);
  ctx.lineTo(7, 22); ctx.lineTo(10, 8); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawFrontScarfTail(ctx: CanvasRenderingContext2D, cycle: number, isRun: boolean, isAir: boolean): void {
  ctx.save();
  const sway = isRun ? Math.cos(cycle) * 3 : 0;
  ctx.translate(4, -10);
  ctx.rotate(sway * Math.PI / 180);
  ctx.fillStyle = COLORS.scarf;
  ctx.strokeStyle = COLORS.outline;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(6, 4); ctx.lineTo(4, 14); ctx.lineTo(0, 10);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
