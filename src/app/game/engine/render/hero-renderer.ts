import { Hero } from '../../domain/hero/hero.model';

type PixelColor =
  | 'outline'
  | 'hoodDark'
  | 'hoodMid'
  | 'hoodLight'
  | 'hair'
  | 'skin'
  | 'skinShadow'
  | 'eye'
  | 'cloakDark'
  | 'cloakMid'
  | 'tunicDark'
  | 'tunicMid'
  | 'tunicLight'
  | 'belt'
  | 'boot'
  | 'magicBright'
  | 'magicMid';

const PALETTE: Record<PixelColor, string> = {
  outline: '#0a0c10',
  hoodDark: '#18202c',
  hoodMid: '#2d3749',
  hoodLight: '#4d607d',
  hair: '#1b1211',
  skin: '#d8b895',
  skinShadow: '#9d7a61',
  eye: '#f3fbff',
  cloakDark: '#2f0d15',
  cloakMid: '#5f1b2a',
  tunicDark: '#1b2431',
  tunicMid: '#31425c',
  tunicLight: '#667ea6',
  belt: '#725736',
  boot: '#141920',
  magicBright: '#ffe1b6',
  magicMid: '#ff9d63',
};

interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: PixelColor;
}

interface HeroPose {
  bobY: number;
  frontLegX: number;
  backLegX: number;
  frontLegY: number;
  backLegY: number;
  frontArmY: number;
  backArmY: number;
  frontArmX: number;
  castMode: boolean;
  hurtShake: number;
}

const PIXEL = 3;
const SPRITE_WIDTH = 18;
const SPRITE_HEIGHT = 24;

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

  const pose = getPose(hero);

  const centerX = hero.x + hero.width / 2 + pose.hurtShake;
  const centerY = hero.y + hero.height / 2 + pose.bobY;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(centerX, centerY);

  /**
   * Sprite-base olhando para a DIREITA.
   */
  ctx.scale(hero.direction, 1);

  const baseX = -Math.floor((SPRITE_WIDTH * PIXEL) / 2);
  const baseY = -Math.floor((SPRITE_HEIGHT * PIXEL) / 2);

  const parts = buildHeroParts(pose);

  for (const part of parts) {
    ctx.fillStyle = PALETTE[part.color];
    ctx.fillRect(
      baseX + part.x * PIXEL,
      baseY + part.y * PIXEL,
      part.w * PIXEL,
      part.h * PIXEL,
    );
  }

  if (pose.castMode) {
    drawMagicOrb(ctx, baseX, baseY);
  }

  ctx.restore();
}

function getPose(hero: Hero): HeroPose {
  const t = hero.animationTime;
  const run = Math.sin(t * 10);
  const runOpposite = Math.sin(t * 10 + Math.PI);
  const idleBob = Math.sin(t * 2.2) * 1.1;

  const pose: HeroPose = {
    bobY: 0,
    frontLegX: 0,
    backLegX: 0,
    frontLegY: 0,
    backLegY: 0,
    frontArmY: 0,
    backArmY: 0,
    frontArmX: 0,
    castMode: false,
    hurtShake: 0,
  };

  switch (hero.state) {
    case 'idle':
      pose.bobY = idleBob;
      break;

    case 'run':
      /**
       * Corrida menos “quebrada”.
       * O torso quase não mexe; a leitura vem de pernas e braços.
       */
      pose.bobY = Math.abs(run) * 1.0;
      pose.frontLegX = Math.round(run * 1.3);
      pose.backLegX = Math.round(runOpposite * 1.3);
      pose.frontLegY = Math.round(Math.abs(runOpposite) * 1);
      pose.backLegY = Math.round(Math.abs(run) * 1);
      pose.frontArmY = Math.round(Math.abs(run) * 1);
      pose.backArmY = Math.round(Math.abs(runOpposite) * 1);
      break;

    case 'jump':
      pose.bobY = -2;
      pose.frontLegY = -1;
      pose.backLegY = -1;
      pose.frontArmY = -1;
      pose.backArmY = -1;
      break;

    case 'fall':
      pose.bobY = 1;
      pose.frontLegY = 1;
      pose.backLegY = 2;
      pose.frontArmY = 1;
      pose.backArmY = 0;
      break;

    case 'cast':
      pose.castMode = true;
      pose.frontArmX = 1;
      pose.frontArmY = -2;
      pose.backArmY = 1;
      break;

    case 'hurt':
      pose.hurtShake = Math.round(Math.sin(t * 34) * 1.5);
      pose.frontArmY = 1;
      pose.backArmY = -1;
      pose.frontLegY = 1;
      pose.backLegY = 0;
      break;
  }

  return pose;
}

