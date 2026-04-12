import { Enemy } from '../../domain/enemies/enemy.model';
import { Hero } from '../../domain/hero/hero.model';
import { Platform } from '../../domain/world/platform.model';
import {
  findGroundBelowEnemy,
  rectsOverlap,
  respawnEnemyBase,
  tryFireCaptainProjectileBase,
  updateEnemyBaseTimers,
  updateEnemyPatrol,
  updateEnemyRespawnTimer,
  updateGroundEnemyPatrolWithEdgeCheck,
} from '../helpers/enemy-runtime.helper';
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
  platforms?: Platform[];
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
  platforms = [],
}: EnemyUpdateSystemParams): void {
  for (const enemy of enemies) {
    if (!enemy.active) {
      handleInactiveEnemy({
        enemy,
        bossActive,
        phaseDifficulty,
        deltaTime,
        randomRange,
      });
      continue;
    }

    handleActiveEnemy({
      enemy,
      hero,
      runtime,
      bossArenaGroundY,
      captainAttackRange,
      deltaTime,
      randomRange,
      applyHeroDamage,
      platforms,
    });
  }
}

function handleInactiveEnemy(params: {
  enemy: Enemy;
  bossActive: boolean;
  phaseDifficulty: number;
  deltaTime: number;
  randomRange: (min: number, max: number) => number;
}): void {
  const {
    enemy,
    bossActive,
    phaseDifficulty,
    deltaTime,
    randomRange,
  } = params;

  updateEnemyRespawnTimer(enemy, deltaTime);

  if (enemy.respawnTimer <= 0 && !bossActive) {
    respawnEnemyBase(enemy, phaseDifficulty, randomRange);
  }
}

function handleActiveEnemy(params: {
  enemy: Enemy;
  hero: Hero;
  runtime: EngineRuntime;
  bossArenaGroundY: number;
  captainAttackRange: number;
  deltaTime: number;
  randomRange: (min: number, max: number) => number;
  applyHeroDamage: (damage?: number) => void;
  platforms: Platform[];
}): void {
  const {
    enemy,
    hero,
    runtime,
    bossArenaGroundY,
    captainAttackRange,
    deltaTime,
    randomRange,
    applyHeroDamage,
    platforms,
  } = params;

  updateEnemyBaseTimers(enemy, deltaTime);

  if (enemy.type === 'gosmaPequena') {
    enemy.speed = 22;
    updateGroundEnemyPatrolWithEdgeCheck(enemy, deltaTime, platforms);

    const ground = findGroundBelowEnemy(enemy, platforms);
    if (ground) {
      enemy.y = ground.y - enemy.height;
    }
  } else if (enemy.type === 'errante') {
    updateGroundEnemyPatrolWithEdgeCheck(enemy, deltaTime, platforms);

    const ground = findGroundBelowEnemy(enemy, platforms);
    if (ground) {
      enemy.y = ground.y - enemy.height;
    }
  } else {
    updateEnemyPatrol(enemy, deltaTime);
  }

  if (enemy.type === 'vigia') {
    tryFireCaptainProjectileBase({
      enemy,
      runtimeEnemyProjectiles: runtime.enemyProjectiles,
      bossArenaGroundY,
      captainAttackRange,
      randomRange,
    });
  }

  if (hero.invulnerabilityTimer <= 0 && rectsOverlap(hero, enemy)) {
    applyHeroDamage(enemy.type === 'vigia' ? 18 : 12);
  }
}
