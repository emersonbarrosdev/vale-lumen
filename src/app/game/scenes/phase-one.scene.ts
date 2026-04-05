export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EnemyData {
  type: 'errante' | 'vigia';
  x: number;
  y: number;
  patrolLeft: number;
  patrolRight: number;
}

export interface CollectibleData {
  type: 'coin' | 'heart' | 'ray' | 'flameVial';
  x: number;
  y: number;
}

export interface ChestData {
  x: number;
  y: number;
  width: number;
  height: number;
  rare?: boolean;
}

export interface BossArenaData {
  startX: number;
  endX: number;
  bossX: number;
  groundY: number;
  markerXs: number[];
}

export interface PhaseOneData {
  worldWidth: number;
  platforms: PlatformData[];
  enemies: EnemyData[];
  collectibles: CollectibleData[];
  chests: ChestData[];
  bossArena: BossArenaData;
}

export class PhaseOneScene {
  static build(): PhaseOneData {
    return {
      worldWidth: 4700,
      platforms: [
        // CHÃO REALMENTE QUEBRADO - ESTILO PLATAFORMA COM BURACOS GRANDES
        { x: 0, y: 620, width: 280, height: 100 },
        { x: 520, y: 620, width: 300, height: 100 },
        { x: 1080, y: 620, width: 320, height: 100 },
        { x: 1700, y: 620, width: 320, height: 100 },
        { x: 2300, y: 620, width: 340, height: 100 },
        { x: 2940, y: 620, width: 320, height: 100 },
        { x: 3520, y: 620, width: 320, height: 100 },
        { x: 4080, y: 620, width: 620, height: 100 },

        // NÍVEL 1
        { x: 120, y: 520, width: 150, height: 24 },
        { x: 610, y: 520, width: 150, height: 24 },
        { x: 1160, y: 520, width: 160, height: 24 },
        { x: 1790, y: 520, width: 160, height: 24 },
        { x: 2400, y: 520, width: 160, height: 24 },
        { x: 3040, y: 520, width: 160, height: 24 },
        { x: 3620, y: 520, width: 160, height: 24 },

        // NÍVEL 2 - MAIS ALTO DE VERDADE
        { x: 520, y: 380, width: 150, height: 24 },
        { x: 1420, y: 380, width: 150, height: 24 },
        { x: 2060, y: 380, width: 150, height: 24 },
        { x: 2800, y: 380, width: 150, height: 24 },
        { x: 3420, y: 380, width: 150, height: 24 },

        // NÍVEL 3 - BEM MAIS ALTO E SEMPRE PERTO DO NÍVEL 2
        { x: 760, y: 220, width: 140, height: 24 },
        { x: 1660, y: 220, width: 140, height: 24 },
        { x: 2300, y: 220, width: 140, height: 24 },
        { x: 3040, y: 220, width: 140, height: 24 },
        { x: 3660, y: 220, width: 140, height: 24 },
      ],
      enemies: [
        { type: 'errante', x: 70, y: 576, patrolLeft: 20, patrolRight: 240 },
        { type: 'errante', x: 560, y: 576, patrolLeft: 540, patrolRight: 760 },
        { type: 'vigia', x: 560, y: 311, patrolLeft: 540, patrolRight: 650 },
        { type: 'vigia', x: 790, y: 151, patrolLeft: 775, patrolRight: 870 },

        { type: 'errante', x: 1120, y: 576, patrolLeft: 1100, patrolRight: 1360 },
        { type: 'errante', x: 1740, y: 576, patrolLeft: 1720, patrolRight: 1980 },
        { type: 'vigia', x: 1460, y: 311, patrolLeft: 1440, patrolRight: 1540 },
        { type: 'vigia', x: 1690, y: 151, patrolLeft: 1675, patrolRight: 1770 },

        { type: 'errante', x: 2340, y: 576, patrolLeft: 2320, patrolRight: 2600 },
        { type: 'vigia', x: 2100, y: 311, patrolLeft: 2080, patrolRight: 2190 },
        { type: 'vigia', x: 2330, y: 151, patrolLeft: 2310, patrolRight: 2400 },

        { type: 'errante', x: 2980, y: 576, patrolLeft: 2960, patrolRight: 3220 },
        { type: 'vigia', x: 2840, y: 311, patrolLeft: 2820, patrolRight: 2930 },
        { type: 'vigia', x: 3070, y: 151, patrolLeft: 3050, patrolRight: 3140 },

        { type: 'errante', x: 3560, y: 576, patrolLeft: 3540, patrolRight: 3800 },
        { type: 'vigia', x: 3460, y: 311, patrolLeft: 3440, patrolRight: 3540 },
        { type: 'vigia', x: 3690, y: 151, patrolLeft: 3670, patrolRight: 3760 },
      ],
      collectibles: [
        { type: 'coin', x: 170, y: 484 },
        { type: 'coin', x: 660, y: 484 },
        { type: 'coin', x: 1210, y: 484 },
        { type: 'coin', x: 1840, y: 484 },
        { type: 'coin', x: 2450, y: 484 },
        { type: 'coin', x: 3090, y: 484 },
        { type: 'coin', x: 3670, y: 484 },

        { type: 'coin', x: 580, y: 344 },
        { type: 'coin', x: 1480, y: 344 },
        { type: 'coin', x: 2120, y: 344 },
        { type: 'coin', x: 2860, y: 344 },
        { type: 'coin', x: 3480, y: 344 },

        { type: 'coin', x: 820, y: 184 },
        { type: 'coin', x: 1720, y: 184 },
        { type: 'coin', x: 2360, y: 184 },
        { type: 'coin', x: 3100, y: 184 },
        { type: 'coin', x: 3720, y: 184 },

        { type: 'ray', x: 620, y: 342 },
        { type: 'ray', x: 850, y: 182 },
        { type: 'ray', x: 1520, y: 342 },
        { type: 'ray', x: 1750, y: 182 },
        { type: 'ray', x: 2160, y: 342 },
        { type: 'ray', x: 2390, y: 182 },
        { type: 'ray', x: 2900, y: 342 },
        { type: 'ray', x: 3130, y: 182 },
        { type: 'ray', x: 3520, y: 342 },
        { type: 'ray', x: 3750, y: 182 },

        { type: 'heart', x: 1880, y: 578 },
        { type: 'flameVial', x: 3200, y: 578 },
      ],
      chests: [
        { x: 830, y: 184, width: 38, height: 28, rare: false },
        { x: 3130, y: 184, width: 42, height: 30, rare: true },
      ],
      bossArena: {
        startX: 4100,
        endX: 4600,
        bossX: 4340,
        groundY: 620,
        markerXs: [4200, 4350, 4480],
      },
    };
  }
}
