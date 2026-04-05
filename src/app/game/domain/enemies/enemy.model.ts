export type EnemyType = 'errante' | 'vigia';

export interface EnemyData {
  type: EnemyType;
  x: number;
  y: number;
  patrolLeft: number;
  patrolRight: number;
}

export interface Enemy {
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1;
  patrolLeft: number;
  patrolRight: number;
  hp: number;
  active: boolean;
  hitFlash: number;
  hoverOffset: number;
  baseX: number;
  baseY: number;
  respawnTimer: number;
  respawnDelay: number;
  shootCooldown: number;
  shotDirection: 1 | -1;
}
