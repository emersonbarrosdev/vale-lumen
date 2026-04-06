import { BossProjectile } from '../../domain/bosses/boss-projectile.model';
import { BurstParticle } from '../../domain/combat/burst-particle.model';
import { Bullet } from '../../domain/combat/bullet.model';
import { SpecialStrike } from '../../domain/combat/special-strike.model';
import { EnemyProjectile } from '../../domain/enemies/enemy-projectile.model';
import { InputSourceType } from '../../domain/input/input-action.model';

export interface EngineRuntime {
  cameraX: number;
  bullets: Bullet[];
  bossProjectiles: BossProjectile[];
  enemyProjectiles: EnemyProjectile[];
  specialStrikes: SpecialStrike[];
  burstParticles: BurstParticle[];

  score: number;
  specialCharge: number;
  paused: boolean;
  furthestScoreStep: number;
  specialFlashTimer: number;
  specialSequenceActive: boolean;
  specialPulseTimer: number;
  specialPulsesRemaining: number;
  bossAttackPatternIndex: number;
  ending: 'game-over' | 'victory' | null;
  endingTimer: number;

  lives: number;
  collectedCoins: number;
  collectedSparks: number;

  checkpointXs: number[];
  checkpointIndex: number;
  respawnX: number;
  respawnY: number;
  respawningTimer: number;

  bossIntroShown: boolean;
  bossIntroPending: boolean;
  lastInputSource: InputSourceType;
}
