import { Enemy } from '../../domain/enemies/enemy.model';
import { Hero } from '../../domain/hero/hero.model';
import {
  rectsOverlap,
  respawnEnemyBase,
  tryFireCaptainProjectileBase,
  updateEnemyBaseTimers,
  updateEnemyPatrol,
  updateEnemyRespawnTimer,
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
  } = params;

  updateEnemyBaseTimers(enemy, deltaTime);
  updateEnemyPatrol(enemy, deltaTime);

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
