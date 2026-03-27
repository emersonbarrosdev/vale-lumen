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

  private updateHero(deltaTime: number): void {
    this.hero.shootCooldown = Math.max(0, this.hero.shootCooldown - deltaTime);
    this.hero.dashCooldown = Math.max(0, this.hero.dashCooldown - deltaTime);
    this.hero.invulnerabilityTimer = Math.max(
      0,
      this.hero.invulnerabilityTimer - deltaTime,
    );

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
    }

    if (
      this.input.isJustPressed('l') &&
      this.sparks >= this.specialThreshold &&
      !this.specialSequenceActive
    ) {
      this.activateSpecial();
    }

    const gravityThisFrame =
      this.hero.vy > 0 ? this.gravity + this.fallBoost : this.gravity;

    this.hero.vy += gravityThisFrame * deltaTime;

    this.moveHeroHorizontally(deltaTime);
    this.moveHeroVertically(deltaTime);

    if (this.hero.x < 0) {
      this.hero.x = 0;
    }

    if (this.hero.x + this.hero.width > this.worldWidth) {
      this.hero.x = this.worldWidth - this.hero.width;
    }
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
            this.score += 10;
            break;
          case 'heart':
            this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 1);
            break;
          case 'spark':
            this.sparks = Math.min(this.specialThreshold, this.sparks + 1);
            this.score += 25;
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

    if (!this.boss.onGround && this.boss.airShotsRemaining > 0 && this.boss.airShotCooldown <= 0) {
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
      ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2 - 20);

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
      const x = (index * 180 - (this.cameraX * 0.18)) % 1500;
      ctx.fillRect(x + 30, 470, 18, 90);
      ctx.fillRect(x, 560, 72, 40);
      ctx.fillRect(x + 52, 520, 14, 40);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.fillRect(0, 555, this.canvas.width, 165);

    for (let index = 0; index < 34; index += 1) {
      const px = ((index * 97) + performance.now() * 0.01) % (this.canvas.width + 120);
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
      ctx.fillRect(platform.x, platform.y + platform.height - 8, platform.width, 8);

      ctx.fillStyle = 'rgba(147, 103, 174, 0.18)';
      for (let index = 12; index < platform.width; index += 34) {
        ctx.fillRect(platform.x + index, platform.y + 8, 3, platform.height - 16);
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

    ctx.save();
    ctx.translate(hero.x, hero.y);

    ctx.fillStyle = '#5e1622';
    ctx.fillRect(hero.direction === 1 ? 9 : 27, 15, 10, 34);

    ctx.fillStyle = '#24384d';
    ctx.fillRect(12, 16, 20, 28);

    ctx.fillStyle = '#1f2938';
    ctx.fillRect(10, 36, 24, 24);

    ctx.fillStyle = '#d7b899';
    ctx.fillRect(14, 2, 16, 16);

    ctx.fillStyle = '#151318';
    ctx.fillRect(12, 0, 20, 7);

    const handX = hero.direction === 1 ? 35 : 3;
    const handGlow = ctx.createRadialGradient(handX, 26, 1, handX, 26, 12);
    handGlow.addColorStop(0, 'rgba(255, 211, 132, 0.95)');
    handGlow.addColorStop(0.45, 'rgba(255, 153, 51, 0.45)');
    handGlow.addColorStop(1, 'rgba(255, 153, 51, 0)');

    ctx.fillStyle = handGlow;
    ctx.beginPath();
    ctx.arc(handX, 26, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffce78';
    ctx.beginPath();
    ctx.arc(handX, 26, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawBullets(): void {
    const ctx = this.ctx;

    for (const bullet of this.bullets) {
      const glow = ctx.createRadialGradient(
        bullet.x + bullet.width / 2,
        bullet.y + bullet.height / 2,
        1,
        bullet.x + bullet.width / 2,
        bullet.y + bullet.height / 2,
        16,
      );

      glow.addColorStop(0, 'rgba(255, 220, 150, 1)');
      glow.addColorStop(0.45, 'rgba(255, 170, 70, 0.85)');
      glow.addColorStop(1, 'rgba(255, 170, 70, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(
        bullet.x + bullet.width / 2,
        bullet.y + bullet.height / 2,
        12,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = '#ffd083';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
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
      aura.addColorStop(0, enemy.type === 'vigia' ? 'rgba(100, 229, 255, 0.9)' : 'rgba(122, 255, 151, 0.85)');
      aura.addColorStop(0.45, enemy.type === 'vigia' ? 'rgba(50, 160, 255, 0.28)' : 'rgba(50, 255, 130, 0.22)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(enemy.width / 2, enemy.height / 2, enemy.type === 'vigia' ? 36 : 26, 0, Math.PI * 2);
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

      ctx.strokeStyle = enemy.type === 'vigia' ? 'rgba(100, 229, 255, 0.45)' : 'rgba(122, 255, 151, 0.4)';
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
    const bob = Math.sin(performance.now() / 220) * 4;

    for (const item of this.collectibles) {
      if (item.collected) {
        continue;
      }

      const y = item.y + bob;

      if (item.type === 'coin') {
        ctx.fillStyle = '#f0c35b';
        ctx.beginPath();
        ctx.arc(item.x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 238, 185, 0.45)';
        ctx.beginPath();
        ctx.arc(item.x - 2, y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (item.type === 'heart') {
        ctx.fillStyle = '#f08a6b';
        ctx.beginPath();
        ctx.arc(item.x - 5, y - 2, 6, 0, Math.PI * 2);
        ctx.arc(item.x + 5, y - 2, 6, 0, Math.PI * 2);
        ctx.lineTo(item.x, y + 10);
        ctx.closePath();
        ctx.fill();
      }

      if (item.type === 'spark') {
        const sparkGlow = ctx.createRadialGradient(item.x, y, 1, item.x, y, 18);
        sparkGlow.addColorStop(0, 'rgba(125, 232, 255, 1)');
        sparkGlow.addColorStop(0.5, 'rgba(125, 232, 255, 0.35)');
        sparkGlow.addColorStop(1, 'rgba(125, 232, 255, 0)');
        ctx.fillStyle = sparkGlow;
        ctx.beginPath();
        ctx.arc(item.x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7de8ff';
        ctx.beginPath();
        ctx.moveTo(item.x, y - 10);
        ctx.lineTo(item.x + 6, y);
        ctx.lineTo(item.x + 2, y);
        ctx.lineTo(item.x + 8, y + 10);
        ctx.lineTo(item.x - 4, y + 2);
        ctx.lineTo(item.x, y + 2);
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
      ctx.arc(projectile.x, projectile.y, projectile.radius * 2.1, 0, Math.PI * 2);
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

    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 12, 0.62)';
    ctx.fillRect(20, 18, 250, 92);
    ctx.fillRect(this.canvas.width - 240, 18, 220, 92);

    for (let index = 0; index < this.hero.maxHp; index += 1) {
      const x = 40 + index * 34;
      const y = 40;
      const active = index < this.hero.hp;

      ctx.fillStyle = active ? '#f08a6b' : '#42323a';
      ctx.beginPath();
      ctx.arc(x - 6, y, 8, 0, Math.PI * 2);
      ctx.arc(x + 6, y, 8, 0, Math.PI * 2);
      ctx.lineTo(x, y + 14);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#d9deea';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Centelhas: ${this.sparks}/${this.specialThreshold}`, 36, 88);

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
      ctx.fillRect(20, 118, 220, 36);
      ctx.fillStyle = '#ffe08a';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Especial pronto (L)', 34, 142);
    }

    ctx.restore();
  }
}
