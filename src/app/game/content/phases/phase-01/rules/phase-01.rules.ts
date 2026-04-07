import { PhaseDefinition } from '../../../../domain/world/phase-definition.model';
import { PhaseRuntimeRules } from '../../shared/phase-runtime-rules.model';
import { PHASE_01_WORLD_WIDTH } from '../world/phase-01-platforms.data';

export function getPhase01RuntimeRules(
  definition: PhaseDefinition,
): PhaseRuntimeRules {
  void definition;

  return {
    worldWidth: PHASE_01_WORLD_WIDTH,
    checkpointXs: [180, 1760, 3220, 5340, 6900, 8600, 10020, 11480, 12110],
    scoreStepDistance: 240,
    scorePerStep: 15,
    heroFallDeathOffset: 260,
  };
}
