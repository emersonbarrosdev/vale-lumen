import { Hero } from '../../domain/hero/hero.model';
import { GameStateService } from '../../services/game-state.service';

export function createHero(gameState: GameStateService): Hero {
  const currentHp = Math.max(1, gameState.heroProgress.currentHp || 1);

  return {
    x: 48,
    y: 0,
    width: 34,
    height: 54,
    vx: 0,
    vy: 0,
    speed: 260,
    jumpForce: 800,
    direction: 1,
    onGround: false,

    hp: currentHp,
    maxHp: 1,

    shootCooldown: 0,
    dashCooldown: 0,
    invulnerabilityTimer: 0,
    jumpsRemaining: 2,
    maxJumps: 2,

    state: 'idle',
    animationTime: 0,

    castTimer: 0,
    castDuration: 0,
    castAim: 'forward',

    hurtTimer: 0,
    landingTimer: 0,
    name: gameState.secretFlameHairEnabled ? 'Kael Flame' : 'Kael',

    shieldActive: false,
    shieldGraceTimer: 0,

    specialCasting: false,
    megaCasting: false,
    megaVisualTimer: 0,
    aimingUp: false,
    crouching: false,

    coyoteTimer: 0,
    jumpBufferTimer: 0,
  };
}
