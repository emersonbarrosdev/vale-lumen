import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import { PhasePlayableData } from '../../../domain/world/phase-playable-data.model';
import { PhaseBossRuntimeRules, PhaseRuntimeRules } from './phase-runtime-rules.model';

export interface PhaseModule {
  id: string;
  buildPlayableData: (definition: PhaseDefinition) => PhasePlayableData;
  getRuntimeRules?: (definition: PhaseDefinition) => PhaseRuntimeRules;
  getBossRuntimeRules?: () => PhaseBossRuntimeRules;
}
