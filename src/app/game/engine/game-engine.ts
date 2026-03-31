import { EngineCallbacks } from '../../core/models/game/engine-callbacks.model';
import { PhaseOneScene } from '../content/phases/phase-01-ruinas-do-vale/phase-01.data';
import { Boss } from '../domain/bosses/boss.model';
import { BossProjectile } from '../domain/bosses/boss-projectile.model';
import { BurstParticle } from '../domain/combat/burst-particle.model';
import { Bullet } from '../domain/combat/bullet.model';
import { LightningPoint, SpecialStrike } from '../domain/combat/special-strike.model';
import { Enemy } from '../domain/enemies/enemy.model';
import { Hero } from '../domain/hero/hero.model';
import { BossArenaData } from '../domain/world/boss-arena.model';
import { Chest } from '../domain/world/chest.model';
import { Collectible } from '../domain/world/collectible.model';
import { Platform } from '../domain/world/platform.model';
import { GameStateService } from '../services/game-state.service';
import { InputManager } from './input-manager';
import { drawBoss, drawBossProjectiles } from './render/boss-renderer';
import { drawEnemies } from './render/enemy-renderer';
import { drawHero } from './render/hero-renderer';
import { drawHud } from './render/hud-renderer';
import {
  drawBackground,
  drawBurstParticles,
  drawChests,
  drawCollectibles,
  drawPlatforms,
  drawSpecialStrikes,
} from './render/world-renderer';

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

    drawBackground(ctx, this.canvas, this.cameraX);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    drawPlatforms(ctx, this.platforms);
    drawCollectibles(ctx, this.collectibles);
    drawChests(ctx, this.chests);
    drawSpecialStrikes(ctx, this.specialStrikes);
    drawEnemies(ctx, this.enemies);
    this.drawBullets();
    drawBoss(ctx, this.boss);
    drawBossProjectiles(ctx, this.bossProjectiles);
    drawBurstParticles(ctx, this.burstParticles);
    drawHero(ctx, this.hero);

    ctx.restore();

    drawHud(
      ctx,
      this.canvas,
      this.hero,
      this.specialCharge,
      this.score,
      this.boss,
    );

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
      ctx.ellipse(
        centerX - Math.sign(bullet.vx) * 5,
        centerY,
        4,
        2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}
