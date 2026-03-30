import { InputManager } from './input-manager';
import {
  BossArenaData,
  ChestData,
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
  hoverOffset: number;
}

interface Collectible extends CollectibleData {
  width: number;
  height: number;
  collected: boolean;
}

interface Chest extends ChestData {
  active: boolean;
  breakTimer: number;
  rewardGranted: boolean;
}

interface Boss {
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

interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  radius: number;
  active: boolean;
  waveOffset: number;
  amplitude: number;
  frequency: number;
  elapsed: number;
  damage: number;
  kind: 'normal' | 'ultimate';
}

interface LightningPoint {
  x: number;
  y: number;
}

interface SpecialStrike {
  points: LightningPoint[];
  life: number;
  maxLife: number;
  width: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
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
  private readonly chests: Chest[];
  private readonly bossArena: BossArenaData;

  private readonly hero: Hero = {
    x: 120,
    y: 500,
    width: 46,
    height: 70,
    vx: 0,
    vy: 0,
    speed: 275,
    jumpForce: 770,
    direction: 1,
    onGround: false,
    hp: 100,
    maxHp: 100,
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
    width: 146,
    height: 186,
    hp: 36,
    maxHp: 36,
    active: false,
    jumpCooldown: 3.2,
    secondaryCooldown: 2.2,
    vy: 0,
    onGround: true,
    hitFlash: 0,
    introPulse: 0,
    castTimer: 0,
    armSwing: 0,
    squashTimer: 0,
    special50Used: false,
    special15Used: false,
  };

  private cameraX = 0;
  private bullets: Bullet[] = [];
  private bossProjectiles: BossProjectile[] = [];
  private specialStrikes: SpecialStrike[] = [];
  private burstParticles: BurstParticle[] = [];

