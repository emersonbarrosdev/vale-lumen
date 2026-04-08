import { Bullet } from '../../domain/combat/bullet.model';
import { SpecialStrike } from '../../domain/combat/special-strike.model';
import { Hero } from '../../domain/hero/hero.model';

export function createUpwardBullet(hero: Hero): Bullet {
  return {
    x: hero.x + hero.width / 2 + 0.5,
    y: hero.y - 30,
    width: 4,
    height: 10,
    vx: 0,
    vy: -760,
    active: true,
    kind: 'upward',
    spriteType: 'heroShotUp',
    damage: 1,
    ownerWeapon: 'arcaneGun',
    muzzleFlash: true,
    firedWhileRunning: false,
    direction: hero.direction,
  };
}

export function createForwardBullet(hero: Hero): Bullet {
  const firedWhileRunning =
    hero.onGround &&
    !hero.crouching &&
    Math.abs(hero.vx) > 70;

  return {
    x:
      hero.direction === 1
        ? hero.x + hero.width + 8
        : hero.x - 14,
    y: hero.crouching ? hero.y + 26 : hero.y + 15,
    width: 10,
    height: 4,
    vx: hero.direction * 690,
    vy: 0,
    active: true,
    kind: 'forward',
    spriteType: 'heroShot',
    damage: 1,
    ownerWeapon: 'arcaneGun',
    muzzleFlash: true,
    firedWhileRunning,
    direction: hero.direction,
  };
}

export function createSimpleChargedBullet(hero: Hero): Bullet {
  return {
    x:
      hero.direction === 1
        ? hero.x + hero.width + 4
        : hero.x - 28,
    y: hero.crouching ? hero.y + 20 : hero.y + 10,
    width: 24,
    height: 10,
    vx: hero.direction * 820,
    vy: 0,
    active: true,
    kind: 'special',
    spriteType: 'heroSpecialShot',
    damage: 2,
    ownerWeapon: 'arcaneGun',
    muzzleFlash: true,
    firedWhileRunning: false,
    direction: hero.direction,
    maxTravelDistance: 420,
    distanceTraveled: 0,
  };
}

export function createSpecialBullet(
  hero: Hero,
  canvasWidth: number,
): Bullet {
  return {
    x:
      hero.direction === 1
        ? hero.x + hero.width + 2
        : hero.x - 38,
    y: hero.y + 10,
    width: 38,
    height: 20,
    vx: hero.direction * 980,
    vy: 0,
    active: true,
    kind: 'special',
    spriteType: 'heroSpecialShot',
    damage: 4,
    ownerWeapon: 'arcaneGun',
    muzzleFlash: true,
    firedWhileRunning: false,
    direction: hero.direction,
    explosionOnImpact: true,
    explosionRadius: canvasWidth * 0.22,
    explosionDamage: 4,
    chestCast: true,
    maxTravelDistance: canvasWidth * 0.4,
    distanceTraveled: 0,
  };
}

export function createMegaSpecialBullet(
  hero: Hero,
  canvasWidth: number,
): Bullet {
  const originX =
    hero.direction === 1
      ? hero.x + hero.width + 2
      : hero.x - 78;

  return {
    x: originX,
    y: hero.y + 2,
    width: 82,
    height: 42,
    vx: hero.direction * 1240,
    vy: 0,
    active: true,
    kind: 'megaSpecial',
    spriteType: 'heroMegaSpecialShot',
    damage: 8,
    ownerWeapon: 'arcaneGun',
    muzzleFlash: true,
    firedWhileRunning: false,
    direction: hero.direction,
    explosionOnImpact: true,
    explosionRadius: canvasWidth * 0.52,
    explosionDamage: 8,
    pierceEnemies: true,
    chestCast: true,
    maxTravelDistance: canvasWidth,
    distanceTraveled: 0,
  };
}

export function buildMegaSpecialStrikePoints(
  hero: Hero,
  canvasWidth: number,
): Array<{ x: number; y: number }> {
  const originX =
    hero.direction === 1
      ? hero.x + hero.width / 2 + 10
      : hero.x + hero.width / 2 - 10;
  const originY = hero.y + 18;
  const endX =
    hero.direction === 1
      ? hero.x + canvasWidth
      : hero.x - canvasWidth;

  const points: Array<{ x: number; y: number }> = [];
  const segments = 8;

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const x = originX + (endX - originX) * t;
    const wobble =
      Math.sin(t * Math.PI * 4 + performance.now() * 0.02) * 18;
    const y = originY + wobble;

    points.push({ x, y });
  }

  return points;
}

export function createMegaSpecialStrike(
  hero: Hero,
  canvasWidth: number,
): SpecialStrike {
  return {
    points: buildMegaSpecialStrikePoints(hero, canvasWidth),
    life: 0.34,
    maxLife: 0.34,
    width: 20,
    theme: 'heroMegaSpecial',
  };
}
