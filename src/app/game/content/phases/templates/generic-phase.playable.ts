import { EnemyData } from '../../../domain/enemies/enemy.model';
import { BossArenaData } from '../../../domain/world/boss-arena.model';
import { ChestData } from '../../../domain/world/chest.model';
import { CollectibleData } from '../../../domain/world/collectible.model';
import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import {
  HazardData,
  PhasePlayableData,
  TunnelData,
} from '../../../domain/world/phase-playable-data.model';
import { PlatformData } from '../../../domain/world/platform.model';

export function buildGenericPlayablePhaseData(
  definition: PhaseDefinition,
): PhasePlayableData {
  const worldWidth = definition.worldWidth;
  const groundY = 620;

  const platforms: PlatformData[] = [];
  const enemies: EnemyData[] = [];
  const collectibles: CollectibleData[] = [];
  const chests: ChestData[] = [];
  const hazards: HazardData[] = [];

  /**
   * Mantido vazio por enquanto:
   * túneis foram desativados globalmente até existir
   * um visual/gameplay realmente correto para eles.
   */
  const tunnels: TunnelData[] = [];

  const groundSegments =
    definition.length === 'long'
      ? 10
      : definition.length === 'medium'
        ? 8
        : 7;

  let cursorX = 0;

  for (let index = 0; index < groundSegments; index += 1) {
    const width = 220 + (index % 3) * 34;
    const y =
      index % 4 === 1
        ? 604
        : index % 4 === 2
          ? 620
          : index % 4 === 3
            ? 590
            : 620;

    platforms.push({
      x: cursorX,
      y,
      width,
      height: 100 + (620 - y),
    });

    if (index < groundSegments - 1) {
      const gapWidth = index % 3 === 0 ? 96 : index % 3 === 1 ? 148 : 210;

      /**
       * Para gaps médios/grandes, cria apoio intermediário
       * e mantém o perigo no fundo do vão.
       */
      if (gapWidth >= 140) {
        platforms.push({
          x: cursorX + width + Math.floor(gapWidth / 2) - 42,
          y: y - 112,
          width: 84,
          height: 20,
        });

        hazards.push({
          type: index % 2 === 0 ? 'goo' : 'crystal',
          x: cursorX + width + 18,
          y: 642,
          width: Math.max(68, gapWidth - 36),
          height: 28,
          damage: 22,
        });
      }

      cursorX += width + gapWidth;
    }
  }

  const platformCount = definition.length === 'long' ? 9 : 7;
  const elevatedSpacing = Math.floor((worldWidth - 1000) / platformCount);

  for (let index = 0; index < platformCount; index += 1) {
    const x = 180 + index * elevatedSpacing;
    const y = 520 - (index % 3) * 54;
    const width = 130 + (index % 2) * 18;

    platforms.push({
      x,
      y,
      width,
      height: 24,
    });

    if (index % 2 === 1) {
      platforms.push({
        x: x + 38,
        y: y - 96,
        width: 102,
        height: 22,
      });
    }

    if (index < platformCount - 1) {
      enemies.push({
        type: index % 2 === 0 ? 'errante' : 'vigia',
        x: x + 34,
        y: y - 44,
        patrolLeft: x,
        patrolRight: x + width,
      });
    }

    collectibles.push({
      type: 'coin',
      x: x + width / 2,
      y: y - 24,
    });

    if (index % 2 === 1) {
      collectibles.push({
        type: 'ray',
        x: x + width - 22,
        y: y - 26,
      });
    }
  }

  /**
   * Itens básicos de progressão
   */
  collectibles.push({
    type: 'shieldOrb',
    x: 120,
    y: 560,
  });

  collectibles.push({
    type: 'heart',
    x: Math.floor(worldWidth * 0.56),
    y: 388,
  });

  /**
   * Baús sempre em pontos elevados ou claramente de recompensa.
   * Nada de baú perdido no chão por padrão.
   */
  chests.push({
    x: Math.floor(worldWidth * 0.34),
    y: 286,
    width: 40,
    height: 28,
    rare: false,
  });

  chests.push({
    x: Math.floor(worldWidth * 0.72),
    y: 246,
    width: 42,
    height: 30,
    rare: true,
  });

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
    hazards,
    tunnels,
  };
}
