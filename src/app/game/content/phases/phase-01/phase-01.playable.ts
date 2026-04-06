import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import { PhasePlayableData } from '../../../domain/world/phase-playable-data.model';
import { getPhase01BossArena } from './world/phase-01-boss-arena.data';
import { getPhase01Chests } from './world/phase-01-chests.data';
import { getPhase01Collectibles } from './world/phase-01-collectibles.data';
import { getPhase01Hazards } from './world/phase-01-hazards.data';
import { getPhase01Platforms, PHASE_01_WORLD_WIDTH } from './world/phase-01-platforms.data';
import { getPhase01Tunnels } from './world/phase-01-tunnels.data';
import { getPhase01Enemies } from './enemies/phase-01-enemies.data';

export function buildPhase01PlayableData(
  definition: PhaseDefinition,
): PhasePlayableData {
  return {
    definition: {
      ...definition,
      worldWidth: PHASE_01_WORLD_WIDTH,
    },
    worldWidth: PHASE_01_WORLD_WIDTH,
    platforms: getPhase01Platforms(),
    enemies: getPhase01Enemies(),
    collectibles: getPhase01Collectibles(),
    chests: getPhase01Chests(),
    bossArena: getPhase01BossArena(),
    hazards: getPhase01Hazards(),
    tunnels: getPhase01Tunnels(),
  };
}
