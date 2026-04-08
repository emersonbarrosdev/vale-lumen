import { PhaseDefinition } from '../../../../domain/world/phase-definition.model';
import { PhaseRuntimeRules } from '../../shared/phase-runtime-rules.model';
import { PHASE_01_WORLD_WIDTH } from '../world/phase-01-platforms.data';

export function getPhase01RuntimeRules(
  definition: PhaseDefinition,
): PhaseRuntimeRules {
  void definition;

  return {
    worldWidth: PHASE_01_WORLD_WIDTH,
    checkpointXs: [
      /**
       * primeiro checkpoint mais à frente:
       * - vida escondida fica realmente fora da tela
       * - evita snap inicial esquisito
       */
      420,
      1880,
      3340,
      4480,
      5940,
      7480,
      9760,
      11100,
      12140,
    ],
    scoreStepDistance: 240,
    scorePerStep: 15,
    heroFallDeathOffset: 260,
  };
}
