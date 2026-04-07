import { PhaseDefinition } from '../../../../domain/world/phase-definition.model';
import { PhaseRuntimeRules } from '../../shared/phase-runtime-rules.model';
import { PHASE_01_WORLD_WIDTH } from '../world/phase-01-platforms.data';

export function getPhase01RuntimeRules(
  definition: PhaseDefinition,
): PhaseRuntimeRules {
  void definition;

  return {
    worldWidth: PHASE_01_WORLD_WIDTH,
    checkpointXs: [48, 980, 2140, 3560, 5180, 6940, 8720, 10440, 11690],
    scoreStepDistance: 220,
    scorePerStep: 15,
    heroFallDeathOffset: 260,
  };
}
