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
       * checkpoint inicial já fora do spawn bruto
       */
      420,

      /**
       * progressão principal da fase
       */
      1880,
      3340,
      4480,
      5940,
      7480,
      9760,

      /**
       * trecho final antes da subida alta
       */
      11020,

      /**
       * checkpoint final mais seguro:
       * fica em chão firme da pré-arena,
       * longe da borda e antes do gatilho do boss.
       */
      11940,
    ],
    scoreStepDistance: 240,
    scorePerStep: 15,
    heroFallDeathOffset: 260,
  };
}
