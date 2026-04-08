import { EnemyProjectile } from '../../domain/enemies/enemy-projectile.model';
import { Enemy } from '../../domain/enemies/enemy.model';

export function updateEnemyBaseTimers(
  enemy: Enemy,
  deltaTime: number,
): void {
  enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
  enemy.hoverOffset += deltaTime * (enemy.type === 'vigia' ? 1.1 : 0.9);
  enemy.shootCooldown = Math.max(0, enemy.shootCooldown - deltaTime);
}

export function updateEnemyPatrol(
  enemy: Enemy,
  deltaTime: number,
): void {
  enemy.x += enemy.direction * enemy.speed * deltaTime;

  if (enemy.x <= enemy.patrolLeft) {
    enemy.x = enemy.patrolLeft;
    enemy.direction = 1;
  }

  if (enemy.x + enemy.width >= enemy.patrolRight) {
    enemy.x = enemy.patrolRight - enemy.width;
    enemy.direction = -1;
  }
}

export function updateEnemyRespawnTimer(
  enemy: Enemy,
  deltaTime: number,
): void {
  enemy.respawnTimer = Math.max(0, enemy.respawnTimer - deltaTime);
}

export function respawnEnemyBase(
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

export function createCaptainProjectile(params: {
  enemy: Enemy;
  bossArenaGroundY: number;
  captainAttackRange: number;
  randomRange: (min: number, max: number) => number;
}): EnemyProjectile {
  const {
    enemy,
    bossArenaGroundY,
    captainAttackRange,
    randomRange,
  } = params;

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

  return {
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
}

export function tryFireCaptainProjectileBase(params: {
  enemy: Enemy;
  runtimeEnemyProjectiles: EnemyProjectile[];
  bossArenaGroundY: number;
  captainAttackRange: number;
  randomRange: (min: number, max: number) => number;
}): void {
  const {
    enemy,
    runtimeEnemyProjectiles,
    bossArenaGroundY,
    captainAttackRange,
    randomRange,
  } = params;

  if (enemy.shootCooldown > 0) {
    return;
  }

  runtimeEnemyProjectiles.push(
    createCaptainProjectile({
      enemy,
      bossArenaGroundY,
      captainAttackRange,
      randomRange,
    }),
  );

  enemy.shotDirection *= -1;
  enemy.shootCooldown = randomRange(1.45, 2.05);
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
