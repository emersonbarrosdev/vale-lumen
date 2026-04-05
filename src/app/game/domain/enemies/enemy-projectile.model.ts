export interface EnemyProjectile {
  ownerX: number;
  ownerY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  radius: number;
  active: boolean;
  waveOffset: number;
  amplitude: number;
  frequency: number;
  elapsed: number;
  damage: number;
}
