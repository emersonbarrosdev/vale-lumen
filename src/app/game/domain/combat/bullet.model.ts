export type BulletKind =
  | 'forward'
  | 'upward'
  | 'special'
  | 'megaSpecial';

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
   * Quando verdadeiro, atravessa inimigos comuns/capitães
   * até o fim da tela, mas para no boss.
   */
  pierceEnemies?: boolean;

  /**
   * Marca projétil criado a partir do peito do herói.
   */
  chestCast?: boolean;
}
