export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  radius: number;
  active: boolean;
  waveOffset: number;
  amplitude: number;
  frequency: number;
  elapsed: number;
  damage: number;
  kind: 'normal' | 'ultimate';
}
