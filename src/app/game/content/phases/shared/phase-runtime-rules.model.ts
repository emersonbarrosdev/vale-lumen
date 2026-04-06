export interface PhaseRuntimeRules {
  worldWidth: number;
  checkpointXs: number[];
  scoreStepDistance: number;
  scorePerStep: number;
  heroFallDeathOffset: number;
}

export interface PhaseBossRuntimeRules {
  arenaTriggerOffset: number;
  heroArenaLeftOffset: number;
  heroArenaRightOffset: number;
}
