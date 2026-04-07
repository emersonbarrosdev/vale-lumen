import { Boss } from '../../domain/bosses/boss.model';
import { Bullet } from '../../domain/combat/bullet.model';
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
}: Pick<
  ProjectileSystemParams,
  'runtime'
> & {
  deltaTime: number;
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
  runtime.specialSequenceActive = false;
  runtime.specialPulseTimer = 0;
  runtime.specialPulsesRemaining = 0;
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
      bullet.x < -140 ||
      bullet.x > worldWidth + 140 ||
      bullet.y < -160 ||
      bullet.y > canvasHeight + 160
    ) {
      if (bullet.kind === 'special' && bullet.explosionOnImpact) {
        createSpecialExplosion(runtime, bullet, spawnBurst);
      }

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
        if (bullet.kind === 'special' && bullet.explosionOnImpact) {
          createSpecialExplosion(runtime, bullet, spawnBurst);
        }

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
        if (bullet.kind === 'special' && bullet.explosionOnImpact) {
          createSpecialExplosion(runtime, bullet, spawnBurst);
        }

        bullet.active = false;
        enemy.hp -= bullet.damage;
        enemy.hitFlash = 0.1;

        if (enemy.hp <= 0) {
          killEnemy(
            enemy,
            enemy.type === 'vigia' ? 100 : 50,
            '#ff8b5e',
            bullet.kind === 'special' ? 18 : 10,
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
        /**
         * CORREÇÃO:
         * agora qualquer tiro quebra o objeto.
         */
        if (bullet.kind === 'special' && bullet.explosionOnImpact) {
          createSpecialExplosion(runtime, bullet, spawnBurst);
        }

        bullet.active = false;
        breakChest(chest);
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
        if (bullet.kind === 'special' && bullet.explosionOnImpact) {
          createSpecialExplosion(runtime, bullet, spawnBurst);
        }

        bullet.active = false;
        spawnBurst(
          bullet.x + bullet.width / 2,
          bullet.y + bullet.height / 2,
          '#7dffb2',
          bullet.kind === 'special' ? 12 : 6,
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
      if (bullet.kind === 'special' && bullet.explosionOnImpact) {
        createSpecialExplosion(runtime, bullet, spawnBurst);
      }

      bullet.active = false;
      boss.hp -= bullet.damage;
      boss.hitFlash = 0.12;
      spawnBurst(
        boss.x + boss.width / 2,
        boss.y + 74,
        '#ff8b5e',
        bullet.kind === 'special' ? 16 : 8,
      );
    }
  }

  runtime.bullets = runtime.bullets.filter((bullet) => bullet.active);
}

export function updateSpecialExplosionsSystem({
  runtime,
  boss,
  enemies,
  chests,
  hazards,
  spawnBurst,
  breakChest,
  killEnemy,
  deltaTime,
}: {
  runtime: EngineRuntime;
  boss: Boss;
  enemies: Enemy[];
  chests: Chest[];
  hazards: Hazard[];
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
  breakChest: (chest: Chest) => void;
  killEnemy: (
    enemy: Enemy,
    scoreValue: number,
    burstColor: string,
    burstAmount: number,
  ) => void;
  deltaTime: number;
}): void {
  for (const explosion of runtime.specialExplosions) {
    explosion.life -= deltaTime;
    const progress = 1 - explosion.life / explosion.maxLife;
    explosion.radius = explosion.maxRadius * Math.min(1, progress * 1.15);

    if (!explosion.appliedDamage && explosion.radius >= explosion.maxRadius * 0.5) {
      explosion.appliedDamage = true;

      for (const enemy of enemies) {
        if (!enemy.active) {
          continue;
        }

        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;

        if (pointInExplosion(enemyCenterX, enemyCenterY, explosion)) {
          enemy.hp -= explosion.damage;
          enemy.hitFlash = 0.16;

          if (enemy.hp <= 0) {
            killEnemy(
              enemy,
              enemy.type === 'vigia' ? 100 : 50,
              '#ff6a00',
              20,
            );
          } else {
            spawnBurst(enemyCenterX, enemyCenterY, '#ffb36a', 12);
          }
        }
      }

      for (const chest of chests) {
        if (!chest.active) {
          continue;
        }

        const chestCenterX = chest.x + chest.width / 2;
        const chestCenterY = chest.y + chest.height / 2;

        if (pointInExplosion(chestCenterX, chestCenterY, explosion)) {
          breakChest(chest);
        }
      }

      for (const hazard of hazards) {
        if (!hazard.active) {
          continue;
        }

        const hazardCenterX = hazard.x + hazard.width / 2;
        const hazardCenterY = hazard.y + hazard.height / 2;

        if (pointInExplosion(hazardCenterX, hazardCenterY, explosion)) {
          spawnBurst(hazardCenterX, hazardCenterY, '#7dffb2', 10);
        }
      }

      if (boss.active && boss.hp > 0) {
        const bossCenterX = boss.x + boss.width / 2;
        const bossCenterY = boss.y + boss.height / 2;

        if (pointInExplosion(bossCenterX, bossCenterY, explosion)) {
          boss.hp = Math.max(0, boss.hp - explosion.damage);
          boss.hitFlash = 0.18;
          spawnBurst(bossCenterX, bossCenterY, '#ff6a00', 18);
        }
      }
    }
  }

  runtime.specialExplosions = runtime.specialExplosions.filter(
    (explosion) => explosion.life > 0,
  );
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

function createSpecialExplosion(
  runtime: EngineRuntime,
  bullet: Bullet,
  spawnBurst: (x: number, y: number, color: string, amount: number) => void,
): void {
  const x = bullet.x + bullet.width / 2;
  const y = bullet.y + bullet.height / 2;

  runtime.specialExplosions.push({
    x,
    y,
    radius: 0,
    maxRadius: bullet.explosionRadius ?? 220,
    life: 0.42,
    maxLife: 0.42,
    damage: bullet.explosionDamage ?? 4,
    appliedDamage: false,
  });

  spawnBurst(x, y, '#ffb15c', 26);
  spawnBurst(x, y, '#82e8ff', 12);
  runtime.enemyProjectiles = [];
  runtime.bossProjectiles = [];
}

function pointInExplosion(
  x: number,
  y: number,
  explosion: { x: number; y: number; radius: number },
): boolean {
  const dx = x - explosion.x;
  const dy = y - explosion.y;

  return dx * dx + dy * dy <= explosion.radius * explosion.radius;
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
