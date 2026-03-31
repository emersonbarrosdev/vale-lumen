import { Hero } from '../../domain/hero/hero.model';

type PixelColor =

  | 'outline' | 'hairDark' | 'hairMid' | 'hairLight'
  | 'skin' | 'skinWarm' | 'eye' | 'shirtDark' | 'shirtMid'
  | 'shirtLight' | 'pantsDark' | 'pantsMid' | 'bootDark'
  | 'bootMid' | 'magic' | 'shadow';

// Paleta refinada com alto contraste (Inspirada em Metal Slug/KOF)
const PALETTE: Record<PixelColor, string> = {
  outline: '#08080c',
  hairDark: '#0e0e15',   // Preto Profundo
  hairMid: '#1a1d2e',    // Azul Marinho Sombrio
  hairLight: '#4d5c8a',  // Brilho Metálico no Cabelo
  skin: '#c48a60',       // Pele com tom mais "bronze" (mais contraste)
  skinWarm: '#f2ccaf',   // Luz na pele
  eye: '#ffffff',
  shirtDark: '#0f172a',
  shirtMid: '#1e293b',
  shirtLight: '#38bdf8', // Azul Celeste para contraste forte na roupa
  pantsDark: '#2c3327',
  pantsMid: '#4d5d41',
  bootDark: '#120d0b',
  bootMid: '#2d1e18',
  magic: '#facc15',
  shadow: 'rgba(0, 0, 0, 0.35)'
};

interface PixelRect { x: number; y: number; w: number; h: number; color: PixelColor; }
interface HeroPose { bob: number; legX: number; legY: number; armY: number; shake: number; hairWave: number; }

const PIXEL = 3;
const SPRITE_W = 18;
const SPRITE_H = 24;

export function drawHero(ctx: CanvasRenderingContext2D, hero: Hero): void {
  if (hero.invulnerabilityTimer > 0 && Math.floor(hero.invulnerabilityTimer * 18) % 2 === 0) return;

  const t = hero.animationTime;
  const pose = calculatePose(hero, t);

  const centerX = hero.x + hero.width / 2 + pose.shake;
  const centerY = hero.y + hero.height / 2 + pose.bob;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(centerX, centerY);

  // Sombra Projetada
  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath();
  const s = hero.state === 'jump' ? 0.6 : 1.0;
  ctx.ellipse(0, (SPRITE_H * PIXEL) / 2 - 2, 7 * PIXEL * s, 2 * PIXEL, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.scale(hero.direction, 1);
  const baseX = -Math.floor((SPRITE_W * PIXEL) / 2);
  const baseY = -Math.floor((SPRITE_H * PIXEL) / 2);

  const parts = buildHeroParts(pose, hero.state);
  for (const p of parts) {
    ctx.fillStyle = PALETTE[p.color];
    ctx.fillRect(baseX + p.x * PIXEL, baseY + p.y * PIXEL, p.w * PIXEL, p.h * PIXEL);
  }

  ctx.restore();
}

function calculatePose(hero: any, t: number): HeroPose {
  const run = Math.sin(t * 12);
  return {
    bob: hero.state === 'idle' ? Math.sin(t * 3) * 1.5 : 0,
    legX: hero.state === 'run' ? Math.round(run * 1.8) : 0,
    legY: hero.state === 'run' ? Math.round(Math.abs(run) * 0.8) : 0,
    armY: hero.state === 'run' ? Math.round(Math.abs(run)) : 0,
    shake: hero.state === 'hurt' ? Math.sin(t * 40) * 2 : 0,
    hairWave: Math.sin(t * 6) * 1 // O cabelo flutua levemente
  };
}

function buildHeroParts(pose: HeroPose, state: string): PixelRect[] {
  const torsoY = 9;
  const isRun = state === 'run';

  return [
    /** CABELO LONGO (Agora flui pelas costas) */
    // Mecha de trás (mais escura)
    { x: 3 + pose.hairWave, y: 1, w: 4, h: 8, color: 'hairDark' },
    { x: 4 + pose.hairWave, y: 8, w: 3, h: 5, color: 'hairDark' },

    // Topo da cabeça e franja
    { x: 5, y: 0, w: 7, h: 4, color: 'hairMid' },
    { x: 7, y: 1, w: 4, h: 1, color: 'hairLight' }, // Brilho no topo
    { x: 12, y: 3, w: 1, h: 4, color: 'hairMid' },  // Mecha lateral 3/4

    /** ROSTO (Proporções mais "Hero") */
    { x: 6, y: 4, w: 7, h: 5, color: 'skin' },
    { x: 10, y: 4, w: 4, h: 3, color: 'skinWarm' }, // Luz na bochecha
    { x: 9, y: 6, w: 1, h: 1, color: 'eye' },      // Olho distante
    { x: 12, y: 6, w: 2, h: 1, color: 'eye' },     // Olho frontal proeminente

    /** TORSO (V-Shape robusto) */
    { x: 6, y: torsoY, w: 3, h: 6, color: 'shirtDark' },
    { x: 8, y: torsoY - 1, w: 6, h: 7, color: 'shirtMid' },
    { x: 11, y: torsoY + 1, w: 3, h: 4, color: 'shirtLight' }, // Brilho no peito

    /** BRAÇOS (Mais detalhados) */
    // Trás
    { x: 3, y: 10 + pose.armY, w: 3, h: 4, color: 'shirtDark' },
    { x: 3, y: 14 + pose.armY, w: 2, h: 2, color: 'skin' },
    // Frente
    { x: 12 + (state === 'cast' ? 3 : 0), y: 10 + pose.armY, w: 3, h: 5, color: 'shirtLight' },
    { x: 13 + (state === 'cast' ? 3 : 0), y: 15 + pose.armY, w: 3, h: 2, color: 'skin' },

    /** PERNAS (Curvatura estilo "Street Fighter/Metal Slug") */
    { x: 6 + pose.legX, y: 17 + pose.legY, w: 4, h: 5, color: 'pantsDark' },
    { x: 11 - pose.legX, y: 17 + (pose.legY * 0.5), w: 4, h: 5, color: 'pantsMid' },

    /** BOTAS (Peso visual) */
    { x: 5 + pose.legX, y: 22 + pose.legY, w: 5, h: 2, color: 'bootDark' },
    { x: 11 - pose.legX, y: 22 + (pose.legY * 0.5), w: 6, h: 2, color: 'bootMid' },

    /** CONTORNOS DE DEFINIÇÃO */
    { x: 5, y: 5, w: 1, h: 5, color: 'outline' },
    { x: 14, y: torsoY + 1, w: 1, h: 4, color: 'outline' }
  ];
}
