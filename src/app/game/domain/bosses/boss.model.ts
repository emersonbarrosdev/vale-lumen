export interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  active: boolean;
  jumpCooldown: number;
  secondaryCooldown: number;
  vy: number;
  onGround: boolean;
  hitFlash: number;
  introPulse: number;
  castTimer: number;
  armSwing: number;
  squashTimer: number;
  special50Used: boolean;
  special15Used: boolean;
}
