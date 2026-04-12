import { EngineRuntime } from './engine-runtime.model';

const INITIAL_RESPAWN_X = 48;
const INITIAL_RESPAWN_Y = 564;

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
    respawnX: INITIAL_RESPAWN_X,
    respawnY: INITIAL_RESPAWN_Y,
    respawningTimer: 0,

    bossIntroShown: false,
    bossIntroPending: false,
    lastInputSource: 'keyboard',

    specialHudLabel: 'Especial',
    specialSegmentsReady: 0,
    ignitionReady: false,
    megaComboTimer: 0,
  };
}
