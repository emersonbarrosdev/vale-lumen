import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import { PhasePlayableData } from '../../../domain/world/phase-playable-data.model';
import { PhaseBossRuntimeRules, PhaseRuntimeRules } from './phase-runtime-rules.model';

export interface PhaseModule {
  /**
   * id único da fase, ex: phase-01, phase-02...
   */
  id: string;

  /**
   * Monta os dados jogáveis completos da fase.
   */
  buildPlayableData: (definition: PhaseDefinition) => PhasePlayableData;

  /**
   * Regras runtime opcionais da fase.
   * Fase pronta/customizada pode fornecer.
   * Fase genérica pode omitir.
   */
  getRuntimeRules?: (definition: PhaseDefinition) => PhaseRuntimeRules;

  /**
   * Regras específicas da arena/boss.
   * Também opcionais.
   */
  getBossRuntimeRules?: () => PhaseBossRuntimeRules;
}
