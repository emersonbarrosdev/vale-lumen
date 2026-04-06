import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import { PhasePlayableData } from '../../../domain/world/phase-playable-data.model';
import { getPhaseModuleById } from './phase-module.registry';
import { buildGenericPlayablePhaseData } from '../templates/generic-phase.playable';

export function buildPlayablePhaseData(
  definition: PhaseDefinition,
): PhasePlayableData {
  const module = getPhaseModuleById(definition.id);

  if (module) {
    return module.buildPlayableData(definition);
  }

  return buildGenericPlayablePhaseData(definition);
}
