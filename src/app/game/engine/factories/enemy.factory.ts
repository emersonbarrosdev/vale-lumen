import { Enemy } from '../../domain/enemies/enemy.model';
import { PhasePlayableData } from '../../domain/world/phase-playable-data.model';

export function createEnemies(
  phaseData: PhasePlayableData,
  randomRange: (min: number, max: number) => number,
): Enemy[] {
  return phaseData.enemies.map((enemy) => ({
    type: enemy.type,
    x: enemy.x,
    y: enemy.y,
    width: getEnemyWidth(enemy.type),
    height: getEnemyHeight(enemy.type),
    speed: getEnemySpeed(enemy.type, phaseData.definition.difficulty),
    direction: -1,
    patrolLeft: enemy.patrolLeft,
    patrolRight: enemy.patrolRight,
    hp: getEnemyHp(enemy.type, phaseData.definition.difficulty),
    active: true,
    hitFlash: 0,
    hoverOffset: Math.random() * Math.PI * 2,
    baseX: enemy.x,
    baseY: enemy.y,
    respawnTimer: 0,
    respawnDelay: getEnemyRespawnDelay(enemy.type),
    shootCooldown:
      enemy.type === 'vigia'
        ? randomRange(0.55, 2.2)
        : 999,
    shotDirection: Math.random() > 0.5 ? 1 : -1,
  }));
}

function getEnemyWidth(type: Enemy['type']): number {
  switch (type) {
    case 'vigia':
      return 58;
    case 'corvoCorrompido':
      return 38;
    case 'gosmaPequena':
      return 68;
    case 'errante':
    default:
      return 44;
  }
}

function getEnemyHeight(type: Enemy['type']): number {
  switch (type) {
    case 'vigia':
      return 72;
    case 'corvoCorrompido':
      return 28;
    case 'gosmaPequena':
      return 30;
    case 'errante':
    default:
      return 50;
  }
}

function getEnemySpeed(
  type: Enemy['type'],
  difficulty: number,
): number {
  switch (type) {
    case 'vigia':
      return 48 + difficulty * 2;
    case 'corvoCorrompido':
      return 88 + difficulty * 2;
    case 'gosmaPequena':
      return 22;
    case 'errante':
    default:
      return 84 + difficulty * 2;
  }
}

function getEnemyHp(
  type: Enemy['type'],
  difficulty: number,
): number {
  switch (type) {
    case 'vigia':
      return 4 + Math.floor(difficulty / 2);
    case 'corvoCorrompido':
      return 1;
    case 'gosmaPequena':
      return 2;
    case 'errante':
    default:
      return 2 + Math.floor(difficulty / 3);
  }
}

function getEnemyRespawnDelay(type: Enemy['type']): number {
  switch (type) {
    case 'vigia':
      return 42;
    case 'corvoCorrompido':
      return 26;
    case 'gosmaPequena':
      return 30;
    case 'errante':
    default:
      return 33;
  }
}
