import { GameStateService } from '../../services/game-state.service';
import { Hero } from '../../domain/hero/hero.model';

export function createHero(gameState: GameStateService): Hero {
  return {
    x: 48,
    y: 0,
    width: 48,
    height: 72,
    vx: 0,
    vy: 0,
    speed: 275,
    jumpForce: 770,
    direction: 1,
    onGround: false,
    hp: gameState.heroProgress.currentHp,
    maxHp: gameState.heroProgress.maxHp,
    shootCooldown: 0,
    dashCooldown: 0,
    invulnerabilityTimer: 0,
    jumpsRemaining: 2,
    maxJumps: 2,
    state: 'fall',
    animationTime: 0,
    castTimer: 0,
    castDuration: 0,
    castAim: 'forward',
    hurtTimer: 0,
    landingTimer: 0,
    name: 'Kael',
  };
}
