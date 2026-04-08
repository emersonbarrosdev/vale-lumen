import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import { PhasePlayableData } from '../../../domain/world/phase-playable-data.model';
import { getPhase01Enemies } from './enemies/phase-01-enemies.data';
import { getPhase01BossArena } from './world/phase-01-boss-arena.data';
import { getPhase01Chests } from './world/phase-01-chests.data';
import { getPhase01Collectibles } from './world/phase-01-collectibles.data';
import { getPhase01Hazards } from './world/phase-01-hazards.data';
import {
  getPhase01Platforms,
  PHASE_01_WORLD_WIDTH,
} from './world/phase-01-platforms.data';
import { getPhase01Tunnels } from './world/phase-01-tunnels.data';

export function buildPhase01PlayableData(
  definition: PhaseDefinition,
): PhasePlayableData {
  const platforms = [...getPhase01Platforms()].sort((a, b) => a.x - b.x);
  const enemies = [...getPhase01Enemies()].sort((a, b) => a.x - b.x);
  const collectibles = [...getPhase01Collectibles()].sort((a, b) => a.x - b.x);
  const chests = [...getPhase01Chests()].sort((a, b) => a.x - b.x);
  const hazards = [...getPhase01Hazards()].sort((a, b) => a.x - b.x);

  /**
   * Atualmente a fase 1 não usa túneis.
   * Mantemos a chamada para preservar o contrato da fase
   * e facilitar uma futura reativação sem mexer na factory.
   */
  const tunnels = [...getPhase01Tunnels()].sort((a, b) => a.x - b.x);

  return {
    definition: {
      ...definition,
      worldWidth: PHASE_01_WORLD_WIDTH,
    },
    worldWidth: PHASE_01_WORLD_WIDTH,
    platforms,
    enemies,
    collectibles,
    chests,
    bossArena: getPhase01BossArena(),
    hazards,
    tunnels,
  };
}
