export type BulletKind = 'forward' | 'upward';

export interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  active: boolean;
  kind: BulletKind;
}
