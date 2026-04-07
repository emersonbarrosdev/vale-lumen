export type BulletKind = 'forward' | 'upward' | 'special';

export type BulletSpriteType =
  | 'heroShot'
  | 'heroShotUp'
  | 'heroSpecialShot';

export interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  active: boolean;

  kind: BulletKind;
  spriteType: BulletSpriteType;

  damage: number;
  ownerWeapon?: 'arcaneGun';
  muzzleFlash?: boolean;

  /**
   * Usado no especial.
   */
  explosionOnImpact?: boolean;
  explosionRadius?: number;
  explosionDamage?: number;
}
