import { Boss } from '../../domain/bosses/boss.model';
import { BurstParticle } from '../../domain/combat/burst-particle.model';
import { Bullet } from '../../domain/combat/bullet.model';
import { SpecialStrike } from '../../domain/combat/special-strike.model';
import { Enemy } from '../../domain/enemies/enemy.model';
import { Hero } from '../../domain/hero/hero.model';
import { Chest } from '../../domain/world/chest.model';
import { Hazard } from '../../domain/world/hazard.model';
import { Tunnel } from '../../domain/world/tunnel.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';

export interface ProjectileSystemParams {
  runtime: EngineRuntime;
  hero: Hero;
  boss: Boss;
  enemies: Enemy[];
  chests: Chest[];
  hazards: Hazard[];
  tunnels: Tunnel[];
  bossArena: BossArenaData;
  worldWidth: number;
  canvasHeight: number;
  deltaTime: number;
  randomRange: (min: number, max: number) => number;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
  breakChest: (chest: Chest) => void;
  killEnemy: (
    enemy: Enemy,
    scoreValue: number,
    burstColor: string,
    burstAmount: number,
  ) => void;
  applyHeroDamage: (damage?: number) => void;
}

export function updateSpecialSequenceSystem({
  runtime,
  hero,
  boss,
  enemies,
  chests,
  deltaTime,
  randomRange,
  spawnBurst,
  breakChest,
  killEnemy,
}: Pick<
  ProjectileSystemParams,
  'runtime' | 'hero' | 'boss' | 'enemies' | 'chests' | 'deltaTime' | 'randomRange' | 'spawnBurst' | 'breakChest' | 'killEnemy'
>): void {
  if (!runtime.specialSequenceActive) {
    return;
  }

  runtime.specialPulseTimer -= deltaTime;

  if (runtime.specialPulseTimer > 0) {
    return;
  }

  releaseSpecialPulse({
    runtime,
    hero,
    boss,
    enemies,
    chests,
    randomRange,
    spawnBurst,
    breakChest,
    killEnemy,
  });

  runtime.specialPulsesRemaining -= 1;

  if (runtime.specialPulsesRemaining <= 0) {
    runtime.specialSequenceActive = false;
    runtime.specialPulseTimer = 0;
    return;
  }

  runtime.specialPulseTimer = 0.18;
}

export function updateSpecialStrikesSystem(
  runtime: EngineRuntime,
  deltaTime: number,
): void {
  for (const strike of runtime.specialStrikes) {
    strike.life -= deltaTime;
  }

  runtime.specialStrikes = runtime.specialStrikes.filter((strike) => strike.life > 0);
}

export function updateBurstParticlesSystem(
  runtime: EngineRuntime,
  deltaTime: number,
): void {
  for (const particle of runtime.burstParticles) {
    particle.life -= deltaTime;
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.vy += 420 * deltaTime;
  }

  runtime.burstParticles = runtime.burstParticles.filter((particle) => particle.life > 0);
}

export function updateBulletsSystem({
  runtime,
  boss,
  enemies,
  chests,
  hazards,
  tunnels,
  worldWidth,
  canvasHeight,
  spawnBurst,
  breakChest,
  killEnemy,
}: Pick<
  ProjectileSystemParams,
  'runtime' | 'boss' | 'enemies' | 'chests' | 'hazards' | 'tunnels' | 'worldWidth' | 'canvasHeight' | 'spawnBurst' | 'breakChest' | 'killEnemy'
> & {
  deltaTime: number;
}): void {
  const { deltaTime } = arguments[0];

  for (const bullet of runtime.bullets) {
    if (!bullet.active) {
      continue;
    }

    bullet.x += bullet.vx * deltaTime;
    bullet.y += bullet.vy * deltaTime;

    if (
      bullet.x < -100 ||
      bullet.x > worldWidth + 100 ||
      bullet.y < -120 ||
      bullet.y > canvasHeight + 120
    ) {
      bullet.active = false;
      continue;
    }

    for (const tunnel of tunnels) {
      const roofRect = {
        x: tunnel.x,
        y: tunnel.ceilingY,
        width: tunnel.width,
        height: tunnel.thickness,
      };

      if (rectsOverlap(bullet, roofRect)) {
        bullet.active = false;
        break;
      }
    }

    if (!bullet.active) {
      continue;
    }

    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }

      if (rectsOverlap(bullet, enemy)) {
        bullet.active = false;
        enemy.hp -= 1;
        enemy.hitFlash = 0.08;

        if (enemy.hp <= 0) {
          killEnemy(
            enemy,
            enemy.type === 'vigia' ? 100 : 50,
            '#ff8b5e',
            10,
          );
        }

        break;
      }
    }

    if (!bullet.active) {
      continue;
    }

    for (const chest of chests) {
      if (!chest.active) {
        continue;
      }

      if (rectsOverlap(bullet, chest)) {
        if (bullet.kind === 'upward') {
          bullet.active = false;
          breakChest(chest);
        }
        break;
      }
    }

    if (!bullet.active) {
      continue;
    }

    for (const hazard of hazards) {
      if (!hazard.active) {
        continue;
      }

      if (rectsOverlap(bullet, hazard)) {
        bullet.active = false;
        spawnBurst(
          bullet.x + bullet.width / 2,
          bullet.y + bullet.height / 2,
          '#7dffb2',
          6,
        );
        break;
      }
    }

    if (
      bullet.active &&
      boss.active &&
      boss.hp > 0 &&
      rectsOverlap(bullet, boss)
    ) {
      bullet.active = false;
      boss.hp -= 1;
      boss.hitFlash = 0.1;
      spawnBurst(
        boss.x + boss.width / 2,
        boss.y + 74,
        '#ff8b5e',
        8,
      );
    }
  }

  runtime.bullets = runtime.bullets.filter((bullet) => bullet.active);
}

