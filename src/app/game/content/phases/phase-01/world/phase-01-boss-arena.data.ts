import { BossArenaData } from '../../../../domain/world/boss-arena.model';
import { PHASE_01_GROUND_Y } from './phase-01-platforms.data';

export function getPhase01BossArena(): BossArenaData {
  return {
    startX: 5230,
    endX: 6370,
    bossX: 5880,
    groundY: PHASE_01_GROUND_Y,
    markerXs: [5460, 5790, 6120],
  };
}
