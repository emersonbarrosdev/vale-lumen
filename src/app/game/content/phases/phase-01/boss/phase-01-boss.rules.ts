export interface PhaseBossRuntimeRules {
  arenaTriggerOffset: number;
  heroArenaLeftOffset: number;
  heroArenaRightOffset: number;
}

export function getPhase01BossRuntimeRules(): PhaseBossRuntimeRules {
  return {
    arenaTriggerOffset: 260,
    heroArenaLeftOffset: 200,
    heroArenaRightOffset: 24,
  };
}
