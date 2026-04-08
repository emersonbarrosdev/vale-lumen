import { buildPhase02PlayableData } from './phase-02.playable';
import { PhaseModule } from '../shared/phase-module.model';

export { buildPhase02PlayableData } from './phase-02.playable';

export const phase02Module: PhaseModule = {
  id: 'phase-02',
  buildPlayableData: buildPhase02PlayableData,
};
