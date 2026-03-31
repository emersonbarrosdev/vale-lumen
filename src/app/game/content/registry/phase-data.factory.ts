import { EnemyData } from '../../domain/enemies/enemy.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';
import { ChestData } from '../../domain/world/chest.model';
import { CollectibleData } from '../../domain/world/collectible.model';
import { PhaseDefinition } from '../../domain/world/phase-definition.model';
import { PhasePlayableData } from '../../domain/world/phase-playable-data.model';
import { PlatformData } from '../../domain/world/platform.model';

export function buildPlayablePhaseData(definition: PhaseDefinition): PhasePlayableData {
  const worldWidth = definition.worldWidth;
  const groundY = 620;
  const platforms: PlatformData[] = [];
  const enemies: EnemyData[] = [];
  const collectibles: CollectibleData[] = [];
  const chests: ChestData[] = [];

  platforms.push({
    x: 0,
    y: groundY,
    width: worldWidth,
    height: 100,
  });

  const platformCount = definition.length === 'long' ? 10 : definition.length === 'medium' ? 8 : 6;
  const spacing = Math.floor((worldWidth - 900) / platformCount);

  for (let index = 0; index < platformCount; index += 1) {
    const x = 380 + index * spacing;
    const y = 520 - (index % 3) * 70 - definition.difficulty * 4;
    const width = 170 + (index % 2) * 25;

    platforms.push({
      x,
      y,
      width,
      height: 24,
    });

    if (index < platformCount - 1) {
      enemies.push({
        type: index % 2 === 0 ? 'errante' : 'vigia',
        x: x + 35,
        y: y - 44,
        patrolLeft: x,
        patrolRight: x + width,
      });
    }

    collectibles.push({
      type: 'coin',
      x: x + width / 2,
      y: y - 25,
    });

    if (index % 2 === 1) {
      collectibles.push({
        type: 'ray',
        x: x + width - 30,
        y: y - 28,
      });
    }
  }

  collectibles.push({
    type: 'heart',
    x: Math.floor(worldWidth * 0.58),
    y: 395,
  });

  const chestBaseX = Math.floor(worldWidth * 0.38);
  chests.push({
    x: chestBaseX,
    y: 285,
    width: 40,
    height: 28,
    rare: false,
  });

  chests.push({
    x: chestBaseX + 980,
    y: 245,
    width: 42,
    height: 30,
    rare: true,
  });

  if (definition.length === 'long') {
    chests.push({
      x: chestBaseX + 1820,
      y: 215,
      width: 42,
      height: 30,
      rare: true,
    });
  }

  const bossArena: BossArenaData = {
    startX: worldWidth - 860,
    endX: worldWidth - 120,
    bossX: worldWidth - 420,
    groundY,
    markerXs: [worldWidth - 730, worldWidth - 510, worldWidth - 310],
  };

  return {
    definition,
    worldWidth,
    platforms,
    enemies,
    collectibles,
    chests,
    bossArena,
  };
}
