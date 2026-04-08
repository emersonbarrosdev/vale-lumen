import { PhaseDefinition } from '../../../domain/world/phase-definition.model';
import {
  PhaseBossRuntimeRules,
  PhaseRuntimeRules,
} from '../shared/phase-runtime-rules.model';
import { getPhaseModuleById } from './phase-module.registry';

const DEFAULT_RUNTIME_RULES: PhaseRuntimeRules = {
  worldWidth: 5600,
  checkpointXs: [48, 820, 1780, 2920, 4040],
  scoreStepDistance: 220,
  scorePerStep: 15,
  heroFallDeathOffset: 260,
};

const DEFAULT_BOSS_RUNTIME_RULES: PhaseBossRuntimeRules = {
  arenaTriggerOffset: 260,
  heroArenaLeftOffset: 200,
  heroArenaRightOffset: 24,
};

export function getPhaseRuntimeRules(
  definition: PhaseDefinition,
): PhaseRuntimeRules {
  const module = getPhaseModuleById(definition.id);

  /**
   * Fase customizada usa suas próprias rules.
   * Fase ainda genérica usa fallback padrão.
   */
  return module?.getRuntimeRules?.(definition) ?? DEFAULT_RUNTIME_RULES;
}

export function getPhaseBossRuntimeRules(
  definition: PhaseDefinition,
): PhaseBossRuntimeRules {
  const module = getPhaseModuleById(definition.id);

  /**
   * Mantém regras mínimas de arena mesmo para fases
   * ainda não customizadas.
   */
  return module?.getBossRuntimeRules?.() ?? DEFAULT_BOSS_RUNTIME_RULES;
}
