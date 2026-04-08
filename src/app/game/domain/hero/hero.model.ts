export type HeroState =
  | 'idle'
  | 'run'
  | 'jump'
  | 'fall'
  | 'cast'
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

  /**
   * Depois de perder o escudo, durante esse tempo
   * ele não pode perder vida.
   */
  shieldGraceTimer: number;

  /**
   * Ativo enquanto o especial comum está sendo executado.
   */
  specialCasting: boolean;

  /**
   * Ativo enquanto o super especial está sendo executado.
   */
  megaCasting: boolean;

  /**
   * Tempo visual do brilho/mudança do cabelo durante o super.
   */
  megaVisualTimer: number;

  /**
   * Mantém o herói olhando e apontando a arma para cima
   * enquanto o jogador segura a ação correspondente.
   */
  aimingUp: boolean;

  /**
   * Permite pular alguns frames após sair da borda.
   */
  coyoteTimer: number;

  /**
   * Guarda o input de pulo por poucos frames antes de tocar o chão.
   */
  jumpBufferTimer: number;
}