function buildHeroParts(pose: HeroPose): PixelRect[] {
  const torsoY = 9;
  const legsY = 18;

  const backArmX = 4;
  const frontArmX = pose.castMode ? 13 : 12;

  return [
    /**
     * CAPA ATRÁS
     */
    { x: 2, y: 9, w: 1, h: 8, color: 'cloakDark' },
    { x: 3, y: 10, w: 1, h: 8, color: 'cloakMid' },
    { x: 4, y: 15, w: 1, h: 4, color: 'cloakDark' },

    /**
     * CABEÇA
     * Menos “capacete”, mais rosto/cabelo.
     */
    { x: 6, y: 0, w: 5, h: 1, color: 'outline' },
    { x: 5, y: 1, w: 7, h: 1, color: 'outline' },

    { x: 4, y: 2, w: 8, h: 1, color: 'hoodDark' },
    { x: 5, y: 3, w: 7, h: 1, color: 'hoodMid' },
    { x: 6, y: 2, w: 3, h: 1, color: 'hoodLight' },

    // parte de trás da cabeça/capuz
    { x: 4, y: 3, w: 1, h: 4, color: 'hoodDark' },
    { x: 5, y: 4, w: 1, h: 3, color: 'hoodMid' },

    // cabelo aparecendo
    { x: 8, y: 4, w: 1, h: 1, color: 'hair' },
    { x: 8, y: 5, w: 1, h: 1, color: 'hair' },

    // rosto mais aberto
    { x: 9, y: 4, w: 2, h: 3, color: 'skin' },
    { x: 11, y: 4, w: 1, h: 3, color: 'skinShadow' },
    { x: 10, y: 4, w: 1, h: 1, color: 'eye' },

    // ponta frontal do capuz
    { x: 12, y: 3, w: 1, h: 4, color: 'outline' },

    /**
     * GOLA
     */
    { x: 6, y: 7, w: 5, h: 1, color: 'cloakMid' },
    { x: 5, y: 8, w: 7, h: 1, color: 'cloakDark' },

    /**
     * TORSO / TÚNICA
     * Mais cara de herói do que armadura pesada.
     */
    { x: 6, y: torsoY, w: 5, h: 1, color: 'tunicDark' },
    { x: 5, y: torsoY + 1, w: 7, h: 4, color: 'tunicMid' },
    { x: 7, y: torsoY + 1, w: 2, h: 3, color: 'tunicLight' },
    { x: 5, y: torsoY + 5, w: 7, h: 1, color: 'tunicDark' },

    // frente do peito mais clara para reforçar direção
    { x: 10, y: torsoY + 1, w: 1, h: 3, color: 'tunicLight' },

    /**
     * Cinto
     */
    { x: 6, y: torsoY + 6, w: 5, h: 1, color: 'belt' },

    /**
     * BRAÇO DE TRÁS
     */
    { x: backArmX, y: torsoY + 1 + pose.backArmY, w: 1, h: 4, color: 'tunicDark' },
    { x: backArmX, y: torsoY + 5 + pose.backArmY, w: 1, h: 1, color: 'skin' },

    /**
     * BRAÇO DA FRENTE
     */
    {
      x: frontArmX + pose.frontArmX,
      y: torsoY + 1 + pose.frontArmY,
      w: 1,
      h: 4,
      color: pose.castMode ? 'magicMid' : 'tunicLight',
    },
    {
      x: frontArmX + pose.frontArmX,
      y: torsoY + 5 + pose.frontArmY,
      w: 1,
      h: 1,
      color: 'skin',
    },

    /**
     * PERNAS
     */
    {
      x: 7 + pose.backLegX,
      y: legsY + pose.backLegY,
      w: 1,
      h: 4,
      color: 'tunicDark',
    },
    {
      x: 7 + pose.backLegX,
      y: legsY + 4 + pose.backLegY,
      w: 2,
      h: 1,
      color: 'boot',
    },

    {
      x: 10 + pose.frontLegX,
      y: legsY + pose.frontLegY,
      w: 1,
      h: 4,
      color: 'tunicLight',
    },
    {
      x: 10 + pose.frontLegX,
      y: legsY + 4 + pose.frontLegY,
      w: 2,
      h: 1,
      color: 'boot',
    },

    /**
     * CONTORNOS
     */
    { x: 5, y: 4, w: 1, h: 3, color: 'outline' },
    { x: 5, y: 10, w: 1, h: 4, color: 'outline' },
  ];
}

function drawMagicOrb(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
): void {
  const p = PIXEL;
  const orbX = baseX + 14 * p;
  const orbY = baseY + 8 * p;

  ctx.fillStyle = 'rgba(255, 190, 110, 0.10)';
  ctx.fillRect(orbX - p, orbY - p, 5 * p, 5 * p);

  ctx.fillStyle = PALETTE.magicMid;
  ctx.fillRect(orbX, orbY, p, p);
  ctx.fillRect(orbX + p, orbY, p, p);
  ctx.fillRect(orbX, orbY + p, p, p);
  ctx.fillRect(orbX + p, orbY + p, p, p);

  ctx.fillStyle = PALETTE.magicBright;
  ctx.fillRect(orbX + p, orbY - p, p, p);
  ctx.fillRect(orbX + 2 * p, orbY, p, p);
  ctx.fillRect(orbX + p, orbY + 2 * p, p, p);
}
