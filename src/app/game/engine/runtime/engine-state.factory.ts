import { EngineRuntime } from './engine-runtime.model';

export function createInitialEngineRuntime(): EngineRuntime {
  return {
    cameraX: 0,
    bullets: [],
    bossProjectiles: [],
    enemyProjectiles: [],
    specialStrikes: [],
    specialExplosions: [],
    burstParticles: [],

    score: 0,
    specialCharge: 0,
    paused: false,
    furthestScoreStep: 0,
    specialFlashTimer: 0,
    specialSequenceActive: false,
    specialPulseTimer: 0,
    specialPulsesRemaining: 0,
    bossAttackPatternIndex: 0,
    ending: null,
    endingTimer: 0,

    lives: 3,
    collectedCoins: 0,
    collectedSparks: 0,

    checkpointXs: [],
    checkpointIndex: 0,
    respawnX: 48,
    respawnY: 0,
    respawningTimer: 0,

    bossIntroShown: false,
    bossIntroPending: false,
    lastInputSource: 'keyboard',
  };
}
