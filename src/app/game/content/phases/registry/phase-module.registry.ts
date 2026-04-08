import { phase01Module } from '../phase-01';
import { phase02Module } from '../phase-02';
import { PhaseModule } from '../shared/phase-module.model';

export const PHASE_MODULE_REGISTRY: PhaseModule[] = [
  phase01Module,
  phase02Module,
];

export function getPhaseModuleById(phaseId: string): PhaseModule | null {
  const module = PHASE_MODULE_REGISTRY.find((item) => item.id === phaseId);
  return module ?? null;
}