  private score = 0;
  private specialCharge = 0;
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
      y: enemy.y,
      width: enemy.type === 'vigia' ? 58 : 44,
      height: enemy.type === 'vigia' ? 72 : 50,
      speed: enemy.type === 'vigia' ? 48 : 84,
      direction: -1,
      patrolLeft: enemy.patrolLeft,
      patrolRight: enemy.patrolRight,
      hp: enemy.type === 'vigia' ? 4 : 2,
      active: true,
      hitFlash: 0,
      hoverOffset: Math.random() * Math.PI * 2,
    }));

    this.collectibles = phase.collectibles.map((item) => ({
      ...item,
      width: item.type === 'coin' ? 18 : 22,
      height: item.type === 'coin' ? 18 : 22,
      collected: false,
    }));

    this.chests = phase.chests.map((chest) => ({
      ...chest,
      active: true,
      breakTimer: 0,
      rewardGranted: false,
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
    this.updateChests(deltaTime);
    this.updateBoss(deltaTime);
    this.updateBossProjectiles(deltaTime);
    this.updateSpecialSequence(deltaTime);
    this.updateSpecialStrikes(deltaTime);
    this.updateBurstParticles(deltaTime);
    this.updateCamera();

    if (this.specialFlashTimer > 0) {
      this.specialFlashTimer = Math.max(0, this.specialFlashTimer - deltaTime);
    }

    if (this.hero.hp <= 0) {
      this.startEnding('game-over');
    }

    if (this.boss.active && this.boss.hp <= 0) {
      this.score += 1200;
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
    this.hero.invulnerabilityTimer = Math.max(0, this.hero.invulnerabilityTimer - deltaTime);
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
      this.hero.shootCooldown = 0.22;
      this.hero.castTimer = 0.16;
    }

    if (
      this.input.isJustPressed('l') &&
      this.specialCharge >= 100 &&
      !this.specialSequenceActive
    ) {
      this.activateSpecial();
      this.hero.castTimer = 0.42;
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
          : this.hero.x - 18,
      y: this.hero.y + 26,
      width: 18,
      height: 10,
      vx: this.hero.direction * 610,
      active: true,
    });
  }

  private activateSpecial(): void {
    this.specialCharge = 0;
    this.specialSequenceActive = true;
    this.specialPulsesRemaining = 4;
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

    this.specialPulseTimer = 0.11;
  }

  private releaseSpecialPulse(): void {
    const originX = this.hero.x + this.hero.width / 2;
    const originY = this.hero.y + this.hero.height / 2;
    const direction = this.hero.direction;

    const offsets = [-110, -40, 35, 105];

    for (const offset of offsets) {
      this.specialStrikes.push({
        points: this.buildLightningPath(
          originX,
          originY + offset * 0.18,
          direction,
        ),
        life: 0.26,
        maxLife: 0.26,
        width: offset === -40 || offset === 35 ? 15 : 9,
      });
    }

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      const enemyCenterX = enemy.x + enemy.width / 2;
      const enemyCenterY = enemy.y + enemy.height / 2;
      const inFront =
        direction === 1
          ? enemyCenterX >= originX - 20
          : enemyCenterX <= originX + 20;
      const closeEnoughX = Math.abs(enemyCenterX - originX) <= 980;
      const closeEnoughY = Math.abs(enemyCenterY - originY) <= 240;

      if (inFront && closeEnoughX && closeEnoughY) {
        enemy.hp = 0;
        enemy.active = false;
        this.score += enemy.type === 'vigia' ? 100 : 50;
        this.spawnBurst(enemyCenterX, enemyCenterY, '#7de8ff', 14);
      }
    }

    for (const chest of this.chests) {
      if (!chest.active) {
        continue;
      }

      const chestCenterX = chest.x + chest.width / 2;
      const chestCenterY = chest.y + chest.height / 2;
      const inFront =
        direction === 1
          ? chestCenterX >= originX - 20
          : chestCenterX <= originX + 20;
      const closeEnoughX = Math.abs(chestCenterX - originX) <= 980;
      const closeEnoughY = Math.abs(chestCenterY - originY) <= 240;

      if (inFront && closeEnoughX && closeEnoughY) {
        this.breakChest(chest);
      }
    }

    if (this.boss.active && this.boss.hp > 0) {
      this.boss.hp = Math.max(0, this.boss.hp - 7);
      this.boss.hitFlash = 0.2;
      this.spawnBurst(
        this.boss.x + this.boss.width / 2,
        this.boss.y + this.boss.height / 2,
        '#7de8ff',
        18,
      );
    }

    this.bossProjectiles = [];
  }

  private buildLightningPath(
    startX: number,
    startY: number,
    direction: 1 | -1,
  ): LightningPoint[] {
    const points: LightningPoint[] = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    const segmentLength = 82;

    for (let index = 0; index < 13; index += 1) {
      x += segmentLength * direction;
      y += this.randomRange(-34, 34);
      points.push({ x, y });
    }

    return points;
  }

  private updateSpecialStrikes(deltaTime: number): void {
    for (const strike of this.specialStrikes) {
      strike.life -= deltaTime;
    }

    this.specialStrikes = this.specialStrikes.filter(
      (strike) => strike.life > 0,
    );
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
            this.spawnBurst(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              '#ff8b5e',
              10,
            );
          }

          break;
        }
      }

      if (!bullet.active) {
        continue;
      }

      for (const chest of this.chests) {
        if (!chest.active) {
          continue;
        }

        if (this.rectsOverlap(bullet, chest)) {
          bullet.active = false;
          this.breakChest(chest);
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
        this.spawnBurst(
          this.boss.x + this.boss.width / 2,
          this.boss.y + 74,
          '#ff8b5e',
          8,
        );
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
      enemy.hoverOffset += deltaTime * (enemy.type === 'vigia' ? 1.1 : 0.9);

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
        this.applyHeroDamage(enemy.type === 'vigia' ? 18 : 12);
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
            this.score += 8;
            break;
          case 'heart':
            this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 20);
            this.spawnBurst(item.x, item.y, '#72ff95', 10);
            break;
          case 'ray':
            this.specialCharge = Math.min(100, this.specialCharge + 10);
            this.score += 15;
            this.spawnBurst(item.x, item.y, '#7de8ff', 12);
            break;
        }
      }
    }
  }

  private updateChests(deltaTime: number): void {
    for (const chest of this.chests) {
      if (chest.breakTimer > 0) {
        chest.breakTimer = Math.max(0, chest.breakTimer - deltaTime);
      }
    }
  }

  private breakChest(chest: Chest): void {
    if (!chest.active) {
      return;
    }

    chest.active = false;
    chest.breakTimer = 0.58;

    if (!chest.rewardGranted) {
      chest.rewardGranted = true;

      if (chest.rare) {
        this.specialCharge = Math.min(100, this.specialCharge + 100);
        this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 25);
        this.score += 150;
      } else {
        this.specialCharge = Math.min(100, this.specialCharge + 100);
        this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 20);
        this.score += 80;
      }
    }

    this.spawnBurst(
      chest.x + chest.width / 2,
      chest.y + chest.height / 2,
      '#ffda7d',
      chest.rare ? 20 : 16,
    );
    this.spawnBurst(
      chest.x + chest.width / 2,
      chest.y + chest.height / 2,
      '#7de8ff',
      chest.rare ? 16 : 12,
    );
    this.spawnBurst(
      chest.x + chest.width / 2,
      chest.y + chest.height / 2,
      '#72ff95',
      chest.rare ? 12 : 8,
    );
  }

  private updateBoss(deltaTime: number): void {
    if (!this.boss.active && this.hero.x >= this.bossArena.startX - 240) {
      this.boss.active = true;
      this.boss.introPulse = 1.5;
    }

    if (!this.boss.active || this.boss.hp <= 0) {
      return;
    }

    const bossHpRatio = this.boss.hp / this.boss.maxHp;

    this.boss.hitFlash = Math.max(0, this.boss.hitFlash - deltaTime);
    this.boss.secondaryCooldown -= deltaTime;
    this.boss.jumpCooldown -= deltaTime;
    this.boss.introPulse = Math.max(0, this.boss.introPulse - deltaTime);
    this.boss.castTimer = Math.max(0, this.boss.castTimer - deltaTime);
    this.boss.squashTimer = Math.max(0, this.boss.squashTimer - deltaTime);
    this.boss.armSwing += deltaTime * (this.boss.castTimer > 0 ? 8 : 2.8);

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

    if (!this.boss.special50Used && bossHpRatio <= 0.5) {
      this.fireBossUltimateShot();
      this.boss.special50Used = true;
      this.boss.castTimer = 0.9;
      this.boss.secondaryCooldown = 1.2;
    } else if (!this.boss.special15Used && bossHpRatio <= 0.15) {
      this.fireBossUltimateShot();
      this.boss.special15Used = true;
      this.boss.castTimer = 0.9;
      this.boss.secondaryCooldown = 1;
    } else if (this.boss.secondaryCooldown <= 0) {
      this.fireBossWaveShot();
      this.boss.secondaryCooldown = bossHpRatio <= 0.3 ? 1.1 : 1.65;
      this.boss.castTimer = 0.45;
    }

    if (
      this.hero.invulnerabilityTimer <= 0 &&
      this.rectsOverlap(this.hero, this.boss)
    ) {
      this.applyHeroDamage(20);
    }
  }

  private startBossJump(): void {
    this.boss.vy = -820;
    this.boss.onGround = false;
    this.boss.jumpCooldown = this.randomRange(2.1, 3.4);
  }

  private updateBossPhysics(deltaTime: number): void {
    if (this.boss.onGround) {
      return;
    }

    this.boss.vy += (this.gravity + 900) * deltaTime;
    this.boss.y += this.boss.vy * deltaTime;

    const bossGround = this.bossArena.groundY - this.boss.height;

    if (this.boss.y >= bossGround) {
      this.boss.y = bossGround;
      this.boss.vy = 0;
      this.boss.onGround = true;
      this.boss.squashTimer = 0.16;
      this.spawnBurst(
        this.boss.x + this.boss.width / 2,
        this.boss.y + this.boss.height - 4,
        '#8b3d55',
        10,
      );
    }
  }

  private fireBossWaveShot(): void {
    const count = this.boss.hp / this.boss.maxHp <= 0.3 ? 3 : 2;

    for (let index = 0; index < count; index += 1) {
      this.bossProjectiles.push({
        x: this.boss.x + 26,
        y: this.boss.y + 126 + index * 8,
        vx: -185 - index * 10,
        radius: 13,
        active: true,
        waveOffset: Math.random() * Math.PI * 2,
        amplitude: 18 + index * 6,
        frequency: 6.1 + index * 0.25,
        elapsed: 0,
        damage: 16,
        kind: 'normal',
      });
    }
  }

  private fireBossUltimateShot(): void {
    this.bossProjectiles.push({
      x: this.boss.x + 24,
      y: this.boss.y + 120,
      vx: -155,
      radius: 28,
      active: true,
      waveOffset: Math.random() * Math.PI * 2,
      amplitude: 10,
      frequency: 4.3,
      elapsed: 0,
      damage: 30,
      kind: 'ultimate',
    });
  }

  private updateBossProjectiles(deltaTime: number): void {
    for (const projectile of this.bossProjectiles) {
      if (!projectile.active) {
        continue;
      }

      projectile.elapsed += deltaTime;
      projectile.x += projectile.vx * deltaTime;
      projectile.y +=
        Math.sin(
          projectile.elapsed * projectile.frequency + projectile.waveOffset,
        ) *
        projectile.amplitude *
        deltaTime;

      if (
        projectile.x + projectile.radius < this.bossArena.startX - 80 ||
        projectile.y < 420 ||
        projectile.y > this.bossArena.groundY - 38
      ) {
        projectile.active = false;
        continue;
      }

      if (
        this.hero.invulnerabilityTimer <= 0 &&
        this.circleRectOverlap(
          projectile.x,
          projectile.y,
          projectile.radius,
          this.hero,
        )
      ) {
        projectile.active = false;
        this.applyHeroDamage(projectile.damage);
      }
    }

    this.bossProjectiles = this.bossProjectiles.filter(
      (projectile) => projectile.active,
    );
  }

  private updateBurstParticles(deltaTime: number): void {
    for (const particle of this.burstParticles) {
      particle.life -= deltaTime;
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += 420 * deltaTime;
    }

    this.burstParticles = this.burstParticles.filter(
      (particle) => particle.life > 0,
    );
  }

  private spawnBurst(
    x: number,
    y: number,
    color: string,
    amount: number,
  ): void {
    for (let index = 0; index < amount; index += 1) {
      this.burstParticles.push({
        x,
        y,
        vx: this.randomRange(-140, 140),
        vy: this.randomRange(-220, -40),
        size: this.randomRange(2, 6),
        life: this.randomRange(0.16, 0.34),
        maxLife: 0.34,
        color,
      });
    }
  }

  private applyHeroDamage(amount: number): void {
    if (this.hero.invulnerabilityTimer > 0) {
      return;
    }

    this.hero.hp = Math.max(0, this.hero.hp - amount);
    this.hero.invulnerabilityTimer = 1;
    this.hero.hurtTimer = 0.24;
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
    this.drawChests();
    this.drawSpecialStrikes();
    this.drawEnemies();
    this.drawBullets();
    this.drawBoss();
    this.drawBossProjectiles();
    this.drawBurstParticles();
    this.drawHero();

    ctx.restore();

    this.drawHud();

    if (this.specialFlashTimer > 0) {
      ctx.fillStyle = `rgba(123, 232, 255, ${Math.min(
        this.specialFlashTimer * 0.24,
        0.24,
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

    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    skyGradient.addColorStop(0, '#131620');
    skyGradient.addColorStop(0.25, '#0d1017');
    skyGradient.addColorStop(0.55, '#090b10');
    skyGradient.addColorStop(1, '#040507');

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const moonX = 980 - this.cameraX * 0.08;
    const moonY = 128;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 200);
    moonGlow.addColorStop(0, 'rgba(255, 196, 118, 0.15)');
    moonGlow.addColorStop(0.36, 'rgba(255, 142, 82, 0.09)');
    moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(81, 18, 29, 0.16)';
    ctx.beginPath();
    ctx.arc(240, 110, 170, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(18, 21, 29, 0.96)';
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.lineTo(140, 305);
    ctx.lineTo(280, 364);
    ctx.lineTo(470, 246);
    ctx.lineTo(650, 392);
    ctx.lineTo(850, 264);
    ctx.lineTo(1040, 362);
    ctx.lineTo(1280, 228);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(32, 36, 47, 0.94)';
    ctx.beginPath();
    ctx.moveTo(0, 525);
    ctx.lineTo(170, 446);
    ctx.lineTo(334, 500);
    ctx.lineTo(520, 420);
    ctx.lineTo(760, 505);
    ctx.lineTo(980, 434);
    ctx.lineTo(1280, 530);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(68, 18, 30, 0.14)';
    for (let index = 0; index < 9; index += 1) {
      const x = (index * 210 - this.cameraX * 0.19) % 1500;
      ctx.fillRect(x + 34, 478, 20, 96);
      ctx.fillRect(x, 572, 84, 44);
      ctx.fillRect(x + 58, 532, 14, 42);
    }

    ctx.fillStyle = 'rgba(208, 217, 245, 0.028)';
    ctx.beginPath();
    ctx.ellipse(640, 564, 830, 84, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(180, 195, 225, 0.022)';
    ctx.beginPath();
    ctx.ellipse(700, 620, 980, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let index = 0; index < 28; index += 1) {
      const px =
        (index * 111 + performance.now() * 0.008) %
        (this.canvas.width + 140);
      const py = 110 + ((index * 47) % 460);
      ctx.fillStyle = 'rgba(180, 190, 220, 0.038)';
      ctx.fillRect(px - 60, py, 2, 2);
    }
  }

  private drawPlatforms(): void {
    const ctx = this.ctx;

    for (const platform of this.platforms) {
      const gradient = ctx.createLinearGradient(
        platform.x,
        platform.y,
        platform.x,
        platform.y + platform.height,
      );
      gradient.addColorStop(0, '#524151');
      gradient.addColorStop(0.3, '#362b38');
      gradient.addColorStop(1, '#17141c');

      ctx.fillStyle = gradient;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

      ctx.fillStyle = '#8a7383';
      ctx.fillRect(platform.x, platform.y, platform.width, 5);

      ctx.fillStyle = '#241c24';
      for (let x = 0; x < platform.width; x += 34) {
        ctx.fillRect(platform.x + x, platform.y + 6, 17, platform.height - 12);
      }

      ctx.fillStyle = '#130f16';
      ctx.fillRect(
        platform.x,
        platform.y + platform.height - 8,
        platform.width,
        8,
      );

      ctx.strokeStyle = 'rgba(8, 8, 12, 0.65)';
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
    const runCycle = Math.sin(t * 10);
    const runOpposite = Math.sin(t * 10 + Math.PI);
    const idleFloat = Math.sin(t * 2.4) * 1.5;
    const landingCompression =
      hero.landingTimer > 0 ? hero.landingTimer / 0.16 : 0;

    let bodyBob = 0;
    let frontLegAngle = 0;
    let backLegAngle = 0;
    let frontArmAngle = 0;
    let backArmAngle = 0;
    let handGlow = 0;

    switch (hero.state) {
      case 'idle':
        bodyBob = idleFloat;
        frontLegAngle = 0.04;
        backLegAngle = -0.04;
        frontArmAngle = -0.08;
        backArmAngle = 0.08;
        break;
      case 'run':
        bodyBob = Math.abs(runCycle) * 2.4;
        frontLegAngle = runCycle * 0.85;
        backLegAngle = runOpposite * 0.7;
        frontArmAngle = runOpposite * 0.28;
        backArmAngle = runCycle * 0.22;
        break;
      case 'jump':
        bodyBob = -2;
        frontLegAngle = 0.42;
        backLegAngle = -0.16;
        frontArmAngle = -0.2;
        backArmAngle = -0.36;
        break;
      case 'fall':
        bodyBob = 1.5;
        frontLegAngle = -0.18;
        backLegAngle = 0.28;
        frontArmAngle = 0.22;
        backArmAngle = -0.1;
        break;
      case 'cast':
        bodyBob = 0;
        frontLegAngle = 0.08;
        backLegAngle = -0.04;
        frontArmAngle = -1.05;
        backArmAngle = 0.1;
        handGlow = 1;
        break;
      case 'hurt':
        bodyBob = 1;
        frontLegAngle = -0.26;
        backLegAngle = 0.26;
        frontArmAngle = 0.34;
        backArmAngle = -0.14;
        break;
    }

    bodyBob += landingCompression * 2.2;

    const centerX = hero.x + hero.width / 2;
    const topY = hero.y + 8 + bodyBob;

    ctx.save();
    ctx.translate(centerX, topY);
    ctx.scale(hero.direction, 1);

    const cloakGradient = ctx.createLinearGradient(-12, 6, -20, 54);
    cloakGradient.addColorStop(0, 'rgba(127, 22, 35, 0.72)');
    cloakGradient.addColorStop(1, 'rgba(35, 9, 14, 0.08)');
    ctx.fillStyle = cloakGradient;
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(-20, 18);
    ctx.lineTo(-18, 55 + runOpposite * 1.5);
    ctx.lineTo(-7, 46);
    ctx.closePath();
    ctx.fill();

    this.drawLimb(ctx, -5, 40, backLegAngle, 13, 12, '#2b3148', '#4d5a79', 0.88);
    this.drawLimb(ctx, 6, 40, frontLegAngle, 13, 12, '#353d57', '#5b6b90', 1);

    this.drawLimb(ctx, -7, 18, backArmAngle, 11, 0, '#35435d', '#9bb1d7', 0.84);
    this.drawLimb(ctx, 9, 18, frontArmAngle, 15, 0, '#435674', '#c2d6ff', 1);

    const torsoGradient = ctx.createLinearGradient(0, 4, 0, 34);
    torsoGradient.addColorStop(0, '#2d4664');
    torsoGradient.addColorStop(0.55, '#23384d');
    torsoGradient.addColorStop(1, '#17212f');

    ctx.fillStyle = torsoGradient;
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(9, 7);
    ctx.lineTo(11, 32);
    ctx.lineTo(2, 40);
    ctx.lineTo(-9, 36);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#191f2d';
    ctx.fillRect(-8, 28, 18, 10);

    ctx.fillStyle = '#601926';
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(-2, 8);
    ctx.lineTo(-4, 30);
    ctx.lineTo(-9, 26);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d8ba9a';
    ctx.beginPath();
    ctx.ellipse(2, 1, 9, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#14161d';
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(-3, -10);
    ctx.lineTo(5, -11);
    ctx.lineTo(10, -5);
    ctx.lineTo(8, 2);
    ctx.lineTo(1, 2);
    ctx.lineTo(-6, 1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f1117';
    ctx.fillRect(3, -1, 2, 2);
    ctx.fillRect(6, 1, 2, 1);

    if (handGlow > 0) {
      const handX = 9 + Math.cos(frontArmAngle) * 15;
      const handY = 18 + Math.sin(frontArmAngle) * 15;

      ctx.strokeStyle = 'rgba(255, 174, 102, 0.95)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(handX - 5, handY - 8);
      ctx.lineTo(handX + 1, handY - 1);
      ctx.lineTo(handX - 3, handY - 1);
      ctx.lineTo(handX + 5, handY + 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawLimb(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    firstLength: number,
    secondLength: number,
    primaryColor: string,
    secondaryColor: string,
    alpha: number,
  ): void {
    const jointX = x + Math.sin(angle) * firstLength;
    const jointY = y + Math.cos(angle) * firstLength;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(jointX, jointY);
    ctx.stroke();

    if (secondLength > 0) {
      const footX = jointX + Math.sin(angle * 0.75) * secondLength;
      const footY = jointY + Math.cos(angle * 0.75) * secondLength;

      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(jointX, jointY);
      ctx.lineTo(footX, footY);
      ctx.stroke();

      ctx.strokeStyle = '#151922';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(footX - 4, footY);
      ctx.lineTo(footX + 4, footY);
      ctx.stroke();
    } else {
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.arc(jointX, jointY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBullets(): void {
    const ctx = this.ctx;

    for (const bullet of this.bullets) {
      const centerX = bullet.x + bullet.width / 2;
      const centerY = bullet.y + bullet.height / 2;

      const glow = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, 12);
      glow.addColorStop(0, 'rgba(255, 192, 120, 0.85)');
      glow.addColorStop(0.45, 'rgba(255, 124, 72, 0.45)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff9b61';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(48, 14, 20, 0.65)';
      ctx.beginPath();
      ctx.ellipse(centerX - Math.sign(bullet.vx) * 5, centerY, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawEnemies(): void {
    const ctx = this.ctx;

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      const pulse = Math.sin(performance.now() / 260 + enemy.hoverOffset) * 0.5 + 0.5;
      const bob = Math.sin(performance.now() / 300 + enemy.hoverOffset) * (enemy.type === 'vigia' ? 2 : 1);

      ctx.save();
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + bob);
      ctx.scale(enemy.direction, 1);

      if (enemy.type === 'vigia') {
        const aura = ctx.createRadialGradient(0, -4, 2, 0, -4, 40);
        aura.addColorStop(0, 'rgba(114, 220, 255, 0.42)');
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, -4, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = enemy.hitFlash > 0 ? '#efe3d7' : '#0b0f15';
        ctx.beginPath();
        ctx.moveTo(-22, -8);
        ctx.lineTo(-10, -24);
        ctx.lineTo(14, -24);
        ctx.lineTo(24, -8);
        ctx.lineTo(18, 28);
        ctx.lineTo(-16, 28);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#182131';
        ctx.beginPath();
        ctx.moveTo(-10, -4);
        ctx.lineTo(2, -8);
        ctx.lineTo(14, -2);
        ctx.lineTo(12, 14);
        ctx.lineTo(-8, 14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#7be8ff';
        ctx.beginPath();
        ctx.arc(4, -4, 7 + pulse * 1.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(114, 220, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(4, -4);
        ctx.lineTo(14, -12);
        ctx.moveTo(-6, 10);
        ctx.lineTo(4, -4);
        ctx.lineTo(12, 8);
        ctx.stroke();

        ctx.fillStyle = '#24121b';
        ctx.fillRect(-18, -6, 8, 22);
        ctx.fillRect(18, -6, 8, 22);

        ctx.fillStyle = '#2a0c15';
        ctx.beginPath();
        ctx.moveTo(-14, -22);
        ctx.lineTo(-8, -30);
        ctx.lineTo(-6, -20);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(8, -20);
        ctx.lineTo(12, -30);
        ctx.lineTo(16, -22);
        ctx.closePath();
        ctx.fill();
      } else {
        const aura = ctx.createRadialGradient(0, -2, 1, 0, -2, 28);
        aura.addColorStop(0, 'rgba(125, 255, 178, 0.32)');
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, -2, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = enemy.hitFlash > 0 ? '#efe3d7' : '#11151b';
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.lineTo(-8, -16);
        ctx.lineTo(12, -16);
        ctx.lineTo(18, -4);
        ctx.lineTo(12, 18);
        ctx.lineTo(-12, 18);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#171c22';
        ctx.beginPath();
        ctx.moveTo(-6, -2);
        ctx.lineTo(6, -6);
        ctx.lineTo(14, 0);
        ctx.lineTo(10, 10);
        ctx.lineTo(-8, 10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#7dffb2';
        ctx.beginPath();
        ctx.arc(1, -2, 5.5 + pulse * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(125, 255, 178, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(1, -2);
        ctx.lineTo(12, 10);
        ctx.stroke();

        ctx.fillStyle = '#0d1117';
        ctx.fillRect(-18, -2, 6, 16);
        ctx.fillRect(14, -2, 6, 16);
      }

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
      }

      if (item.type === 'heart') {
        const potionGlass = ctx.createLinearGradient(item.x, y - 12, item.x, y + 12);
        potionGlass.addColorStop(0, '#8fe7ad');
        potionGlass.addColorStop(1, '#3eb46a');

        const potionLiquid = ctx.createLinearGradient(item.x, y - 2, item.x, y + 10);
        potionLiquid.addColorStop(0, '#a9ffbe');
        potionLiquid.addColorStop(1, '#48cb75');

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
      }

      if (item.type === 'ray') {
        ctx.strokeStyle = '#d0fbff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(item.x - 4, y - 10);
        ctx.lineTo(item.x + 2, y - 2);
        ctx.lineTo(item.x - 1, y - 2);
        ctx.lineTo(item.x + 5, y + 10);
        ctx.stroke();
      }
    }
  }

  private drawChests(): void {
    const ctx = this.ctx;

    for (const chest of this.chests) {
      if (chest.active) {
        ctx.save();
        ctx.translate(chest.x, chest.y);

        const bob = Math.sin(performance.now() / 230 + chest.x * 0.01) * 0.8;
        ctx.translate(0, bob);

        if (chest.rare) {
          ctx.fillStyle = '#24151f';
          ctx.fillRect(2, 12, chest.width - 4, chest.height - 10);

          ctx.fillStyle = '#5b2f6f';
          ctx.fillRect(0, 10, chest.width, chest.height - 10);

          ctx.fillStyle = '#8a58a8';
          ctx.beginPath();
          ctx.moveTo(0, 12);
          ctx.lineTo(chest.width / 2, 0);
          ctx.lineTo(chest.width, 12);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#d6fbff';
          ctx.fillRect(chest.width / 2 - 4, 12, 8, 9);
          ctx.fillRect(6, 18, chest.width - 12, 3);

          ctx.strokeStyle = 'rgba(214, 251, 255, 0.42)';
          ctx.strokeRect(1, 11, chest.width - 2, chest.height - 11);
        } else {
          ctx.fillStyle = '#2b170e';
          ctx.fillRect(2, 12, chest.width - 4, chest.height - 10);

          ctx.fillStyle = '#5d3a1f';
          ctx.fillRect(0, 10, chest.width, chest.height - 10);

          ctx.fillStyle = '#7b522b';
          ctx.beginPath();
          ctx.moveTo(0, 12);
          ctx.lineTo(chest.width / 2, 0);
          ctx.lineTo(chest.width, 12);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#b8945b';
          ctx.fillRect(chest.width / 2 - 4, 12, 8, 9);
          ctx.fillRect(6, 18, chest.width - 12, 3);

          ctx.strokeStyle = 'rgba(255, 225, 170, 0.18)';
          ctx.strokeRect(1, 11, chest.width - 2, chest.height - 11);
        }

        ctx.restore();
      } else if (chest.breakTimer > 0) {
        const progress = chest.breakTimer / 0.58;
        const spread = (1 - progress) * 24;
        const alpha = progress;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.fillStyle = chest.rare ? '#8a58a8' : '#7b522b';
        ctx.fillRect(chest.x - spread, chest.y + 8, 14, 10);
        ctx.fillRect(chest.x + chest.width - 4 + spread, chest.y + 5, 14, 10);
        ctx.fillRect(chest.x + 10, chest.y + chest.height - 8 + spread * 0.25, 16, 8);

        ctx.fillStyle = chest.rare
          ? 'rgba(214, 251, 255, 0.45)'
          : 'rgba(255, 225, 170, 0.35)';
        ctx.fillRect(chest.x + chest.width / 2 - 2, chest.y - 4 - spread * 0.15, 4, 10);

        ctx.restore();
      }
    }
  }

  private drawBoss(): void {
    if (!this.boss.active || this.boss.hp <= 0) {
      return;
    }

    const ctx = this.ctx;
    const boss = this.boss;
    const pulse = Math.sin(performance.now() / 180) * 0.5 + 0.5;
    const introBoost = boss.introPulse > 0 ? boss.introPulse * 0.35 : 0;
    const armMotion = Math.sin(boss.armSwing) * 0.32;
    const torsoLean =
      boss.castTimer > 0
        ? -0.07
        : Math.sin(performance.now() / 520) * 0.02;
    const jumpStretch = !boss.onGround ? 1.05 : 1;
    const jumpSquash = !boss.onGround ? 0.95 : 1;
    const landingSquash =
      boss.squashTimer > 0 ? 1 + (boss.squashTimer / 0.16) * 0.08 : 1;
    const landingCompressY =
      boss.squashTimer > 0 ? 1 - (boss.squashTimer / 0.16) * 0.06 : 1;

    ctx.save();
    ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);

    const auraRadius = 116 + pulse * 8 + introBoost * 40;
    const aura = ctx.createRadialGradient(0, -10, 12, 0, -10, auraRadius);
    aura.addColorStop(0, 'rgba(73, 8, 18, 0.82)');
    aura.addColorStop(0.38, 'rgba(104, 0, 41, 0.34)');
    aura.addColorStop(0.7, 'rgba(91, 16, 72, 0.12)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -10, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    const shadowScale = boss.onGround ? 1 : 0.72;
    const shadowAlpha = boss.onGround ? 0.3 : 0.18;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      boss.height / 2 - 2,
      78 * shadowScale,
      14 * shadowScale,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.save();
    ctx.scale(jumpStretch * landingSquash, jumpSquash * landingCompressY);
    ctx.rotate(torsoLean);

    ctx.fillStyle = boss.hitFlash > 0 ? '#f5ece5' : '#090a0f';
    ctx.beginPath();
    ctx.moveTo(-52, -52);
    ctx.lineTo(-26, -84);
    ctx.lineTo(30, -84);
    ctx.lineTo(50, -50);
    ctx.lineTo(40, 72);
    ctx.lineTo(-42, 72);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#131823';
    ctx.beginPath();
    ctx.moveTo(-24, -18);
    ctx.lineTo(4, -28);
    ctx.lineTo(26, -16);
    ctx.lineTo(18, 24);
    ctx.lineTo(-18, 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#171922';
    this.drawBossArm(ctx, -62, -26, -0.46 - armMotion - (boss.castTimer > 0 ? 0.3 : 0), true);
    this.drawBossArm(ctx, 60, -24, 0.38 + armMotion + (boss.castTimer > 0 ? 0.1 : 0), false);

    ctx.fillStyle = '#24121b';
    ctx.fillRect(-54, -8, 12, 36);
    ctx.fillRect(44, -8, 12, 34);

    ctx.fillStyle = '#240912';
    ctx.beginPath();
    ctx.moveTo(-40, -70);
    ctx.lineTo(-32, -88);
    ctx.lineTo(-24, -68);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(18, -68);
    ctx.lineTo(30, -90);
    ctx.lineTo(40, -70);
    ctx.closePath();
    ctx.fill();

    const coreGlow = ctx.createRadialGradient(4, -12, 4, 4, -12, 42 + pulse * 5);
    coreGlow.addColorStop(0, 'rgba(210, 250, 255, 1)');
    coreGlow.addColorStop(0.22, 'rgba(140, 232, 255, 0.95)');
    coreGlow.addColorStop(0.5, 'rgba(104, 202, 255, 0.7)');
    coreGlow.addColorStop(1, 'rgba(104, 202, 255, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(4, -12, 42 + pulse * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9bf5ff';
    ctx.beginPath();
    ctx.arc(4, -12, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(125, 232, 255, ${0.35 + pulse * 0.2})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-30, -40);
    ctx.lineTo(4, -12);
    ctx.lineTo(32, -42);
    ctx.moveTo(-22, 16);
    ctx.lineTo(4, -12);
    ctx.lineTo(28, 16);
    ctx.stroke();

    ctx.fillStyle = '#171922';
    ctx.beginPath();
    ctx.moveTo(-18, 68);
    ctx.lineTo(10, 68);
    ctx.lineTo(14, 86);
    ctx.lineTo(-20, 86);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  private drawBossArm(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    left: boolean,
  ): void {
    const length = 40;
    const handX = x + Math.cos(angle) * length;
    const handY = y + Math.sin(angle) * length;

    ctx.strokeStyle = '#171922';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    ctx.fillStyle = '#0e1016';
    ctx.beginPath();
    ctx.arc(handX, handY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2a0c15';
    ctx.beginPath();
    if (left) {
      ctx.moveTo(handX - 8, handY);
      ctx.lineTo(handX - 16, handY + 8);
      ctx.lineTo(handX - 4, handY + 6);
    } else {
      ctx.moveTo(handX + 8, handY);
      ctx.lineTo(handX + 16, handY + 8);
      ctx.lineTo(handX + 4, handY + 6);
    }
    ctx.closePath();
    ctx.fill();
  }

  private drawBossProjectiles(): void {
    const ctx = this.ctx;

    for (const projectile of this.bossProjectiles) {
      if (!projectile.active) {
        continue;
      }

      const glow = ctx.createRadialGradient(
        projectile.x,
        projectile.y,
        1,
        projectile.x,
        projectile.y,
        projectile.radius * 2.4,
      );

      if (projectile.kind === 'ultimate') {
        glow.addColorStop(0, 'rgba(255, 198, 137, 0.9)');
        glow.addColorStop(0.4, 'rgba(153, 69, 219, 0.62)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        glow.addColorStop(0, 'rgba(168, 240, 255, 0.9)');
        glow.addColorStop(0.32, 'rgba(134, 80, 255, 0.58)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
      }

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(
        projectile.x,
        projectile.y,
        projectile.radius * 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = projectile.kind === 'ultimate' ? '#ffb77a' : '#8deeff';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle =
        projectile.kind === 'ultimate'
          ? 'rgba(255, 226, 190, 0.7)'
          : 'rgba(214, 251, 255, 0.7)';
      ctx.lineWidth = projectile.kind === 'ultimate' ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(projectile.x - 5, projectile.y - 6);
      ctx.lineTo(projectile.x + 2, projectile.y);
      ctx.lineTo(projectile.x - 2, projectile.y);
      ctx.lineTo(projectile.x + 6, projectile.y + 8);
      ctx.stroke();
    }
  }

  private drawSpecialStrikes(): void {
    const ctx = this.ctx;

    for (const strike of this.specialStrikes) {
      const alpha = strike.life / strike.maxLife;

      ctx.strokeStyle = `rgba(117, 234, 255, ${alpha * 0.34})`;
      ctx.lineWidth = strike.width * 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      for (let index = 0; index < strike.points.length; index += 1) {
        const point = strike.points[index];

        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.stroke();

      ctx.strokeStyle = `rgba(220, 252, 255, ${alpha})`;
      ctx.lineWidth = strike.width;
      ctx.beginPath();

      for (let index = 0; index < strike.points.length; index += 1) {
        const point = strike.points[index];

        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.stroke();

      ctx.strokeStyle = `rgba(121, 202, 255, ${alpha * 0.8})`;
      ctx.lineWidth = Math.max(2, strike.width * 0.34);
      ctx.beginPath();

      for (let index = 0; index < strike.points.length; index += 1) {
        const point = strike.points[index];

        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.stroke();
    }
  }

  private drawBurstParticles(): void {
    const ctx = this.ctx;

    for (const particle of this.burstParticles) {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = this.hexToRgba(particle.color, alpha);

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawHud(): void {
    const ctx = this.ctx;
    const heroPanelX = 20;
    const heroPanelY = 18;
    const heroPanelWidth = 360;
    const heroPanelHeight = 104;

    ctx.save();

    ctx.fillStyle = 'rgba(6, 8, 12, 0.62)';
    ctx.fillRect(heroPanelX, heroPanelY, heroPanelWidth, heroPanelHeight);
    ctx.fillRect(this.canvas.width - 250, 18, 230, 94);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f4e7c7';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(this.hero.name, heroPanelX + 18, heroPanelY + 28);

    const hpBarX = heroPanelX + 18;
    const hpBarY = heroPanelY + 40;
    const hpBarWidth = 180;
    const hpBarHeight = 14;
    const hpPercent = this.hero.hp / this.hero.maxHp;

    ctx.fillStyle = '#181b24';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    let hpColor = '#58d26c';

    if (hpPercent <= 0.15) {
      const blink = Math.floor(performance.now() / 150) % 2 === 0;
      hpColor = blink ? '#ff425d' : '#8f182b';
    } else if (hpPercent <= 0.5) {
      hpColor = '#58d26c';
    }

    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

    ctx.strokeStyle = 'rgba(244, 231, 199, 0.22)';
    ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    ctx.fillStyle = '#cfd8ea';
    ctx.font = '13px Arial';
    ctx.fillText('Vida', hpBarX + hpBarWidth + 14, hpBarY + 11);

    const specialBarX = heroPanelX + 18;
    const specialBarY = heroPanelY + 72;
    const specialBarWidth = 180;
    const specialBarHeight = 12;
    const specialPercent = this.specialCharge / 100;

    ctx.fillStyle = '#131923';
    ctx.fillRect(specialBarX, specialBarY, specialBarWidth, specialBarHeight);

    const specialGradient = ctx.createLinearGradient(
      specialBarX,
      specialBarY,
      specialBarX + specialBarWidth,
      specialBarY,
    );
    specialGradient.addColorStop(0, '#5ac9ff');
    specialGradient.addColorStop(0.5, '#8eeaff');
    specialGradient.addColorStop(1, '#d6fbff');

    ctx.fillStyle = specialGradient;
    ctx.fillRect(
      specialBarX,
      specialBarY,
      specialBarWidth * specialPercent,
      specialBarHeight,
    );

    ctx.strokeStyle =
      this.specialCharge >= 100
        ? '#d6fbff'
        : 'rgba(141, 215, 255, 0.35)';
    ctx.lineWidth = this.specialCharge >= 100 ? 2.4 : 1;
    ctx.strokeRect(
      specialBarX,
      specialBarY,
      specialBarWidth,
      specialBarHeight,
    );

    if (this.specialCharge >= 100) {
      ctx.strokeStyle = 'rgba(168, 240, 255, 0.45)';
      ctx.strokeRect(
        specialBarX - 3,
        specialBarY - 3,
        specialBarWidth + 6,
        specialBarHeight + 6,
      );
    }

    ctx.fillStyle = '#d9deea';
    ctx.font = '15px Arial';
    ctx.fillText('Especial', specialBarX + specialBarWidth + 14, specialBarY + 10);

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

    if (this.specialCharge >= 100) {
      ctx.fillStyle = 'rgba(117, 234, 255, 0.14)';
      ctx.fillRect(20, 132, 250, 34);
      ctx.fillStyle = '#d6fbff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Especial pronto (L)', 34, 154);
    }

    ctx.restore();
  }

  private hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');

    if (normalized.length !== 6) {
      return `rgba(255,255,255,${alpha})`;
    }

    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
