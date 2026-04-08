import { Boss } from '../../domain/bosses/boss.model';
import { BossProjectile } from '../../domain/bosses/boss-projectile.model';
import { Hero } from '../../domain/hero/hero.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export function getBossGroundTop(
  boss: Boss,
  bossArena: BossArenaData,
): number {
  return bossArena.groundY - boss.height;
}

export function tryActivateBossBase(params: {
  boss: Boss;
  hero: Hero;
  runtime: EngineRuntime;
  bossArena: BossArenaData;
  activationOffset: number;
}): boolean {
  const { boss, hero, runtime, bossArena, activationOffset } = params;

  if (boss.active) {
    return false;
  }

  const heroCenterX = hero.x + hero.width / 2;
  const activationX = bossArena.startX + activationOffset;

  if (heroCenterX < activationX) {
    return false;
  }

  boss.active = true;
  boss.introPulse = 1.5;
  boss.y = getBossGroundTop(boss, bossArena);

  hero.x = Math.max(hero.x, bossArena.startX + 42);
  hero.y = bossArena.groundY - hero.height;
  hero.vx = 0;
  hero.vy = 0;
  hero.onGround = true;
  hero.jumpsRemaining = hero.maxJumps;

  runtime.bossAttackPatternIndex = 0;

  return true;
}

export function clampHeroInsideBossArenaBase(params: {
  hero: Hero;
  bossArena: BossArenaData;
  heroArenaLeftOffset: number;
  heroArenaRightOffset: number;
}): void {
  const {
    hero,
    bossArena,
    heroArenaLeftOffset,
    heroArenaRightOffset,
  } = params;

  const heroMinX = bossArena.startX - heroArenaLeftOffset;
  const heroMaxX = bossArena.endX - hero.width - heroArenaRightOffset;

  if (hero.x > heroMaxX) {
    hero.x = heroMaxX;
  }

  if (hero.x < heroMinX) {
    hero.x = heroMinX;
  }
}

export function startBossJumpBase(
  boss: Boss,
  randomRange: (min: number, max: number) => number,
): void {
  boss.vy = -820;
  boss.onGround = false;
  boss.jumpCooldown = randomRange(2.1, 3.4);
}

export function updateBossPhysicsBase(params: {
  boss: Boss;
  bossArena: BossArenaData;
  gravity: number;
  deltaTime: number;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
}): void {
  const {
    boss,
    bossArena,
    gravity,
    deltaTime,
    spawnBurst,
  } = params;

  if (boss.onGround) {
    boss.y = getBossGroundTop(boss, bossArena);
    return;
  }

  boss.vy += (gravity + 900) * deltaTime;
  boss.y += boss.vy * deltaTime;

  const bossGround = getBossGroundTop(boss, bossArena);

  if (boss.y >= bossGround) {
    boss.y = bossGround;
    boss.vy = 0;
    boss.onGround = true;
    boss.squashTimer = 0.16;

    spawnBurst(
      boss.x + boss.width / 2,
      boss.y + boss.height - 4,
      '#8b3d55',
      10,
    );
  }
}

export function createBossWaveProjectiles(
  boss: Boss,
  lowHpMode: boolean,
): BossProjectile[] {
  const count = lowHpMode ? 3 : 2;
  const projectiles: BossProjectile[] = [];

  for (let index = 0; index < count; index += 1) {
    projectiles.push({
      x: boss.x + 26,
      y: boss.y + 126 + index * 8,
      vx: -185 - index * 10,
      radius: 13,
      active: true,
      waveOffset: Math.random() * Math.PI * 2,
      amplitude: 18 + index * 6,
      frequency: 6.1 + index * 0.25,
      elapsed: 0,
      damage: 16,
      kind: 'normal',
    });
  }

  return projectiles;
}

export function createBossGooVolleyProjectiles(params: {
  boss: Boss;
  hero: Hero;
  lowHpMode: boolean;
  randomRange: (min: number, max: number) => number;
}): BossProjectile[] {
  const { boss, hero, lowHpMode, randomRange } = params;

  const launchX = boss.x + 26;
  const launchY = boss.y + 110;
  const targetX = hero.x + hero.width / 2 + hero.vx * 0.28;
  const count = lowHpMode ? 3 : 2;
  const gravity = 960;
  const middleIndex = (count - 1) / 2;

  const projectiles: BossProjectile[] = [];

  for (let index = 0; index < count; index += 1) {
    const spread = (index - middleIndex) * 34;
    const landingX = targetX + spread;
    const timeToLand = randomRange(0.8, 1.02);
    const vx = (landingX - launchX) / timeToLand;
    const vy = -randomRange(420, 520);

    projectiles.push({
      x: launchX,
      y: launchY,
      vx,
      vy,
      gravity,
      radius: 11 + index,
      active: true,
      waveOffset: Math.random() * Math.PI * 2,
      amplitude: 0,
      frequency: 0,
      elapsed: 0,
      damage: 18,
      kind: 'lob',
    });
  }

  return projectiles;
}

export function createBossUltimateProjectile(
  boss: Boss,
): BossProjectile {
  return {
    x: boss.x + 24,
    y: boss.y + 120,
    vx: -155,
    radius: 28,
    active: true,
    waveOffset: Math.random() * Math.PI * 2,
    amplitude: 10,
    frequency: 4.3,
    elapsed: 0,
    damage: 30,
    kind: 'ultimate',
  };
}

export function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
