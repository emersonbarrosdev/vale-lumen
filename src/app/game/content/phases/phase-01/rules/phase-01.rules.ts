import { PhaseDefinition } from '../../../../domain/world/phase-definition.model';
import { PhaseRuntimeRules } from '../../shared/phase-runtime-rules.model';
import { PHASE_01_WORLD_WIDTH } from '../world/phase-01-platforms.data';

export function getPhase01RuntimeRules(
  definition: PhaseDefinition,
): PhaseRuntimeRules {
  void definition;

  return {
    worldWidth: PHASE_01_WORLD_WIDTH,
    checkpointXs: [48, 820, 1780, 2920, 4040, 4910],
    scoreStepDistance: 220,
    scorePerStep: 15,
    heroFallDeathOffset: 260,
  };
}
