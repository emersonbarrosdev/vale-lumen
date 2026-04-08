export type HeroState =
  | 'idle'
  | 'run'
  | 'jump'
  | 'fall'
  | 'cast'
  | 'crouch'
  | 'hurt';

export type HeroCastAim = 'forward' | 'up';

export interface Hero {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  speed: number;
  jumpForce: number;
  direction: 1 | -1;
  onGround: boolean;

  hp: number;
  maxHp: number;

  shootCooldown: number;
  dashCooldown: number;
  invulnerabilityTimer: number;
  jumpsRemaining: number;
  maxJumps: number;

  state: HeroState;
  animationTime: number;

  castTimer: number;
  castDuration: number;
  castAim: HeroCastAim;

  hurtTimer: number;
  landingTimer: number;
  name: string;

  shieldActive: boolean;

  shieldGraceTimer: number;

  specialCasting: boolean;
  megaCasting: boolean;
  megaVisualTimer: number;

  aimingUp: boolean;
  crouching: boolean;

  coyoteTimer: number;
  jumpBufferTimer: number;
}
