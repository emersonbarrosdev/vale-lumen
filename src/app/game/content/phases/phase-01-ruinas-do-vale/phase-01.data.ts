import { BossArenaData } from '../../../domain/world/boss-arena.model';
import { ChestData } from '../../../domain/world/chest.model';
import { CollectibleData } from '../../../domain/world/collectible.model';
import { EnemyData } from '../../../domain/enemies/enemy.model';
import { PlatformData } from '../../../domain/world/platform.model';

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
        { x: 0, y: 620, width: 4700, height: 100 },

        { x: 430, y: 535, width: 190, height: 24 },
        { x: 890, y: 455, width: 170, height: 24 },

        { x: 1450, y: 520, width: 220, height: 24 },
        { x: 1810, y: 360, width: 170, height: 24 },

        { x: 2380, y: 455, width: 180, height: 24 },
        { x: 2820, y: 300, width: 170, height: 24 },

        { x: 3340, y: 420, width: 190, height: 24 },
      ],
      enemies: [
        { type: 'errante', x: 610, y: 576, patrolLeft: 520, patrolRight: 760 },
        { type: 'vigia', x: 930, y: 386, patrolLeft: 900, patrolRight: 1010 },
        { type: 'errante', x: 1545, y: 476, patrolLeft: 1490, patrolRight: 1620 },
        { type: 'vigia', x: 1860, y: 291, patrolLeft: 1830, patrolRight: 1940 },
        { type: 'errante', x: 2450, y: 411, patrolLeft: 2410, patrolRight: 2520 },
        { type: 'vigia', x: 2870, y: 231, patrolLeft: 2840, patrolRight: 2950 },
        { type: 'vigia', x: 3400, y: 351, patrolLeft: 3370, patrolRight: 3490 },
      ],
      collectibles: [
        { type: 'coin', x: 250, y: 580 },
        { type: 'coin', x: 470, y: 495 },
        { type: 'coin', x: 930, y: 418 },
        { type: 'coin', x: 1500, y: 480 },
        { type: 'coin', x: 1860, y: 315 },
        { type: 'coin', x: 2450, y: 420 },
        { type: 'coin', x: 2870, y: 246 },
        { type: 'coin', x: 3410, y: 368 },

        { type: 'ray', x: 1035, y: 418 },
        { type: 'ray', x: 1960, y: 318 },
        { type: 'ray', x: 2970, y: 248 },
        { type: 'ray', x: 3510, y: 368 },

        { type: 'heart', x: 2550, y: 418 },
      ],
      chests: [
        { x: 1888, y: 324, width: 38, height: 28, rare: false },
        { x: 2900, y: 264, width: 42, height: 30, rare: true },
      ],
      bossArena: {
        startX: 3850,
        endX: 4600,
        bossX: 4320,
        groundY: 620,
        markerXs: [4010, 4220, 4440],
      },
    };
  }
}
