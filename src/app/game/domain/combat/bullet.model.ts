export type BulletKind = 'forward' | 'upward' | 'special' | 'megaSpecial';

export type BulletSpriteType =
  | 'heroShot'
  | 'heroShotUp'
  | 'heroSpecialShot'
  | 'heroMegaSpecialShot';

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

  /**
   * Se verdadeiro, pode atravessar alvos destruídos.
   */
  pierceEnemies?: boolean;

  /**
   * Especial saindo do peito.
   */
  chestCast?: boolean;

  /**
   * Alcance máximo do projétil em pixels.
   */
  maxTravelDistance?: number;

  /**
   * Distância acumulada percorrida.
   */
  distanceTraveled?: number;
}
