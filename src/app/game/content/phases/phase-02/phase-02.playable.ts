import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import { PhasePlayableData } from '../../../domain/world/phase-playable-data.model';
import { buildGenericPlayablePhaseData } from '../templates/generic-phase.playable';

/**
 * Fase 2 registrada de forma isolada e limpa.
 * Por enquanto usa o template genérico, sem misturar nada da fase 1.
 * Depois a gente substitui pelos arquivos próprios:
 * - boss/
 * - enemies/
 * - rules/
 * - world/
 */
export function buildPhase02PlayableData(
  definition: PhaseDefinition,
): PhasePlayableData {
  return buildGenericPlayablePhaseData(definition);
}
