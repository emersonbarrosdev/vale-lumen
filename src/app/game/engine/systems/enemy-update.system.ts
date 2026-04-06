import { EnemyProjectile } from '../../domain/enemies/enemy-projectile.model';
import { Enemy } from '../../domain/enemies/enemy.model';
import { Hero } from '../../domain/hero/hero.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export interface EnemyUpdateSystemParams {
  enemies: Enemy[];
  hero: Hero;
  runtime: EngineRuntime;
  bossActive: boolean;
  bossArenaGroundY: number;
  phaseDifficulty: number;
  captainAttackRange: number;
  deltaTime: number;
  randomRange: (min: number, max: number) => number;
  applyHeroDamage: (damage?: number) => void;
}

export function updateEnemiesSystem({
  enemies,
  hero,
  runtime,
  bossActive,
  bossArenaGroundY,
  phaseDifficulty,
  captainAttackRange,
  deltaTime,
  randomRange,
  applyHeroDamage,
}: EnemyUpdateSystemParams): void {
  for (const enemy of enemies) {
    if (!enemy.active) {
      enemy.respawnTimer = Math.max(0, enemy.respawnTimer - deltaTime);

      if (enemy.respawnTimer <= 0 && !bossActive) {
        respawnEnemy(enemy, phaseDifficulty, randomRange);
      }

      continue;
    }

    enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
    enemy.hoverOffset += deltaTime * (enemy.type === 'vigia' ? 1.1 : 0.9);
    enemy.shootCooldown = Math.max(0, enemy.shootCooldown - deltaTime);

    enemy.x += enemy.direction * enemy.speed * deltaTime;

    if (enemy.x <= enemy.patrolLeft) {
      enemy.x = enemy.patrolLeft;
      enemy.direction = 1;
    }

    if (enemy.x + enemy.width >= enemy.patrolRight) {
      enemy.x = enemy.patrolRight - enemy.width;
      enemy.direction = -1;
    }

    if (enemy.type === 'vigia') {
      tryFireCaptainProjectile({
        enemy,
        runtime,
        bossArenaGroundY,
        captainAttackRange,
        randomRange,
      });
    }

    if (hero.invulnerabilityTimer <= 0 && rectsOverlap(hero, enemy)) {
      applyHeroDamage(enemy.type === 'vigia' ? 18 : 12);
    }
  }
}

function respawnEnemy(
  enemy: Enemy,
  phaseDifficulty: number,
  randomRange: (min: number, max: number) => number,
): void {
  enemy.active = true;
  enemy.hp =
    enemy.type === 'vigia'
      ? 4 + Math.floor(phaseDifficulty / 2)
      : 2 + Math.floor(phaseDifficulty / 3);
  enemy.x = enemy.baseX;
  enemy.y = enemy.baseY;
  enemy.direction = -1;
  enemy.hitFlash = 0;
  enemy.hoverOffset = Math.random() * Math.PI * 2;
  enemy.shootCooldown =
    enemy.type === 'vigia'
      ? randomRange(0.55, 2.2)
      : 999;
  enemy.shotDirection = Math.random() > 0.5 ? 1 : -1;
}

function tryFireCaptainProjectile({
  enemy,
  runtime,
  bossArenaGroundY,
  captainAttackRange,
  randomRange,
}: {
  enemy: Enemy;
  runtime: EngineRuntime;
  bossArenaGroundY: number;
  captainAttackRange: number;
  randomRange: (min: number, max: number) => number;
}): void {
  if (enemy.shootCooldown > 0) {
    return;
  }

  const enemyCenterX = enemy.x + enemy.width / 2;
  const enemyCenterY = enemy.y + enemy.height / 2 - 10;
  const targetX =
    enemyCenterX +
    enemy.shotDirection * randomRange(130, captainAttackRange);
  const targetY = bossArenaGroundY - 10;
  const gravity = 980;
  const travelTime = randomRange(0.78, 0.92);
  const vx = (targetX - enemyCenterX) / travelTime;
  const vy =
    (targetY - enemyCenterY - 0.5 * gravity * travelTime * travelTime) /
    travelTime;

  const projectile: EnemyProjectile = {
    ownerX: enemyCenterX,
    ownerY: enemyCenterY,
    x: enemyCenterX,
    y: enemyCenterY,
    vx,
    vy,
    gravity,
    radius: 10,
    active: true,
    waveOffset: 0,
    amplitude: 0,
    frequency: 0,
    elapsed: 0,
    damage: 14,
  };

  runtime.enemyProjectiles.push(projectile);

  enemy.shotDirection *= -1;
  enemy.shootCooldown = randomRange(1.45, 2.05);
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
