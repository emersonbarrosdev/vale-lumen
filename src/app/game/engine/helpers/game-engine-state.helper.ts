import { Hero } from '../../domain/hero/hero.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export function consumeSpecialCharge(
  runtime: EngineRuntime,
  amount: number,
): void {
  runtime.specialCharge = Math.max(0, runtime.specialCharge - amount);
}

export function syncSpecialHudState(
  runtime: EngineRuntime,
): void {
  runtime.specialSegmentsReady = Math.min(
    3,
    Math.floor(runtime.specialCharge / 33.34),
  );

  if (runtime.specialCharge >= 100) {
    runtime.specialCharge = 100;
    runtime.specialSegmentsReady = 3;
    runtime.ignitionReady = true;
    runtime.specialHudLabel = 'Super Especial';
    return;
  }

  runtime.ignitionReady = false;
  runtime.specialHudLabel = 'Especial';
}

export function resetHeroTransientCombatState(
  hero: Hero,
  runtime: EngineRuntime,
): void {
    hero.castTimer = 0;
    hero.castDuration = 0;
    hero.castAim = 'forward';
    hero.hurtTimer = 0;
    hero.invulnerabilityTimer = 0;
    hero.shieldActive = false;
    hero.shieldGraceTimer = 0;
    hero.specialCasting = false;
    hero.megaCasting = false;
    hero.megaVisualTimer = 0;
    hero.aimingUp = false;
    hero.coyoteTimer = 0;
    hero.jumpBufferTimer = 0;

    runtime.bullets = [];
    runtime.bossProjectiles = [];
    runtime.enemyProjectiles = [];
    runtime.specialExplosions = [];
    runtime.specialStrikes = [];
    runtime.megaComboTimer = 0;
}
