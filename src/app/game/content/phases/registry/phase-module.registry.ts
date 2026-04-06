import { PhaseModule } from '../shared/phase-module.model';
import { phase01Module } from '../phase-01';

export const PHASE_MODULE_REGISTRY: PhaseModule[] = [
  phase01Module,
];

export function getPhaseModuleById(phaseId: string): PhaseModule | null {
  const module = PHASE_MODULE_REGISTRY.find((item) => item.id === phaseId);
  return module ?? null;
}
