import { InputManager } from './input-manager';
import {
  BossArenaData,
  CollectibleData,
  PlatformData,
  PhaseOneScene,
} from '../scenes/phase-one.scene';
import { GameStateService } from '../services/game-state.service';

interface EngineCallbacks {
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
}

interface Platform extends PlatformData {}

type HeroState = 'idle' | 'run' | 'jump' | 'fall' | 'cast' | 'hurt';

interface Hero {
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
  hurtTimer: number;
  landingTimer: number;
  name: string;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  active: boolean;
}

interface Enemy {
  type: 'errante' | 'vigia';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1;
  patrolLeft: number;
  patrolRight: number;
  hp: number;
  active: boolean;
  hitFlash: number;
}

interface Collectible extends CollectibleData {
  width: number;
  height: number;
  collected: boolean;
}

interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  active: boolean;
  attackCooldown: number;
  secondaryCooldown: number;
  jumpCooldown: number;
  vy: number;
  onGround: boolean;
  hitFlash: number;
  airShotsRemaining: number;
  airShotCooldown: number;
}

interface FallingProjectile {
  x: number;
  y: number;
  vy: number;
  vx: number;
  radius: number;
  active: boolean;
  horizontal: boolean;
  dark: boolean;
}

interface SpecialWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  lineWidth: number;
  life: number;
  maxLife: number;
}

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly input = new InputManager();
  private readonly callbacks: EngineCallbacks;
  private readonly gameState: GameStateService;

  private animationFrameId = 0;
  private lastTime = 0;

  private readonly gravity = 2350;
  private readonly fallBoost = 1350;

  private readonly worldWidth: number;
  private readonly platforms: Platform[];
  private readonly enemies: Enemy[];
  private readonly collectibles: Collectible[];
  private readonly bossArena: BossArenaData;

  private readonly hero: Hero = {
    x: 120,
    y: 500,
    width: 44,
    height: 64,
    vx: 0,
    vy: 0,
    speed: 270,
    jumpForce: 760,
    direction: 1,
    onGround: false,
    hp: 3,
    maxHp: 3,
    shootCooldown: 0,
    dashCooldown: 0,
    invulnerabilityTimer: 0,
    jumpsRemaining: 2,
    maxJumps: 2,
    state: 'fall',
    animationTime: 0,
    castTimer: 0,
    hurtTimer: 0,
    landingTimer: 0,
    name: 'Kael',
  };

  private readonly boss: Boss = {
    x: 0,
    y: 0,
    width: 120,
    height: 160,
    hp: 34,
    maxHp: 34,
    active: false,
    attackCooldown: 2.5,
    secondaryCooldown: 3.8,
    jumpCooldown: 3.2,
    vy: 0,
    onGround: true,
    hitFlash: 0,
    airShotsRemaining: 0,
    airShotCooldown: 0,
  };

  private cameraX = 0;
  private bullets: Bullet[] = [];
  private fallingProjectiles: FallingProjectile[] = [];
  private specialWaves: SpecialWave[] = [];

  private score = 0;
  private sparks = 0;
  private specialThreshold = 5;
  private paused = false;
  private furthestScoreStep = 0;

  private specialFlashTimer = 0;
  private specialSequenceActive = false;
  private specialPulseTimer = 0;
  private specialPulsesRemaining = 0;

  private ending: 'game-over' | 'victory' | null = null;
  private endingTimer = 0;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gameState: GameStateService,
    callbacks: EngineCallbacks,
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.gameState = gameState;
    this.callbacks = callbacks;

    const phase = PhaseOneScene.build();
    this.worldWidth = phase.worldWidth;
    this.platforms = phase.platforms;
    this.bossArena = phase.bossArena;

    this.boss.x = this.bossArena.bossX;
    this.boss.y = this.bossArena.groundY - this.boss.height;

    this.enemies = phase.enemies.map((enemy) => ({
      type: enemy.type,
      x: enemy.x,
      y: enemy.type === 'vigia' ? 558 : 576,
      width: enemy.type === 'vigia' ? 52 : 38,
      height: enemy.type === 'vigia' ? 62 : 44,
      speed: enemy.type === 'vigia' ? 60 : 88,
      direction: -1,
      patrolLeft: enemy.patrolLeft,
      patrolRight: enemy.patrolRight,
      hp: enemy.type === 'vigia' ? 4 : 2,
      active: true,
      hitFlash: 0,
    }));

    this.collectibles = phase.collectibles.map((item) => ({
      ...item,
      width: item.type === 'coin' ? 18 : 20,
      height: item.type === 'coin' ? 18 : 20,
      collected: false,
    }));
  }

  start(): void {
    this.input.attach();
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.input.detach();
  }

  private readonly loop = (time: number): void => {
    const deltaTime = Math.min((time - this.lastTime) / 1000, 0.032);
    this.lastTime = time;

    this.update(deltaTime);
    this.render();

    this.input.endFrame();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number): void {
    if (this.ending) {
      this.endingTimer -= deltaTime;

      if (this.endingTimer <= 0) {
        if (this.ending === 'game-over') {
          this.callbacks.onGameOver(this.score);
        } else {
          this.callbacks.onVictory(this.score);
        }
      }

      return;
    }

    if (this.input.isJustPressed('escape')) {
      this.paused = !this.paused;
    }

    if (this.paused) {
      return;
    }

    this.gameState.setCurrentScore(this.score);

    this.updateHero(deltaTime);
    this.updateProgressScore();
    this.updateBullets(deltaTime);
    this.updateEnemies(deltaTime);
    this.updateCollectibles();
    this.updateBoss(deltaTime);
    this.updateFallingProjectiles(deltaTime);
    this.updateSpecialSequence(deltaTime);
    this.updateSpecialWaves(deltaTime);
    this.updateCamera();

    if (this.specialFlashTimer > 0) {
      this.specialFlashTimer = Math.max(0, this.specialFlashTimer - deltaTime);
    }

    if (this.hero.hp <= 0) {
      this.startEnding('game-over');
    }

    if (this.boss.active && this.boss.hp <= 0) {
      this.score += 1000;
      this.startEnding('victory');
    }
  }

  private updateProgressScore(): void {
    const scoreStep = Math.floor(this.hero.x / 220);

    if (scoreStep > this.furthestScoreStep) {
      this.score += (scoreStep - this.furthestScoreStep) * 15;
      this.furthestScoreStep = scoreStep;
    }
  }

  private updateHero(deltaTime: number): void {
    const wasOnGround = this.hero.onGround;

    this.hero.animationTime += deltaTime;
    this.hero.shootCooldown = Math.max(0, this.hero.shootCooldown - deltaTime);
    this.hero.dashCooldown = Math.max(0, this.hero.dashCooldown - deltaTime);
    this.hero.invulnerabilityTimer = Math.max(
      0,
      this.hero.invulnerabilityTimer - deltaTime,
    );
    this.hero.castTimer = Math.max(0, this.hero.castTimer - deltaTime);
    this.hero.hurtTimer = Math.max(0, this.hero.hurtTimer - deltaTime);
    this.hero.landingTimer = Math.max(0, this.hero.landingTimer - deltaTime);

    const movingLeft =
      this.input.isPressed('a') || this.input.isPressed('arrowleft');
    const movingRight =
      this.input.isPressed('d') || this.input.isPressed('arrowright');

    if (movingLeft && !movingRight) {
      this.hero.vx = -this.hero.speed;
      this.hero.direction = -1;
    } else if (movingRight && !movingLeft) {
      this.hero.vx = this.hero.speed;
      this.hero.direction = 1;
    } else {
      this.hero.vx = 0;
    }

    if (
      (this.input.isJustPressed(' ') ||
        this.input.isJustPressed('w') ||
        this.input.isJustPressed('arrowup')) &&
      this.hero.jumpsRemaining > 0
    ) {
      this.hero.vy = -this.hero.jumpForce;
      this.hero.jumpsRemaining -= 1;
      this.hero.onGround = false;
    }

    if (this.input.isJustPressed('k') && this.hero.dashCooldown <= 0) {
      this.hero.vx = this.hero.direction * 610;
      this.hero.dashCooldown = 0.7;
    }

    if (this.input.isJustPressed('j') && this.hero.shootCooldown <= 0) {
      this.fireBullet();
      this.hero.shootCooldown = 0.2;
      this.hero.castTimer = 0.14;
    }

    if (
      this.input.isJustPressed('l') &&
      this.sparks >= this.specialThreshold &&
      !this.specialSequenceActive
    ) {
      this.activateSpecial();
      this.hero.castTimer = 0.28;
    }

    const gravityThisFrame =
      this.hero.vy > 0 ? this.gravity + this.fallBoost : this.gravity;

    this.hero.vy += gravityThisFrame * deltaTime;

    this.moveHeroHorizontally(deltaTime);
    this.moveHeroVertically(deltaTime);

    if (!wasOnGround && this.hero.onGround) {
      this.hero.landingTimer = 0.16;
    }

    if (this.hero.x < 0) {
      this.hero.x = 0;
    }

    if (this.hero.x + this.hero.width > this.worldWidth) {
      this.hero.x = this.worldWidth - this.hero.width;
    }

    this.updateHeroState();
  }

  private updateHeroState(): void {
    if (this.hero.hurtTimer > 0) {
      this.hero.state = 'hurt';
      return;
    }

    if (this.hero.castTimer > 0) {
      this.hero.state = 'cast';
      return;
    }

    if (!this.hero.onGround) {
      this.hero.state = this.hero.vy < 0 ? 'jump' : 'fall';
      return;
    }

    if (Math.abs(this.hero.vx) > 8) {
      this.hero.state = 'run';
      return;
    }

    this.hero.state = 'idle';
  }

  private moveHeroHorizontally(deltaTime: number): void {
    this.hero.x += this.hero.vx * deltaTime;

    for (const platform of this.platforms) {
      if (!this.rectsOverlap(this.hero, platform)) {
        continue;
      }

      if (this.hero.vx > 0) {
        this.hero.x = platform.x - this.hero.width;
      } else if (this.hero.vx < 0) {
        this.hero.x = platform.x + platform.width;
      }
    }
  }

  private moveHeroVertically(deltaTime: number): void {
    this.hero.onGround = false;
    this.hero.y += this.hero.vy * deltaTime;

    for (const platform of this.platforms) {
      if (!this.rectsOverlap(this.hero, platform)) {
        continue;
      }

      if (this.hero.vy > 0) {
        this.hero.y = platform.y - this.hero.height;
        this.hero.vy = 0;
        this.hero.onGround = true;
        this.hero.jumpsRemaining = this.hero.maxJumps;
      } else if (this.hero.vy < 0) {
        this.hero.y = platform.y + platform.height;
        this.hero.vy = 0;
      }
    }
  }

  private fireBullet(): void {
    this.bullets.push({
      x:
        this.hero.direction === 1
          ? this.hero.x + this.hero.width - 2
          : this.hero.x - 14,
      y: this.hero.y + 24,
      width: 14,
      height: 10,
      vx: this.hero.direction * 580,
      active: true,
    });
  }

  private activateSpecial(): void {
    this.sparks = 0;
    this.specialSequenceActive = true;
    this.specialPulsesRemaining = 3;
    this.specialPulseTimer = 0;
    this.specialFlashTimer = 0.95;
  }

  private updateSpecialSequence(deltaTime: number): void {
    if (!this.specialSequenceActive) {
      return;
    }

    this.specialPulseTimer -= deltaTime;

    if (this.specialPulseTimer > 0) {
      return;
    }

    this.releaseSpecialPulse();
    this.specialPulsesRemaining -= 1;

    if (this.specialPulsesRemaining <= 0) {
      this.specialSequenceActive = false;
      this.specialPulseTimer = 0;
      return;
    }

    this.specialPulseTimer = 0.22;
  }

  private releaseSpecialPulse(): void {
    const waveX = this.hero.x + this.hero.width / 2;
    const waveY = this.hero.y + this.hero.height / 2;

    this.specialWaves.push({
      x: waveX,
      y: waveY,
      radius: 0,
      maxRadius: this.canvas.width * 1.55,
      lineWidth: 34,
      life: 0.56,
      maxLife: 0.56,
    });

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      const enemyCenterX = enemy.x + enemy.width / 2;
      const enemyCenterY = enemy.y + enemy.height / 2;
      const distance = Math.hypot(enemyCenterX - waveX, enemyCenterY - waveY);

      if (distance <= this.canvas.width * 1.7) {
        enemy.hp = 0;
        enemy.active = false;
        this.score += enemy.type === 'vigia' ? 100 : 50;
      }
    }

    if (this.boss.active && this.boss.hp > 0) {
      this.boss.hp = Math.max(0, this.boss.hp - 7);
      this.boss.hitFlash = 0.2;
    }

    this.fallingProjectiles = [];
  }

  private updateSpecialWaves(deltaTime: number): void {
    for (const wave of this.specialWaves) {
      wave.life -= deltaTime;
      const progress = 1 - wave.life / wave.maxLife;
      wave.radius = wave.maxRadius * progress;
    }

    this.specialWaves = this.specialWaves.filter((wave) => wave.life > 0);
  }

  private updateBullets(deltaTime: number): void {
    for (const bullet of this.bullets) {
      if (!bullet.active) {
        continue;
      }

      bullet.x += bullet.vx * deltaTime;

      if (bullet.x < -100 || bullet.x > this.worldWidth + 100) {
        bullet.active = false;
        continue;
      }

      for (const enemy of this.enemies) {
        if (!enemy.active) {
          continue;
        }

        if (this.rectsOverlap(bullet, enemy)) {
          bullet.active = false;
          enemy.hp -= 1;
          enemy.hitFlash = 0.08;

          if (enemy.hp <= 0) {
            enemy.active = false;
            this.score += enemy.type === 'vigia' ? 100 : 50;
          }

          break;
        }
      }

      if (
        bullet.active &&
        this.boss.active &&
        this.boss.hp > 0 &&
        this.rectsOverlap(bullet, this.boss)
      ) {
        bullet.active = false;
        this.boss.hp -= 1;
        this.boss.hitFlash = 0.1;
      }
    }

    this.bullets = this.bullets.filter((bullet) => bullet.active);
  }

  private updateEnemies(deltaTime: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
      enemy.x += enemy.direction * enemy.speed * deltaTime;

      if (enemy.x <= enemy.patrolLeft) {
        enemy.x = enemy.patrolLeft;
        enemy.direction = 1;
      }

      if (enemy.x + enemy.width >= enemy.patrolRight) {
        enemy.x = enemy.patrolRight - enemy.width;
        enemy.direction = -1;
      }

      if (
        this.hero.invulnerabilityTimer <= 0 &&
        this.rectsOverlap(this.hero, enemy)
      ) {
        this.applyHeroDamage(1);
      }
    }
  }

  private updateCollectibles(): void {
    for (const item of this.collectibles) {
      if (item.collected) {
        continue;
      }

      if (this.rectsOverlap(this.hero, item)) {
        item.collected = true;

        switch (item.type) {
          case 'coin':
            this.score += 5;
            break;
          case 'heart':
            this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 1);
            break;
          case 'spark':
            this.sparks = Math.min(this.specialThreshold, this.sparks + 1);
            this.score += 10;
            break;
        }
      }
    }
  }

  private updateBoss(deltaTime: number): void {
    if (!this.boss.active && this.hero.x >= this.bossArena.startX - 240) {
      this.boss.active = true;
    }

    if (!this.boss.active || this.boss.hp <= 0) {
      return;
    }

    this.boss.hitFlash = Math.max(0, this.boss.hitFlash - deltaTime);
    this.boss.attackCooldown -= deltaTime;
    this.boss.secondaryCooldown -= deltaTime;
    this.boss.jumpCooldown -= deltaTime;
    this.boss.airShotCooldown -= deltaTime;

    if (this.hero.x > this.bossArena.endX - 80) {
      this.hero.x = this.bossArena.endX - 80;
    }

    if (this.hero.x < this.bossArena.startX - 120) {
      this.hero.x = this.bossArena.startX - 120;
    }

    if (this.boss.jumpCooldown <= 0 && this.boss.onGround) {
      this.startBossJump();
    }

    this.updateBossPhysics(deltaTime);

    if (this.boss.attackCooldown <= 0 && this.boss.onGround) {
      this.launchBossSkyBurst();
      this.boss.attackCooldown = this.boss.hp <= 12 ? 1.5 : 2.2;
    }

    if (this.boss.secondaryCooldown <= 0) {
      this.fireBossHorizontalShot();
      this.boss.secondaryCooldown = this.boss.hp <= 12 ? 1.9 : 3.2;
    }

    if (
      !this.boss.onGround &&
      this.boss.airShotsRemaining > 0 &&
      this.boss.airShotCooldown <= 0
    ) {
      this.releaseBossAirMagic();
      this.boss.airShotsRemaining -= 1;
      this.boss.airShotCooldown = 0.18;
    }

    if (
      this.hero.invulnerabilityTimer <= 0 &&
      this.rectsOverlap(this.hero, this.boss)
    ) {
      this.applyHeroDamage(1);
    }
  }

  private startBossJump(): void {
    this.boss.vy = -860;
    this.boss.onGround = false;
    this.boss.jumpCooldown = this.randomRange(
      this.boss.hp <= 12 ? 1.4 : 2.2,
      this.boss.hp <= 12 ? 2.2 : 3.4,
    );
    this.boss.airShotsRemaining = this.boss.hp <= 12 ? 4 : 3;
    this.boss.airShotCooldown = 0.1;
  }

  private updateBossPhysics(deltaTime: number): void {
    if (this.boss.onGround) {
      return;
    }

    this.boss.vy += (this.gravity + 950) * deltaTime;
    this.boss.y += this.boss.vy * deltaTime;

    const bossGround = this.bossArena.groundY - this.boss.height;

    if (this.boss.y >= bossGround) {
      this.boss.y = bossGround;
      this.boss.vy = 0;
      this.boss.onGround = true;
      this.launchBossLandingBurst();
    }
  }

  private launchBossSkyBurst(): void {
    const burstCount = this.boss.hp <= 12 ? 4 : 3;

    for (let index = 0; index < burstCount; index += 1) {
      this.fallingProjectiles.push({
        x: this.randomArenaX(),
        y: -40 - index * 20,
        vy: this.randomRange(650, 830),
        vx: 0,
        radius: this.randomRange(16, 22),
        active: true,
        horizontal: false,
        dark: true,
      });
    }
  }

  private launchBossLandingBurst(): void {
    const burstCount = this.boss.hp <= 12 ? 3 : 2;

    for (let index = 0; index < burstCount; index += 1) {
      this.fallingProjectiles.push({
        x: this.randomArenaX(),
        y: -30 - index * 12,
        vy: this.randomRange(720, 860),
        vx: 0,
        radius: this.randomRange(14, 20),
        active: true,
        horizontal: false,
        dark: true,
      });
    }
  }

  private releaseBossAirMagic(): void {
    this.fallingProjectiles.push({
      x: this.randomArenaX(),
      y: this.boss.y + 30,
      vy: this.randomRange(760, 920),
      vx: 0,
      radius: this.randomRange(14, 18),
      active: true,
      horizontal: false,
      dark: true,
    });
  }

  private fireBossHorizontalShot(): void {
    this.fallingProjectiles.push({
      x: this.boss.x - 20,
      y: this.boss.y + 66,
      vy: 0,
      vx: -330,
      radius: 15,
      active: true,
      horizontal: true,
      dark: true,
    });
  }

  private updateFallingProjectiles(deltaTime: number): void {
    for (const projectile of this.fallingProjectiles) {
      if (!projectile.active) {
        continue;
      }

      if (projectile.horizontal) {
        projectile.x += projectile.vx * deltaTime;
      } else {
        projectile.y += projectile.vy * deltaTime;
      }

      const hitGround =
        !projectile.horizontal &&
        projectile.y + projectile.radius >= this.bossArena.groundY;

      const leftArena =
        projectile.horizontal &&
        projectile.x + projectile.radius < this.bossArena.startX - 60;

      if (hitGround || leftArena) {
        if (!projectile.horizontal) {
          const heroCenterX = this.hero.x + this.hero.width / 2;
          const impactDistance = Math.abs(heroCenterX - projectile.x);

          if (
            this.hero.invulnerabilityTimer <= 0 &&
            impactDistance <= 50 &&
            this.hero.y + this.hero.height >= this.bossArena.groundY - 100
          ) {
            this.applyHeroDamage(1);
          }
        }

        projectile.active = false;
        continue;
      }

      if (
        projectile.horizontal &&
        this.hero.invulnerabilityTimer <= 0 &&
        this.circleRectOverlap(
          projectile.x,
          projectile.y,
          projectile.radius,
          this.hero,
        )
      ) {
        projectile.active = false;
        this.applyHeroDamage(1);
      }
    }

    this.fallingProjectiles = this.fallingProjectiles.filter(
      (projectile) => projectile.active,
    );
  }

  private applyHeroDamage(amount: number): void {
    if (this.hero.invulnerabilityTimer > 0) {
      return;
    }

    this.hero.hp = Math.max(0, this.hero.hp - amount);
    this.hero.invulnerabilityTimer = 1;
    this.hero.hurtTimer = 0.22;
    this.hero.vx = -this.hero.direction * 190;
    this.hero.vy = -260;
  }

  private updateCamera(): void {
    const target = this.hero.x - this.canvas.width / 2 + this.hero.width / 2;
    this.cameraX = Math.max(
      0,
      Math.min(target, this.worldWidth - this.canvas.width),
    );
  }

  private startEnding(type: 'game-over' | 'victory'): void {
    if (this.ending) {
      return;
    }

    this.ending = type;
    this.endingTimer = 1;
  }

  private rectsOverlap(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private circleRectOverlap(
    cx: number,
    cy: number,
    radius: number,
    rect: { x: number; y: number; width: number; height: number },
  ): boolean {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

    const dx = cx - closestX;
    const dy = cy - closestY;

    return dx * dx + dy * dy <= radius * radius;
  }

  private randomArenaX(): number {
    return this.randomRange(
      this.bossArena.startX + 40,
      this.bossArena.endX - 40,
    );
  }

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    this.drawPlatforms();
    this.drawCollectibles();
    this.drawSpecialWaves();
    this.drawEnemies();
    this.drawBullets();
    this.drawBoss();
    this.drawFallingProjectiles();
    this.drawHero();

    ctx.restore();

    this.drawHud();

    if (this.specialFlashTimer > 0) {
      ctx.fillStyle = `rgba(255, 239, 186, ${Math.min(
        this.specialFlashTimer * 0.3,
        0.3,
      )})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#f4e7c7';
      ctx.font = 'bold 42px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        'PAUSADO',
        this.canvas.width / 2,
        this.canvas.height / 2 - 20,
      );

      ctx.font = '20px Arial';
      ctx.fillStyle = '#d5d8de';
      ctx.fillText(
        'Pressione ESC para continuar',
        this.canvas.width / 2,
        this.canvas.height / 2 + 20,
      );
    }
  }

  private drawBackground(): void {
    const ctx = this.ctx;

    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0f1017');
    gradient.addColorStop(0.32, '#090b12');
    gradient.addColorStop(0.72, '#07080d');
    gradient.addColorStop(1, '#040507');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = 'rgba(82, 20, 30, 0.18)';
    ctx.beginPath();
    ctx.arc(200, 120, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(22, 24, 33, 0.95)';
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.lineTo(140, 300);
    ctx.lineTo(280, 350);
    ctx.lineTo(470, 240);
    ctx.lineTo(650, 380);
    ctx.lineTo(820, 250);
    ctx.lineTo(1040, 360);
    ctx.lineTo(1280, 230);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(34, 37, 48, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.lineTo(170, 460);
    ctx.lineTo(330, 490);
    ctx.lineTo(520, 430);
    ctx.lineTo(760, 500);
    ctx.lineTo(980, 435);
    ctx.lineTo(1280, 520);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(100, 16, 26, 0.12)';
    for (let index = 0; index < 10; index += 1) {
      const x = (index * 180 - this.cameraX * 0.18) % 1500;
      ctx.fillRect(x + 30, 470, 18, 90);
      ctx.fillRect(x, 560, 72, 40);
      ctx.fillRect(x + 52, 520, 14, 40);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.fillRect(0, 555, this.canvas.width, 165);

    for (let index = 0; index < 34; index += 1) {
      const px =
        (index * 97 + performance.now() * 0.01) % (this.canvas.width + 120);
      const py = 120 + ((index * 41) % 480);
      ctx.fillStyle = 'rgba(180, 190, 220, 0.04)';
      ctx.fillRect(px - 60, py, 2, 2);
    }
  }

  private drawPlatforms(): void {
    const ctx = this.ctx;

    for (const platform of this.platforms) {
      const topGradient = ctx.createLinearGradient(
        platform.x,
        platform.y,
        platform.x,
        platform.y + platform.height,
      );
      topGradient.addColorStop(0, '#3b2641');
      topGradient.addColorStop(0.35, '#2b2032');
      topGradient.addColorStop(1, '#17141d');

      ctx.fillStyle = topGradient;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

      ctx.fillStyle = '#70527a';
      ctx.fillRect(platform.x, platform.y, platform.width, 6);

      ctx.fillStyle = '#130f17';
      ctx.fillRect(
        platform.x,
        platform.y + platform.height - 8,
        platform.width,
        8,
      );

      ctx.fillStyle = 'rgba(147, 103, 174, 0.18)';
      for (let index = 12; index < platform.width; index += 34) {
        ctx.fillRect(
          platform.x + index,
          platform.y + 8,
          3,
          platform.height - 16,
        );
      }

      ctx.strokeStyle = 'rgba(10, 8, 14, 0.6)';
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
  }

  private drawHero(): void {
    const ctx = this.ctx;
    const hero = this.hero;

    const flicker =
      hero.invulnerabilityTimer > 0 &&
      Math.floor(hero.invulnerabilityTimer * 18) % 2 === 0;

    if (flicker) {
      return;
    }

    const t = hero.animationTime;
    const runCycle = Math.sin(t * 13);
    const runCycleOpposite = Math.sin(t * 13 + Math.PI);
    const idleSway = Math.sin(t * 1.8) * 0.02;
    const landingCompression =
      hero.landingTimer > 0 ? hero.landingTimer / 0.16 : 0;

    let bodyBob = 0;
    let torsoTilt = 0;
    let headTilt = 0;
    let frontLegAngle = 0;
    let backLegAngle = 0;
    let frontKnee = 0;
    let backKnee = 0;
    let frontArmAngle = 0;
    let backArmAngle = 0;
    let frontArmY = 0;
    let backArmY = 0;
    let trailSwing = 0;
    let handSparkScale = 0;

    switch (hero.state) {
      case 'idle':
        bodyBob = 0;
        torsoTilt = idleSway;
        headTilt = idleSway * 0.7;
        frontLegAngle = 0.02;
        backLegAngle = -0.02;
        frontKnee = 0.01;
        backKnee = 0.01;
        frontArmAngle = hero.direction === 1 ? 0.16 : -0.16;
        backArmAngle = hero.direction === 1 ? -0.08 : 0.08;
        frontArmY = 0;
        backArmY = 0;
        trailSwing = Math.sin(t * 1.6) * 1.2;
        handSparkScale = 0;
        break;

      case 'run':
        bodyBob = Math.abs(runCycle) * 0.8;
        torsoTilt = hero.direction * 0.08;
        headTilt = hero.direction * 0.02;
        frontLegAngle = runCycle * 0.88;
        backLegAngle = runCycleOpposite * 0.7;
        frontKnee = runCycle > 0 ? -0.34 : 0.14;
        backKnee = runCycleOpposite > 0 ? -0.22 : 0.1;
        frontArmAngle = runCycleOpposite * 0.55;
        backArmAngle = runCycle * 0.34;
        frontArmY = Math.abs(runCycleOpposite) * 0.7;
        backArmY = Math.abs(runCycle) * 0.4;
        trailSwing = runCycleOpposite * 3;
        handSparkScale = 0;
        break;

      case 'jump':
        bodyBob = -1.2;
        torsoTilt = hero.direction * 0.06;
        headTilt = hero.direction * 0.03;
        frontLegAngle = hero.direction === 1 ? 0.4 : -0.4;
        backLegAngle = hero.direction === 1 ? -0.12 : 0.12;
        frontKnee = -0.68;
        backKnee = -0.4;
        frontArmAngle = hero.direction === 1 ? -0.22 : 0.22;
        backArmAngle = hero.direction === 1 ? -0.48 : 0.48;
        frontArmY = -1;
        backArmY = -1;
        trailSwing = -3;
        handSparkScale = 0;
        break;

      case 'fall':
        bodyBob = 1;
        torsoTilt = -hero.direction * 0.04;
        headTilt = -hero.direction * 0.02;
        frontLegAngle = hero.direction === 1 ? -0.12 : 0.12;
        backLegAngle = hero.direction === 1 ? 0.26 : -0.26;
        frontKnee = -0.1;
        backKnee = 0.16;
        frontArmAngle = hero.direction === 1 ? 0.36 : -0.36;
        backArmAngle = hero.direction === 1 ? -0.1 : 0.1;
        frontArmY = 1.2;
        backArmY = 0.3;
        trailSwing = 3;
        handSparkScale = 0;
        break;

      case 'cast':
        bodyBob = 0;
        torsoTilt = hero.direction * 0.14;
        headTilt = hero.direction * 0.05;
        frontLegAngle = 0.12;
        backLegAngle = -0.08;
        frontKnee = 0.04;
        backKnee = 0.02;
        frontArmAngle = hero.direction === 1 ? -0.94 : 0.94;
        backArmAngle = hero.direction === 1 ? 0.12 : -0.12;
        frontArmY = -1;
        backArmY = 0;
        trailSwing = -1;
        handSparkScale = 1;
        break;

      case 'hurt':
        bodyBob = 0.4;
        torsoTilt = -hero.direction * 0.16;
        headTilt = -hero.direction * 0.07;
        frontLegAngle = -0.22;
        backLegAngle = 0.25;
        frontKnee = -0.1;
        backKnee = 0.14;
        frontArmAngle = hero.direction === 1 ? 0.7 : -0.7;
        backArmAngle = hero.direction === 1 ? -0.16 : 0.16;
        frontArmY = 0.8;
        backArmY = 0.2;
        trailSwing = 4;
        handSparkScale = 0;
        break;
    }

    bodyBob += landingCompression * 1.8;

    const isFacingRight = hero.direction === 1;
    const centerX = hero.x + hero.width / 2;
    const baseY = hero.y + hero.height - landingCompression * 1.2;

    const rearLegX = centerX + (isFacingRight ? -4 : 4);
    const frontLegX = centerX + (isFacingRight ? 5 : -5);
    const hipY = baseY - 24 + bodyBob;

    const torsoTopY = hero.y + 18 + bodyBob + landingCompression;
    const torsoBottomY = hero.y + 42 + bodyBob + landingCompression;
    const headCenterX = centerX + (isFacingRight ? 4 : -4);
    const headCenterY = hero.y + 12 + bodyBob + landingCompression;

    const shoulderY = hero.y + 24 + bodyBob + landingCompression;
    const rearShoulderX = centerX + (isFacingRight ? -6 : 6);
    const frontShoulderX = centerX + (isFacingRight ? 8 : -8);

    ctx.save();

    const trailGradient = ctx.createLinearGradient(
      centerX,
      hero.y + 18,
      centerX - hero.direction * 16,
      baseY - 8,
    );
    trailGradient.addColorStop(0, 'rgba(120, 24, 36, 0.56)');
    trailGradient.addColorStop(1, 'rgba(34, 8, 12, 0.1)');

    ctx.fillStyle = trailGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - hero.direction * 4, hero.y + 20 + bodyBob);
    ctx.lineTo(centerX - hero.direction * 15, hero.y + 28 + bodyBob);
    ctx.lineTo(
      centerX - hero.direction * 16,
      baseY - 14 + bodyBob + trailSwing,
    );
    ctx.lineTo(centerX - hero.direction * 8, baseY - 8 + bodyBob);
    ctx.closePath();
    ctx.fill();

    this.drawHeroLeg(
      ctx,
      rearLegX,
      hipY,
      backLegAngle,
      backKnee,
      '#2c3147',
      '#3f4a66',
      0.88,
    );

    this.drawHeroArm(
      ctx,
      rearShoulderX,
      shoulderY,
      backArmAngle,
      11,
      4,
      '#3a4561',
      '#7488b0',
      0.9,
      backArmY,
    );

    ctx.save();
    ctx.translate(centerX, (torsoTopY + torsoBottomY) / 2);
    ctx.rotate(torsoTilt);

    const torsoGradient = ctx.createLinearGradient(0, -16, 0, 16);
    torsoGradient.addColorStop(0, '#314965');
    torsoGradient.addColorStop(0.55, '#24384d');
    torsoGradient.addColorStop(1, '#17212f');

    ctx.fillStyle = torsoGradient;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(7, -13);
    ctx.lineTo(9, 11);
    ctx.lineTo(1, 18);
    ctx.lineTo(-8, 16);
    ctx.lineTo(-10, -1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1b2331';
    ctx.beginPath();
    ctx.moveTo(-9, 6);
    ctx.lineTo(8, 6);
    ctx.lineTo(10, 18);
    ctx.lineTo(-6, 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4c647f';
    ctx.fillRect(-5, -10, 8, 3);

    ctx.fillStyle = '#611826';
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(-1, -11);
    ctx.lineTo(-3, 10);
    ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    this.drawHeroLeg(
      ctx,
      frontLegX,
      hipY,
      frontLegAngle,
      frontKnee,
      '#343b55',
      '#52607d',
      1,
    );

    this.drawHeroArm(
      ctx,
      frontShoulderX,
      shoulderY,
      frontArmAngle,
      15,
      5,
      '#41506f',
      '#93add7',
      1,
      frontArmY,
    );

    ctx.save();
    ctx.translate(headCenterX, headCenterY);
    ctx.rotate(headTilt);

    ctx.fillStyle = '#d8ba9a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#151318';
    ctx.beginPath();
    ctx.moveTo(-7, -2);
    ctx.lineTo(-4, -10);
    ctx.lineTo(3, -11);
    ctx.lineTo(7, -4);
    ctx.lineTo(6, 1);
    ctx.lineTo(0, 1.5);
    ctx.lineTo(-5, 1.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0e1016';
    if (isFacingRight) {
      ctx.fillRect(1, -1, 2, 2);
      ctx.fillRect(4, 1, 2, 1);
    } else {
      ctx.fillRect(-3, -1, 2, 2);
      ctx.fillRect(-6, 1, 2, 1);
    }

    ctx.restore();

    if (handSparkScale > 0) {
      const frontHandX = frontShoulderX + Math.cos(frontArmAngle) * 15;
      const frontHandY = shoulderY + frontArmY + Math.sin(frontArmAngle) * 15;

      const handGlow = ctx.createRadialGradient(
        frontHandX,
        frontHandY,
        1,
        frontHandX,
        frontHandY,
        14,
      );
      handGlow.addColorStop(0, 'rgba(255, 223, 162, 0.95)');
      handGlow.addColorStop(0.45, 'rgba(255, 164, 70, 0.45)');
      handGlow.addColorStop(1, 'rgba(255, 164, 70, 0)');

      ctx.fillStyle = handGlow;
      ctx.beginPath();
      ctx.arc(frontHandX, frontHandY, 12 * handSparkScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 209, 120, 1)';
      ctx.beginPath();
      ctx.arc(frontHandX, frontHandY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawHeroLeg(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    thighAngle: number,
    kneeAngle: number,
    upperColor: string,
    lowerColor: string,
    alpha: number,
  ): void {
    const thighLength = 12;
    const shinLength = 12;

    const kneeX = x + Math.sin(thighAngle) * thighLength;
    const kneeY = y + Math.cos(thighAngle) * thighLength;

    const shinTotalAngle = thighAngle + kneeAngle;
    const footX = kneeX + Math.sin(shinTotalAngle) * shinLength;
    const footY = kneeY + Math.cos(shinTotalAngle) * shinLength;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';

    ctx.strokeStyle = upperColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    ctx.strokeStyle = lowerColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    ctx.strokeStyle = '#151922';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(footX - 4, footY);
    ctx.lineTo(footX + 4, footY);
    ctx.stroke();

    ctx.restore();
  }

  private drawHeroArm(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    length: number,
    lineWidth: number,
    color: string,
    handColor: string,
    alpha: number,
    yOffset = 0,
  ): void {
    const handX = x + Math.cos(angle) * length;
    const handY = y + yOffset + Math.sin(angle) * length;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    ctx.fillStyle = handColor;
    ctx.beginPath();
    ctx.arc(handX, handY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawBullets(): void {
    const ctx = this.ctx;

    for (const bullet of this.bullets) {
      ctx.fillStyle = '#ffca78';
      ctx.beginPath();
      ctx.moveTo(bullet.x, bullet.y + bullet.height / 2);
      ctx.lineTo(bullet.x + bullet.width - 3, bullet.y);
      ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height / 2);
      ctx.lineTo(bullet.x + bullet.width - 3, bullet.y + bullet.height);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawEnemies(): void {
    const ctx = this.ctx;

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      const coreColor = enemy.type === 'vigia' ? '#64e5ff' : '#7aff97';
      const aura = ctx.createRadialGradient(
        enemy.width / 2,
        enemy.height / 2,
        1,
        enemy.width / 2,
        enemy.height / 2,
        enemy.type === 'vigia' ? 38 : 28,
      );
      aura.addColorStop(
        0,
        enemy.type === 'vigia'
          ? 'rgba(100, 229, 255, 0.9)'
          : 'rgba(122, 255, 151, 0.85)',
      );
      aura.addColorStop(
        0.45,
        enemy.type === 'vigia'
          ? 'rgba(50, 160, 255, 0.28)'
          : 'rgba(50, 255, 130, 0.22)',
      );
      aura.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(
        enemy.width / 2,
        enemy.height / 2,
        enemy.type === 'vigia' ? 36 : 26,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = enemy.hitFlash > 0 ? '#efe3d7' : '#13161c';
      ctx.fillRect(0, 8, enemy.width, enemy.height - 8);

      ctx.fillStyle = '#090b10';
      ctx.fillRect(6, 0, enemy.width - 12, 12);

      ctx.fillStyle = coreColor;
      ctx.fillRect(enemy.width / 2 - 5, 21, 10, 10);

      ctx.fillStyle = enemy.type === 'vigia' ? '#24313f' : '#1a2220';
      ctx.fillRect(5, 18, 4, enemy.height - 18);
      ctx.fillRect(enemy.width - 9, 18, 4, enemy.height - 18);

      ctx.strokeStyle =
        enemy.type === 'vigia'
          ? 'rgba(100, 229, 255, 0.45)'
          : 'rgba(122, 255, 151, 0.4)';
      ctx.beginPath();
      ctx.moveTo(8, 18);
      ctx.lineTo(enemy.width / 2, enemy.height / 2);
      ctx.lineTo(enemy.width - 8, 18);
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawCollectibles(): void {
    const ctx = this.ctx;
    const bob = Math.sin(performance.now() / 220) * 3;

    for (const item of this.collectibles) {
      if (item.collected) {
        continue;
      }

      const y = item.y + bob;

      if (item.type === 'coin') {
        ctx.fillStyle = '#b88d3d';
        ctx.beginPath();
        ctx.moveTo(item.x, y - 10);
        ctx.lineTo(item.x + 8, y);
        ctx.lineTo(item.x, y + 10);
        ctx.lineTo(item.x - 8, y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e6c26d';
        ctx.beginPath();
        ctx.moveTo(item.x, y - 6);
        ctx.lineTo(item.x + 5, y);
        ctx.lineTo(item.x, y + 6);
        ctx.lineTo(item.x - 5, y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 242, 185, 0.38)';
        ctx.strokeRect(item.x - 1, y - 3, 2, 6);
      }

      if (item.type === 'heart') {
        const potionGlass = ctx.createLinearGradient(
          item.x,
          y - 12,
          item.x,
          y + 12,
        );
        potionGlass.addColorStop(0, '#96d4ff');
        potionGlass.addColorStop(1, '#4ea3de');

        const potionLiquid = ctx.createLinearGradient(
          item.x,
          y - 2,
          item.x,
          y + 10,
        );
        potionLiquid.addColorStop(0, '#ff8f78');
        potionLiquid.addColorStop(1, '#d94a5a');

        ctx.fillStyle = '#c7a37b';
        ctx.fillRect(item.x - 3, y - 12, 6, 5);

        ctx.fillStyle = '#6f4b33';
        ctx.fillRect(item.x - 5, y - 14, 10, 3);

        ctx.fillStyle = potionGlass;
        ctx.beginPath();
        ctx.moveTo(item.x - 9, y - 4);
        ctx.lineTo(item.x - 7, y + 8);
        ctx.lineTo(item.x, y + 12);
        ctx.lineTo(item.x + 7, y + 8);
        ctx.lineTo(item.x + 9, y - 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = potionLiquid;
        ctx.beginPath();
        ctx.moveTo(item.x - 7, y + 1);
        ctx.lineTo(item.x - 5, y + 8);
        ctx.lineTo(item.x, y + 10);
        ctx.lineTo(item.x + 5, y + 8);
        ctx.lineTo(item.x + 7, y + 1);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(item.x - 4, y - 3);
        ctx.lineTo(item.x - 2, y + 6);
        ctx.stroke();
      }

      if (item.type === 'spark') {
        ctx.fillStyle = '#7de8ff';
        ctx.beginPath();
        ctx.moveTo(item.x, y - 10);
        ctx.lineTo(item.x + 4, y - 2);
        ctx.lineTo(item.x + 10, y - 2);
        ctx.lineTo(item.x + 3, y + 3);
        ctx.lineTo(item.x + 6, y + 11);
        ctx.lineTo(item.x, y + 5);
        ctx.lineTo(item.x - 6, y + 11);
        ctx.lineTo(item.x - 3, y + 3);
        ctx.lineTo(item.x - 10, y - 2);
        ctx.lineTo(item.x - 4, y - 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private drawBoss(): void {
    if (!this.boss.active || this.boss.hp <= 0) {
      return;
    }

    const ctx = this.ctx;
    const boss = this.boss;

    ctx.save();
    ctx.translate(boss.x, boss.y);

    const aura = ctx.createRadialGradient(60, 72, 10, 60, 72, 90);
    aura.addColorStop(0, 'rgba(80, 10, 20, 0.65)');
    aura.addColorStop(0.45, 'rgba(100, 0, 40, 0.25)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(60, 72, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.hitFlash > 0 ? '#f5ece5' : '#0a0b10';
    ctx.fillRect(16, 26, 88, 128);

    ctx.fillStyle = '#040507';
    ctx.fillRect(28, 0, 64, 38);

    ctx.fillStyle = '#12131a';
    ctx.fillRect(-6, 34, 20, 80);
    ctx.fillRect(106, 34, 20, 80);

    ctx.fillStyle = '#191b23';
    ctx.fillRect(28, 132, 18, 28);
    ctx.fillRect(74, 132, 18, 28);

    const coreGlow = ctx.createRadialGradient(60, 70, 2, 60, 70, 28);
    coreGlow.addColorStop(0, 'rgba(135, 240, 255, 1)');
    coreGlow.addColorStop(0.4, 'rgba(100, 210, 255, 0.8)');
    coreGlow.addColorStop(1, 'rgba(100, 210, 255, 0)');

    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(60, 70, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7af2ff';
    ctx.fillRect(50, 60, 20, 20);

    ctx.strokeStyle = 'rgba(110, 225, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, 44);
    ctx.lineTo(60, 70);
    ctx.lineTo(92, 42);
    ctx.moveTo(34, 102);
    ctx.lineTo(60, 70);
    ctx.lineTo(88, 100);
    ctx.stroke();

    ctx.fillStyle = '#2a0611';
    ctx.fillRect(18, 12, 10, 18);
    ctx.fillRect(92, 12, 10, 18);

    ctx.restore();
  }

  private drawFallingProjectiles(): void {
    const ctx = this.ctx;

    for (const projectile of this.fallingProjectiles) {
      if (!projectile.active) {
        continue;
      }

      const glow = ctx.createRadialGradient(
        projectile.x,
        projectile.y,
        1,
        projectile.x,
        projectile.y,
        projectile.radius * 2.2,
      );

      if (projectile.dark) {
        glow.addColorStop(0, 'rgba(138, 225, 255, 0.95)');
        glow.addColorStop(0.28, 'rgba(134, 80, 255, 0.75)');
        glow.addColorStop(0.7, 'rgba(73, 16, 38, 0.4)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        glow.addColorStop(0, 'rgba(255, 180, 120, 0.95)');
        glow.addColorStop(0.5, 'rgba(255, 120, 90, 0.4)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
      }

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(
        projectile.x,
        projectile.y,
        projectile.radius * 2.1,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = projectile.dark ? '#7be8ff' : '#ff9e7d';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawSpecialWaves(): void {
    const ctx = this.ctx;

    for (const wave of this.specialWaves) {
      const alpha = wave.life / wave.maxLife;

      const gradient = ctx.createRadialGradient(
        wave.x,
        wave.y,
        Math.max(wave.radius * 0.2, 1),
        wave.x,
        wave.y,
        wave.radius,
      );

      gradient.addColorStop(0, `rgba(255, 238, 180, ${alpha * 0.22})`);
      gradient.addColorStop(0.3, `rgba(255, 180, 90, ${alpha * 0.18})`);
      gradient.addColorStop(1, 'rgba(255, 180, 90, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 219, 143, ${alpha * 0.9})`;
      ctx.lineWidth = wave.lineWidth;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius * 0.82, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 153, 61, ${alpha * 0.65})`;
      ctx.lineWidth = wave.lineWidth * 0.45;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawHud(): void {
    const ctx = this.ctx;
    const heroPanelX = 20;
    const heroPanelY = 18;
    const heroPanelWidth = 320;
    const heroPanelHeight = 96;

    ctx.save();

    ctx.fillStyle = 'rgba(6, 8, 12, 0.62)';
    ctx.fillRect(heroPanelX, heroPanelY, heroPanelWidth, heroPanelHeight);
    ctx.fillRect(this.canvas.width - 240, 18, 220, 92);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f4e7c7';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(this.hero.name, heroPanelX + 18, heroPanelY + 28);

    const hpBarX = heroPanelX + 18;
    const hpBarY = heroPanelY + 40;
    const hpBarWidth = 134;
    const hpBarHeight = 12;

    ctx.fillStyle = '#181b24';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    const hpGradient = ctx.createLinearGradient(
      hpBarX,
      hpBarY,
      hpBarX + hpBarWidth,
      hpBarY,
    );
    hpGradient.addColorStop(0, '#8d2538');
    hpGradient.addColorStop(0.55, '#ca4b60');
    hpGradient.addColorStop(1, '#ff9b73');

    ctx.fillStyle = hpGradient;
    ctx.fillRect(
      hpBarX,
      hpBarY,
      (this.hero.hp / this.hero.maxHp) * hpBarWidth,
      hpBarHeight,
    );

    ctx.strokeStyle = 'rgba(244, 231, 199, 0.22)';
    ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    ctx.fillStyle = '#cfd8ea';
    ctx.font = '13px Arial';
    ctx.fillText(
      `${this.hero.hp}/${this.hero.maxHp}`,
      hpBarX + hpBarWidth + 12,
      hpBarY + 10,
    );

    ctx.fillStyle = '#d9deea';
    ctx.font = '18px Arial';
    ctx.fillText(
      `Centelhas: ${this.sparks}/${this.specialThreshold}`,
      heroPanelX + 18,
      heroPanelY + 78,
    );

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4e7c7';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Fase 1 - Ruínas do Vale', this.canvas.width / 2, 42);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#d9deea';
    ctx.font = '18px Arial';
    ctx.fillText(`Pontos: ${this.score}`, this.canvas.width - 40, 50);
    ctx.fillText('ESC pausa', this.canvas.width - 40, 84);

    if (this.boss.active && this.boss.hp > 0) {
      const barWidth = 420;
      const barHeight = 18;
      const x = this.canvas.width / 2 - barWidth / 2;
      const y = 70;

      ctx.fillStyle = 'rgba(8, 10, 14, 0.78)';
      ctx.fillRect(x - 12, y - 30, barWidth + 24, 54);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f3d6c0';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Arauto das Cinzas', this.canvas.width / 2, y - 10);

      ctx.fillStyle = '#181b24';
      ctx.fillRect(x, y, barWidth, barHeight);

      const bossBarGradient = ctx.createLinearGradient(x, y, x + barWidth, y);
      bossBarGradient.addColorStop(0, '#7a2030');
      bossBarGradient.addColorStop(0.5, '#c23f55');
      bossBarGradient.addColorStop(1, '#ff9c73');

      ctx.fillStyle = bossBarGradient;
      ctx.fillRect(
        x,
        y,
        (this.boss.hp / this.boss.maxHp) * barWidth,
        barHeight,
      );

      ctx.strokeStyle = 'rgba(244, 231, 199, 0.2)';
      ctx.strokeRect(x, y, barWidth, barHeight);
    }

    if (this.sparks >= this.specialThreshold) {
      ctx.fillStyle = 'rgba(255, 225, 150, 0.18)';
      ctx.fillRect(20, 122, 220, 32);
      ctx.fillStyle = '#ffe08a';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Especial pronto (L)', 34, 144);
    }

    ctx.restore();
  }
}