export function updateEnemyProjectilesSystem({
  runtime,
  hero,
  bossArena,
  worldWidth,
  spawnBurst,
  applyHeroDamage,
}: Pick<
  ProjectileSystemParams,
  'runtime' | 'hero' | 'bossArena' | 'worldWidth' | 'spawnBurst' | 'applyHeroDamage'
> & {
  deltaTime: number;
}): void {
  const { deltaTime } = arguments[0];

  for (const projectile of runtime.enemyProjectiles) {
    if (!projectile.active) {
      continue;
    }

    projectile.elapsed += deltaTime;
    projectile.vy += projectile.gravity * deltaTime;
    projectile.x += projectile.vx * deltaTime;
    projectile.y += projectile.vy * deltaTime;

    if (
      projectile.y + projectile.radius >= bossArena.groundY ||
      projectile.x < -80 ||
      projectile.x > worldWidth + 80 ||
      projectile.y < 40
    ) {
      projectile.active = false;
      spawnBurst(
        projectile.x,
        Math.min(bossArena.groundY - 6, projectile.y),
        '#45b857',
        12,
      );
      continue;
    }

    if (
      hero.invulnerabilityTimer <= 0 &&
      circleRectOverlap(
        projectile.x,
        projectile.y,
        projectile.radius,
        hero,
      )
    ) {
      projectile.active = false;
      applyHeroDamage(projectile.damage);
    }
  }

  runtime.enemyProjectiles = runtime.enemyProjectiles.filter((projectile) => projectile.active);
}

export function updateBossProjectilesSystem({
  runtime,
  hero,
  bossArena,
  spawnBurst,
  applyHeroDamage,
}: Pick<
  ProjectileSystemParams,
  'runtime' | 'hero' | 'bossArena' | 'spawnBurst' | 'applyHeroDamage'
> & {
  deltaTime: number;
}): void {
  const { deltaTime } = arguments[0];

  for (const projectile of runtime.bossProjectiles) {
    if (!projectile.active) {
      continue;
    }

    projectile.elapsed += deltaTime;

    if (projectile.kind === 'lob') {
      projectile.vy = (projectile.vy ?? 0) + (projectile.gravity ?? 0) * deltaTime;
      projectile.x += projectile.vx * deltaTime;
      projectile.y += (projectile.vy ?? 0) * deltaTime;

      spawnBurst(projectile.x, projectile.y, '#45b857', 1);

      if (projectile.y + projectile.radius >= bossArena.groundY) {
        projectile.active = false;
        spawnBurst(projectile.x, bossArena.groundY - 6, '#45b857', 14);

        if (
          hero.invulnerabilityTimer <= 0 &&
          Math.abs(hero.x + hero.width / 2 - projectile.x) <= 46 &&
          hero.y + hero.height >= bossArena.groundY - 40
        ) {
          applyHeroDamage(projectile.damage);
        }

        continue;
      }
    } else {
      projectile.x += projectile.vx * deltaTime;
      projectile.y +=
        Math.sin(
          projectile.elapsed * projectile.frequency + projectile.waveOffset,
        ) *
        projectile.amplitude *
        deltaTime;

      if (
        projectile.x + projectile.radius < bossArena.startX - 120 ||
        projectile.x - projectile.radius > bossArena.endX + 120 ||
        projectile.y < 380 ||
        projectile.y > bossArena.groundY - 28
      ) {
        projectile.active = false;
        continue;
      }

      if (
        hero.invulnerabilityTimer <= 0 &&
        circleRectOverlap(
          projectile.x,
          projectile.y,
          projectile.radius,
          hero,
        )
      ) {
        projectile.active = false;
        applyHeroDamage(projectile.damage);
      }
    }
  }

  runtime.bossProjectiles = runtime.bossProjectiles.filter(
    (projectile) => projectile.active,
  );
}

