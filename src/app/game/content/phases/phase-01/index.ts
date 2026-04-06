import { PhaseModule } from '../shared/phase-module.model';
import { buildPhase01PlayableData } from './phase-01.playable';
import { getPhase01BossRuntimeRules } from './boss/phase-01-boss.rules';
import { getPhase01RuntimeRules } from './rules/phase-01.rules';

export { buildPhase01PlayableData } from './phase-01.playable';

export { getPhase01Enemies } from './enemies/phase-01-enemies.data';

export { getPhase01BossRuntimeRules } from './boss/phase-01-boss.rules';

export { getPhase01RuntimeRules } from './rules/phase-01.rules';

export { getPhase01BossArena } from './world/phase-01-boss-arena.data';
export { getPhase01Chests } from './world/phase-01-chests.data';
export { getPhase01Collectibles } from './world/phase-01-collectibles.data';
export { getPhase01Hazards } from './world/phase-01-hazards.data';
export {
  getPhase01Platforms,
  PHASE_01_GROUND_Y,
  PHASE_01_WORLD_WIDTH,
} from './world/phase-01-platforms.data';
export { getPhase01Tunnels } from './world/phase-01-tunnels.data';

export const phase01Module: PhaseModule = {
  id: 'phase-01',
  buildPlayableData: buildPhase01PlayableData,
  getRuntimeRules: getPhase01RuntimeRules,
  getBossRuntimeRules: getPhase01BossRuntimeRules,
};
