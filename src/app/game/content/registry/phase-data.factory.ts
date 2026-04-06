import { EnemyData } from '../../domain/enemies/enemy.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';
import { ChestData } from '../../domain/world/chest.model';
import { CollectibleData } from '../../domain/world/collectible.model';
import { PhaseDefinition } from '../../domain/world/phase-definition.model';
import {
  HazardData,
  PhasePlayableData,
  TunnelData,
} from '../../domain/world/phase-playable-data.model';
import { PlatformData } from '../../domain/world/platform.model';

export function buildPlayablePhaseData(
  definition: PhaseDefinition,
): PhasePlayableData {
  if (definition.id === 'phase-01') {
    return buildPhase01PlayableData(definition);
  }

  return buildGenericPlayablePhaseData(definition);
}

function buildPhase01PlayableData(definition: PhaseDefinition): PhasePlayableData {
  const worldWidth = 6400;
  const groundY = 620;

  const platforms: PlatformData[] = [
    // CHÃO PRINCIPAL
    { x: 0, y: 620, width: 380, height: 100 },
    { x: 560, y: 620, width: 320, height: 100 },
    { x: 1060, y: 600, width: 360, height: 120 },
    { x: 1610, y: 620, width: 320, height: 100 },
    { x: 2160, y: 620, width: 340, height: 100 },
    { x: 2720, y: 588, width: 380, height: 132 },
    { x: 3290, y: 620, width: 330, height: 100 },
    { x: 3830, y: 598, width: 360, height: 122 },
    { x: 4380, y: 620, width: 340, height: 100 },

    // transição para arena
    { x: 4910, y: 620, width: 320, height: 100 },

    // ARENA DO BOSS
    { x: 5230, y: 620, width: 1170, height: 100 },

    // PLATAFORMAS BAIXAS
    { x: 170, y: 528, width: 120, height: 24 },
    { x: 640, y: 528, width: 130, height: 24 },
    { x: 1140, y: 500, width: 138, height: 24 },
    { x: 1710, y: 528, width: 126, height: 24 },
    { x: 2250, y: 510, width: 132, height: 24 },
    { x: 2810, y: 484, width: 134, height: 24 },
    { x: 3380, y: 528, width: 130, height: 24 },
    { x: 3920, y: 500, width: 136, height: 24 },
    { x: 4470, y: 514, width: 124, height: 24 },

    // PLATAFORMAS MÉDIAS
    { x: 1210, y: 360, width: 112, height: 24 },
    { x: 2340, y: 330, width: 124, height: 24 },
    { x: 2890, y: 300, width: 124, height: 24 },
    { x: 4010, y: 324, width: 126, height: 24 },

    // PLATAFORMAS DE TRAVESSIA
    { x: 900, y: 486, width: 92, height: 20 },
    { x: 2035, y: 468, width: 94, height: 20 },
    { x: 3685, y: 462, width: 94, height: 20 },

    // PLATAFORMAS ALTAS
    { x: 1260, y: 228, width: 104, height: 22 },
    { x: 2940, y: 196, width: 108, height: 22 },
    { x: 4060, y: 212, width: 108, height: 22 },
  ];

  const enemies: EnemyData[] = [
    { type: 'errante', x: 650, y: 576, patrolLeft: 590, patrolRight: 840 },
    { type: 'errante', x: 1150, y: 556, patrolLeft: 1090, patrolRight: 1390 },
    { type: 'vigia', x: 1240, y: 291, patrolLeft: 1220, patrolRight: 1310 },

    { type: 'errante', x: 1720, y: 576, patrolLeft: 1650, patrolRight: 1890 },
    { type: 'errante', x: 2260, y: 576, patrolLeft: 2190, patrolRight: 2460 },
    { type: 'vigia', x: 2360, y: 261, patrolLeft: 2350, patrolRight: 2440 },

    { type: 'errante', x: 2820, y: 544, patrolLeft: 2750, patrolRight: 3030 },
    { type: 'vigia', x: 2910, y: 231, patrolLeft: 2900, patrolRight: 3000 },

    { type: 'errante', x: 3390, y: 576, patrolLeft: 3320, patrolRight: 3570 },
    { type: 'errante', x: 3930, y: 554, patrolLeft: 3860, patrolRight: 4150 },
    { type: 'vigia', x: 4040, y: 255, patrolLeft: 4030, patrolRight: 4120 },

    { type: 'errante', x: 4490, y: 576, patrolLeft: 4420, patrolRight: 4670 },
  ];

  const collectibles: CollectibleData[] = [
    { type: 'coin', x: 225, y: 492 },
    { type: 'coin', x: 705, y: 492 },
    { type: 'coin', x: 1210, y: 464 },
    { type: 'coin', x: 1770, y: 492 },
    { type: 'coin', x: 2310, y: 474 },
    { type: 'coin', x: 2875, y: 448 },
    { type: 'coin', x: 3445, y: 492 },
    { type: 'coin', x: 3985, y: 464 },
    { type: 'coin', x: 4530, y: 478 },

    { type: 'coin', x: 1266, y: 324 },
    { type: 'coin', x: 2402, y: 294 },
    { type: 'coin', x: 2952, y: 264 },
    { type: 'coin', x: 4073, y: 288 },

    { type: 'coin', x: 1312, y: 192 },
    { type: 'coin', x: 2994, y: 160 },
    { type: 'coin', x: 4114, y: 176 },

    { type: 'ray', x: 1268, y: 324 },
    { type: 'ray', x: 1312, y: 192 },
    { type: 'ray', x: 2408, y: 294 },
    { type: 'ray', x: 2958, y: 264 },
    { type: 'ray', x: 4114, y: 176 },

    { type: 'heart', x: 2410, y: 580 },
    { type: 'flameVial', x: 4120, y: 578 },
  ];

  const chests: ChestData[] = [
    { x: 1280, y: 200, width: 38, height: 28, rare: false },
    { x: 2978, y: 168, width: 40, height: 28, rare: false },
    { x: 4092, y: 184, width: 42, height: 30, rare: true },
  ];

  const hazards: HazardData[] = [
    { type: 'goo', x: 395, y: 642, width: 130, height: 26, damage: 20 },
    { type: 'goo', x: 895, y: 642, width: 140, height: 28, damage: 20 },
    { type: 'goo', x: 1435, y: 642, width: 155, height: 28, damage: 24 },
    { type: 'goo', x: 1945, y: 642, width: 190, height: 28, damage: 24 },
    { type: 'goo', x: 2515, y: 642, width: 190, height: 28, damage: 24 },
    { type: 'goo', x: 3115, y: 642, width: 155, height: 28, damage: 24 },
    { type: 'goo', x: 3635, y: 642, width: 175, height: 28, damage: 24 },
    { type: 'goo', x: 4205, y: 642, width: 155, height: 28, damage: 26 },
    { type: 'goo', x: 4740, y: 642, width: 150, height: 28, damage: 26 },

    { type: 'crystal', x: 1988, y: 544, width: 62, height: 76, damage: 22 },
    { type: 'crystal', x: 3070, y: 516, width: 66, height: 104, damage: 22 },
    { type: 'crystal', x: 4275, y: 532, width: 70, height: 88, damage: 24 },
  ];

  const tunnels: TunnelData[] = [
    // movido para depois do trecho inicial para não parecer uma plataforma bugada
    // e não bloquear o pulo logo no começo
    {
      x: 2140,
      width: 220,
      ceilingY: 404,
      thickness: 22,
    },
    {
      x: 4445,
      width: 210,
      ceilingY: 428,
      thickness: 22,
    },
  ];

  const bossArena: BossArenaData = {
    startX: 5230,
    endX: 6370,
    bossX: 5880,
    groundY,
    markerXs: [5460, 5790, 6120],
  };

  return {
    definition: {
      ...definition,
      worldWidth,
    },
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

function buildGenericPlayablePhaseData(
  definition: PhaseDefinition,
): PhasePlayableData {
  const worldWidth = definition.worldWidth;
  const groundY = 620;
  const platforms: PlatformData[] = [];
  const enemies: EnemyData[] = [];
  const collectibles: CollectibleData[] = [];
  const chests: ChestData[] = [];
  const hazards: HazardData[] = [];
  const tunnels: TunnelData[] = [];

  const groundSegments =
    definition.length === 'long' ? 10 : definition.length === 'medium' ? 8 : 7;

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

  collectibles.push({
    type: 'heart',
    x: Math.floor(worldWidth * 0.56),
    y: 388,
  });

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

  tunnels.push({
    x: Math.floor(worldWidth * 0.42),
    width: 190,
    ceilingY: 426,
    thickness: 22,
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