function releaseSpecialPulse({
  runtime,
  hero,
  boss,
  enemies,
  chests,
  randomRange,
  spawnBurst,
  breakChest,
  killEnemy,
}: {
  runtime: EngineRuntime;
  hero: Hero;
  boss: Boss;
  enemies: Enemy[];
  chests: Chest[];
  randomRange: (min: number, max: number) => number;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
  breakChest: (chest: Chest) => void;
  killEnemy: (
    enemy: Enemy,
    scoreValue: number,
    burstColor: string,
    burstAmount: number,
  ) => void;
}): void {
  const originX = hero.x + hero.width / 2;
  const originY = hero.y + hero.height * 0.56;
  const direction = hero.direction;
  const localOffsets = [-16, 0, 16];

  for (let index = 0; index < localOffsets.length; index += 1) {
    const startX = originX + direction * randomRange(2, 10);
    const startY = originY + localOffsets[index] + randomRange(-5, 5);

    runtime.specialStrikes.push({
      points: buildMagicVolleyPath(startX, startY, direction, randomRange),
      life: 0.75,
      maxLife: 0.75,
      width: randomRange(12, 17),
      theme: 'heroSpecial',
    });
  }

  for (const enemy of enemies) {
    if (!enemy.active) {
      continue;
    }

    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;
    const inFront = direction === 1
      ? enemyCenterX >= originX - 6
      : enemyCenterX <= originX + 6;
    const closeEnoughX = Math.abs(enemyCenterX - originX) <= 1680;
    const closeEnoughY = Math.abs(enemyCenterY - originY) <= 95;

    if (inFront && closeEnoughX && closeEnoughY) {
      enemy.hp -= 2;
      enemy.hitFlash = 0.12;

      if (enemy.hp <= 0) {
        killEnemy(
          enemy,
          enemy.type === 'vigia' ? 100 : 50,
          '#ff6a00',
          18,
        );
      } else {
        spawnBurst(enemyCenterX, enemyCenterY, '#ff6a00', 8);
      }
    }
  }

  for (const chest of chests) {
    if (!chest.active) {
      continue;
    }

    const chestCenterX = chest.x + chest.width / 2;
    const chestCenterY = chest.y + chest.height / 2;
    const inFront = direction === 1
      ? chestCenterX >= originX - 6
      : chestCenterX <= originX + 6;
    const closeEnoughX = Math.abs(chestCenterX - originX) <= 1680;
    const closeEnoughY = Math.abs(chestCenterY - originY) <= 95;

    if (inFront && closeEnoughX && closeEnoughY) {
      breakChest(chest);
    }
  }

  if (boss.active && boss.hp > 0) {
    const bossCenterX = boss.x + boss.width / 2;
    const bossCenterY = boss.y + boss.height / 2;
    const inFront = direction === 1
      ? bossCenterX >= originX - 6
      : bossCenterX <= originX + 6;
    const closeEnoughX = Math.abs(bossCenterX - originX) <= 1860;
    const closeEnoughY = Math.abs(bossCenterY - originY) <= 115;

    if (inFront && closeEnoughX && closeEnoughY) {
      boss.hp = Math.max(0, boss.hp - 3);
      boss.hitFlash = 0.18;
      spawnBurst(bossCenterX, bossCenterY, '#ff6a00', 12);
    }
  }

  runtime.bossProjectiles = [];
  runtime.enemyProjectiles = [];
}

function buildMagicVolleyPath(
  startX: number,
  startY: number,
  direction: 1 | -1,
  randomRange: (min: number, max: number) => number,
): Array<{ x: number; y: number }> {
  const points = [{ x: startX, y: startY }];
  let x = startX;
  let y = startY;

  const segments = 10;

  for (let index = 0; index < segments; index += 1) {
    x += randomRange(52, 78) * direction;
    y += randomRange(-3, 3);
    points.push({ x, y });
  }

  return points;
}

function rectsOverlap(
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

function circleRectOverlap(
  cx: number,
  cy: number,
  radius: number,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const dx = cx - closestX;
  const dy = cy - closestY;

  return dx * dx + dy * dy <= radius * radius;
}
