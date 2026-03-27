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
  type: 'coin' | 'heart' | 'spark';
  x: number;
  y: number;
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
  bossArena: BossArenaData;
}

export class PhaseOneScene {
  static build(): PhaseOneData {
    return {
      worldWidth: 4200,
      platforms: [
        { x: 0, y: 620, width: 4200, height: 100 },
        { x: 380, y: 520, width: 150, height: 24 },
        { x: 700, y: 460, width: 150, height: 24 },
        { x: 1040, y: 540, width: 180, height: 24 },
        { x: 1420, y: 480, width: 140, height: 24 },
        { x: 1820, y: 430, width: 140, height: 24 },
        { x: 2120, y: 520, width: 160, height: 24 },
        { x: 2480, y: 470, width: 160, height: 24 },
        { x: 2860, y: 540, width: 180, height: 24 },
      ],
      enemies: [
        { type: 'errante', x: 600, y: 580, patrolLeft: 520, patrolRight: 820 },
        { type: 'errante', x: 1080, y: 580, patrolLeft: 980, patrolRight: 1240 },
        { type: 'vigia', x: 1600, y: 580, patrolLeft: 1500, patrolRight: 1750 },
        { type: 'errante', x: 2080, y: 580, patrolLeft: 1960, patrolRight: 2240 },
        { type: 'vigia', x: 2600, y: 580, patrolLeft: 2480, patrolRight: 2820 },
      ],
      collectibles: [
        { type: 'coin', x: 300, y: 570 },
        { type: 'coin', x: 430, y: 470 },
        { type: 'coin', x: 740, y: 410 },
        { type: 'coin', x: 1080, y: 500 },
        { type: 'coin', x: 1460, y: 430 },
        { type: 'coin', x: 1860, y: 380 },
        { type: 'coin', x: 2140, y: 470 },
        { type: 'coin', x: 2510, y: 420 },
        { type: 'coin', x: 2900, y: 490 },
        { type: 'spark', x: 830, y: 410 },
        { type: 'spark', x: 1560, y: 430 },
        { type: 'spark', x: 2290, y: 470 },
        { type: 'spark', x: 3010, y: 490 },
        { type: 'spark', x: 3170, y: 570 },
        { type: 'heart', x: 1740, y: 570 },
      ],
      bossArena: {
        startX: 3300,
        endX: 4100,
        bossX: 3850,
        groundY: 620,
        markerXs: [3470, 3700, 3940],
      },
    };
  }
}
