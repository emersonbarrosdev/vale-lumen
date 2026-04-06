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
    width: enemy.type === 'vigia' ? 58 : 44,
    height: enemy.type === 'vigia' ? 72 : 50,
    speed:
      enemy.type === 'vigia'
        ? 48 + phaseData.definition.difficulty * 2
        : 84 + phaseData.definition.difficulty * 2,
    direction: -1,
    patrolLeft: enemy.patrolLeft,
    patrolRight: enemy.patrolRight,
    hp:
      enemy.type === 'vigia'
        ? 4 + Math.floor(phaseData.definition.difficulty / 2)
        : 2 + Math.floor(phaseData.definition.difficulty / 3),
    active: true,
    hitFlash: 0,
    hoverOffset: Math.random() * Math.PI * 2,
    baseX: enemy.x,
    baseY: enemy.y,
    respawnTimer: 0,
    respawnDelay: enemy.type === 'vigia' ? 42 : 33,
    shootCooldown:
      enemy.type === 'vigia'
        ? randomRange(0.55, 2.2)
        : 999,
    shotDirection: Math.random() > 0.5 ? 1 : -1,
  }));
}
