import { BossArenaData } from '../../../../domain/world/boss-arena.model';
import { PHASE_01_GROUND_Y } from './phase-01-platforms.data';

export function getPhase01BossArena(): BossArenaData {
  return {
    startX: 12010,
    endX: 12770,
    bossX: 12460,
    groundY: PHASE_01_GROUND_Y,
    markerXs: [12190, 12440, 12620],
  };
}
