import { EngineCallbacks } from '../../core/models/game/engine-callbacks.model';
import { Boss } from '../domain/bosses/boss.model';
import { BossProjectile } from '../domain/bosses/boss-projectile.model';
import { BurstParticle } from '../domain/combat/burst-particle.model';
import { Bullet } from '../domain/combat/bullet.model';
import { SpecialStrike } from '../domain/combat/special-strike.model';
import { EnemyProjectile } from '../domain/enemies/enemy-projectile.model';
import { Enemy } from '../domain/enemies/enemy.model';
import { Hero } from '../domain/hero/hero.model';
import { BossArenaData } from '../domain/world/boss-arena.model';
import { Chest } from '../domain/world/chest.model';
import { Collectible } from '../domain/world/collectible.model';
import { Hazard } from '../domain/world/hazard.model';
import { PhasePlayableData } from '../domain/world/phase-playable-data.model';
import { Platform } from '../domain/world/platform.model';
import { Tunnel } from '../domain/world/tunnel.model';
import { GameStateService } from '../services/game-state.service';
import { InputManager } from './input-manager';
import { drawBoss, drawBossProjectiles } from './render/boss-renderer';
import {
  drawEnemies,
  drawEnemyProjectiles,
} from './render/enemy-renderer';
import { drawHero } from './render/hero-renderer';
import { drawHud } from './render/hud-renderer';
import {
  drawBackground,
  drawBurstParticles,
  drawChests,
  drawCollectibles,
  drawHazards,
  drawPlatforms,
  drawSpecialStrikes,
  drawTunnels,
} from './render/world-renderer';

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly input = new InputManager();
  private readonly callbacks: EngineCallbacks;
  private readonly gameState: GameStateService;
  private readonly phaseData: PhasePlayableData;

  private animationFrameId = 0;
  private lastTime = 0;

  private readonly gravity = 2350;
  private readonly fallBoost = 1350;
  private readonly captainAttackRange = 230;

  private readonly worldWidth: number;
  private readonly platforms: Platform[];
  private readonly enemies: Enemy[];
  private readonly collectibles: Collectible[];
  private readonly chests: Chest[];
  private readonly bossArena: BossArenaData;
  private readonly hazards: Hazard[];
  private readonly tunnels: Tunnel[];

  private readonly maxLives = 3;
  private lives = 3;

  private readonly checkpointXs: number[];
  private checkpointIndex = 0;
  private respawnX = 48;
  private respawnY = 0;
  private respawningTimer = 0;

  private bossIntroShown = false;
  private bossIntroPending = false;

  private readonly hero: Hero = {
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
    castDuration: 0,
    castAim: 'forward',
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
  private enemyProjectiles: EnemyProjectile[] = [];
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
  private bossAttackPatternIndex = 0;
  private ending: 'game-over' | 'victory' | null = null;
  private endingTimer = 0;

  private collectedCoins = 0;
  private collectedSparks = 0;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gameState: GameStateService,
    phaseData: PhasePlayableData,
    callbacks: EngineCallbacks,
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.gameState = gameState;
    this.phaseData = phaseData;
    this.callbacks = callbacks;
    this.worldWidth = phaseData.worldWidth;
    this.platforms = [...phaseData.platforms].sort((a, b) => a.x - b.x);
    this.bossArena = phaseData.bossArena;

    this.hazards = (phaseData.hazards ?? []).map((hazard) => ({
      ...hazard,
      active: true,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    this.tunnels = (phaseData.tunnels ?? []).map((tunnel) => ({ ...tunnel }));

    this.gameState.resetCurrentPhaseTimer();

    this.hero.maxHp = this.gameState.heroProgress.maxHp;
    this.hero.hp = this.gameState.heroProgress.currentHp;

    this.boss.x = this.bossArena.bossX;
    this.boss.y = this.getBossGroundTop();
    this.boss.hp = phaseData.definition.boss.maxHp;
    this.boss.maxHp = phaseData.definition.boss.maxHp;

    this.enemies = phaseData.enemies.map((enemy) => ({
      type: enemy.type,
      x: enemy.x,
      y: enemy.y,
      width: enemy.type === 'vigia' ? 58 : 44,
      height: enemy.type === 'vigia' ? 72 : 50,
      speed:
        enemy.type === 'vigia'
          ? 48 + phaseData.definition.difficulty * 2
          : 84 + phaseData.definition.difficulty * 2,
      direction: -1,
      patrolLeft: enemy.patrolLeft,
      patrolRight: enemy.patrolRight,
      hp:
        enemy.type === 'vigia'
          ? 4 + Math.floor(this.phaseData.definition.difficulty / 2)
          : 2 + Math.floor(this.phaseData.definition.difficulty / 3),
      active: true,
      hitFlash: 0,
      hoverOffset: Math.random() * Math.PI * 2,
      baseX: enemy.x,
      baseY: enemy.y,
      respawnTimer: 0,
      respawnDelay: enemy.type === 'vigia' ? 42 : 33,
      shootCooldown:
        enemy.type === 'vigia'
          ? this.randomRange(0.55, 2.2)
          : 999,
      shotDirection: Math.random() > 0.5 ? 1 : -1,
    }));

    this.collectibles = phaseData.collectibles.map((item) => ({
      ...item,
      width: item.type === 'coin' ? 18 : 22,
      height: item.type === 'coin' ? 18 : 22,
      collected: false,
      vy: 0,
      falling: false,
      settled: false,
    }));

    this.chests = phaseData.chests.map((chest) => ({
      ...chest,
      active: true,
      breakTimer: 0,
      rewardGranted: false,
    }));

    this.checkpointXs = this.buildCheckpointXs();
    this.setCheckpoint(this.checkpointXs[0]);
    this.placeHeroAtRespawn(true);
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

  resumeBossBattle(): void {
    this.bossIntroPending = false;
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

    if (this.paused || this.bossIntroPending) {
      return;
    }

    this.gameState.addPhaseElapsedTime(deltaTime * 1000);
    this.gameState.setCurrentScore(this.score);

    if (this.gameState.isPhaseTimeExceeded) {
      this.startEnding('game-over');
      return;
    }

    if (this.respawningTimer > 0) {
      this.updateRespawnTimer(deltaTime);
      this.updateBurstParticles(deltaTime);
      this.updateSpecialStrikes(deltaTime);
      this.updateCamera();
      return;
    }

    this.updateHero(deltaTime);
    this.updateProgressScore();
    this.updateCheckpointProgress();
    this.updateBullets(deltaTime);
    this.updateEnemyProjectiles(deltaTime);
    this.updateEnemies(deltaTime);
    this.updateCollectibles();
    this.updateChests(deltaTime);
    this.updateBoss(deltaTime);
    this.updateBossProjectiles(deltaTime);
    this.updateSpecialSequence(deltaTime);
    this.updateSpecialStrikes(deltaTime);
    this.updateBurstParticles(deltaTime);
    this.updateHazards(deltaTime);
    this.updateCamera();

    if (this.specialFlashTimer > 0) {
      this.specialFlashTimer = Math.max(0, this.specialFlashTimer - deltaTime);
    }

    if (this.hero.y > this.canvas.height + 260) {
      this.loseLife();
    }

    if (this.lives <= 0) {
      this.startEnding('game-over');
    }

    if (this.boss.active && this.boss.hp <= 0) {
      this.gameState.finalizeCurrentPhaseTime();
      this.score += 1200;
      this.startEnding('victory');
    }
  }

  private updateRespawnTimer(deltaTime: number): void {
    this.respawningTimer = Math.max(0, this.respawningTimer - deltaTime);

    if (this.respawningTimer > 0) {
      return;
    }

    this.placeHeroAtRespawn();
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
    const isLockedInUpCast =
      this.hero.castTimer > 0 && this.hero.castAim === 'up';

    this.hero.animationTime += deltaTime;
    this.hero.shootCooldown = Math.max(0, this.hero.shootCooldown - deltaTime);
    this.hero.dashCooldown = Math.max(0, this.hero.dashCooldown - deltaTime);
    this.hero.invulnerabilityTimer = Math.max(0, this.hero.invulnerabilityTimer - deltaTime);
    this.hero.castTimer = Math.max(0, this.hero.castTimer - deltaTime);
    this.hero.hurtTimer = Math.max(0, this.hero.hurtTimer - deltaTime);
    this.hero.landingTimer = Math.max(0, this.hero.landingTimer - deltaTime);

    if (this.hero.castTimer <= 0) {
      this.hero.castDuration = 0;
      this.hero.castAim = 'forward';
    }

    const movingLeft =
      !isLockedInUpCast &&
      (this.input.isPressed('a') || this.input.isPressed('arrowleft'));
    const movingRight =
      !isLockedInUpCast &&
      (this.input.isPressed('d') || this.input.isPressed('arrowright'));

    const runBlend = Math.min(1, deltaTime * 11);
    const targetVx = movingLeft && !movingRight
      ? -this.hero.speed
      : movingRight && !movingLeft
        ? this.hero.speed
        : 0;

    this.hero.vx += (targetVx - this.hero.vx) * runBlend;

    if (Math.abs(this.hero.vx) < 4) {
      this.hero.vx = 0;
    }

    if (movingLeft && !movingRight) {
      this.hero.direction = -1;
    } else if (movingRight && !movingLeft) {
      this.hero.direction = 1;
    }

    if (
      !isLockedInUpCast &&
      (this.input.isJustPressed(' ') ||
        this.input.isJustPressed('w') ||
        this.input.isJustPressed('arrowup')) &&
      this.hero.jumpsRemaining > 0
    ) {
      this.hero.vy = -this.hero.jumpForce;
      this.hero.jumpsRemaining -= 1;
      this.hero.onGround = false;
    }

    if (!isLockedInUpCast && this.input.isJustPressed('k') && this.hero.dashCooldown <= 0) {
      this.hero.vx = this.hero.direction * 610;
      this.hero.dashCooldown = 0.7;
    }

    if (!isLockedInUpCast && this.input.isJustPressed('j') && this.hero.shootCooldown <= 0) {
      this.fireBullet('forward');
      this.hero.shootCooldown = 0.22;
      this.hero.castTimer = 0.16;
      this.hero.castDuration = 0.16;
      this.hero.castAim = 'forward';
    }

    if (!isLockedInUpCast && this.input.isJustPressed('i') && this.hero.shootCooldown <= 0) {
      this.fireBullet('upward');
      this.hero.shootCooldown = 0.28;
      this.hero.castTimer = 0.32;
      this.hero.castDuration = 0.32;
      this.hero.castAim = 'up';
      this.hero.vx = 0;
    }

    if (
      !isLockedInUpCast &&
      this.input.isJustPressed('l') &&
      this.specialCharge >= 100 &&
      !this.specialSequenceActive
    ) {
      this.activateSpecial();
      this.hero.castTimer = 2.1;
      this.hero.castDuration = 2.1;
      this.hero.castAim = 'forward';
    }

    const gravityThisFrame =
      this.hero.vy > 0 ? this.gravity + this.fallBoost : this.gravity;

    this.hero.vy += gravityThisFrame * deltaTime;

    this.moveHeroHorizontally(deltaTime);
    this.moveHeroVertically(deltaTime);
    this.resolveTunnelCeilingCollision();

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

    for (const hazard of this.hazards) {
      if (!hazard.active || !this.rectsOverlap(this.hero, hazard)) {
        continue;
      }

      if (this.hero.vx > 0) {
        this.hero.x = hazard.x - this.hero.width;
      } else if (this.hero.vx < 0) {
        this.hero.x = hazard.x + hazard.width;
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

  private resolveTunnelCeilingCollision(): void {
    if (this.hero.vy >= 0) {
      return;
    }

    for (const tunnel of this.tunnels) {
      const heroRight = this.hero.x + this.hero.width;
      const heroLeft = this.hero.x;
      const overlapsX = heroRight > tunnel.x && heroLeft < tunnel.x + tunnel.width;

      if (!overlapsX) {
        continue;
      }

      const heroTop = this.hero.y;
      const roofBottom = tunnel.ceilingY + tunnel.thickness;

      if (heroTop <= roofBottom && heroTop >= tunnel.ceilingY - 18) {
        this.hero.y = roofBottom;
        this.hero.vy = 0;
      }
    }
  }

  private fireBullet(kind: 'forward' | 'upward'): void {
    if (kind === 'upward') {
      this.bullets.push({
        x: this.hero.x + this.hero.width / 2 - 5,
        y: this.hero.y + 4,
        width: 10,
        height: 20,
        vx: 0,
        vy: -720,
        active: true,
        kind: 'upward',
      });
      return;
    }

    this.bullets.push({
      x:
        this.hero.direction === 1
          ? this.hero.x + this.hero.width - 2
          : this.hero.x - 18,
      y: this.hero.y + 26,
      width: 18,
      height: 10,
      vx: this.hero.direction * 610,
      vy: 0,
      active: true,
      kind: 'forward',
    });
  }

  private activateSpecial(): void {
    this.specialCharge = 0;
    this.specialSequenceActive = true;
    this.specialPulsesRemaining = 8;
    this.specialPulseTimer = 0;
    this.specialFlashTimer = 1.6;
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

    this.specialPulseTimer = 0.18;
  }

  private releaseSpecialPulse(): void {
    const originX = this.hero.x + this.hero.width / 2;
    const originY = this.hero.y + this.hero.height * 0.56;
    const direction = this.hero.direction;
    const localOffsets = [-16, 0, 16];

    for (let index = 0; index < localOffsets.length; index += 1) {
      const startX = originX + direction * this.randomRange(2, 10);
      const startY = originY + localOffsets[index] + this.randomRange(-5, 5);

      this.specialStrikes.push({
        points: this.buildMagicVolleyPath(startX, startY, direction),
        life: 0.75,
        maxLife: 0.75,
        width: this.randomRange(12, 17),
        theme: 'heroSpecial',
      });
    }

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      const enemyCenterX = enemy.x + enemy.width / 2;
      const enemyCenterY = enemy.y + enemy.height / 2;
      const inFront = direction === 1
        ? enemyCenterX >= originX - 6
        : enemyCenterX <= originX + 6;
      const closeEnoughX = Math.abs(enemyCenterX - originX) <= 1680;
      const closeEnoughY = Math.abs(enemyCenterY - originY) <= 95;

      if (inFront && closeEnoughX && closeEnoughY) {
        enemy.hp -= 2;
        enemy.hitFlash = 0.12;

        if (enemy.hp <= 0) {
          this.killEnemy(
            enemy,
            enemy.type === 'vigia' ? 100 : 50,
            '#ff6a00',
            18,
          );
        } else {
          this.spawnBurst(enemyCenterX, enemyCenterY, '#ff6a00', 8);
        }
      }
    }

    for (const chest of this.chests) {
      if (!chest.active) {
        continue;
      }

      const chestCenterX = chest.x + chest.width / 2;
      const chestCenterY = chest.y + chest.height / 2;
      const inFront = direction === 1
        ? chestCenterX >= originX - 6
        : chestCenterX <= originX + 6;
      const closeEnoughX = Math.abs(chestCenterX - originX) <= 1680;
      const closeEnoughY = Math.abs(chestCenterY - originY) <= 95;

      if (inFront && closeEnoughX && closeEnoughY) {
        this.breakChest(chest);
      }
    }

    if (this.boss.active && this.boss.hp > 0) {
      const bossCenterX = this.boss.x + this.boss.width / 2;
      const bossCenterY = this.boss.y + this.boss.height / 2;
      const inFront = direction === 1
        ? bossCenterX >= originX - 6
        : bossCenterX <= originX + 6;
      const closeEnoughX = Math.abs(bossCenterX - originX) <= 1860;
      const closeEnoughY = Math.abs(bossCenterY - originY) <= 115;

      if (inFront && closeEnoughX && closeEnoughY) {
        this.boss.hp = Math.max(0, this.boss.hp - 3);
        this.boss.hitFlash = 0.18;
        this.spawnBurst(bossCenterX, bossCenterY, '#ff6a00', 12);
      }
    }

    this.bossProjectiles = [];
    this.enemyProjectiles = [];
  }

  private buildMagicVolleyPath(
    startX: number,
    startY: number,
    direction: 1 | -1,
  ) {
    const points = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;

    const segments = 10;

    for (let index = 0; index < segments; index += 1) {
      x += this.randomRange(52, 78) * direction;
      y += this.randomRange(-3, 3);
      points.push({ x, y });
    }

    return points;
  }

  private updateSpecialStrikes(deltaTime: number): void {
    for (const strike of this.specialStrikes) {
      strike.life -= deltaTime;
    }

    this.specialStrikes = this.specialStrikes.filter((strike) => strike.life > 0);
  }

  private updateBullets(deltaTime: number): void {
    for (const bullet of this.bullets) {
      if (!bullet.active) {
        continue;
      }

      bullet.x += bullet.vx * deltaTime;
      bullet.y += bullet.vy * deltaTime;

      if (
        bullet.x < -100
        || bullet.x > this.worldWidth + 100
        || bullet.y < -120
        || bullet.y > this.canvas.height + 120
      ) {
        bullet.active = false;
        continue;
      }

      for (const tunnel of this.tunnels) {
        const roofRect = {
          x: tunnel.x,
          y: tunnel.ceilingY,
          width: tunnel.width,
          height: tunnel.thickness,
        };

        if (this.rectsOverlap(bullet, roofRect)) {
          bullet.active = false;
          break;
        }
      }

      if (!bullet.active) {
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
            this.killEnemy(
              enemy,
              enemy.type === 'vigia' ? 100 : 50,
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
          if (bullet.kind === 'upward') {
            bullet.active = false;
            this.breakChest(chest);
          }
          break;
        }
      }

      if (!bullet.active) {
        continue;
      }

      for (const hazard of this.hazards) {
        if (!hazard.active) {
          continue;
        }

        if (this.rectsOverlap(bullet, hazard)) {
          bullet.active = false;
          this.spawnBurst(
            bullet.x + bullet.width / 2,
            bullet.y + bullet.height / 2,
            '#7dffb2',
            6,
          );
          break;
        }
      }

      if (
        bullet.active
        && this.boss.active
        && this.boss.hp > 0
        && this.rectsOverlap(bullet, this.boss)
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

  private updateEnemyProjectiles(deltaTime: number): void {
    for (const projectile of this.enemyProjectiles) {
      if (!projectile.active) {
        continue;
      }

      projectile.elapsed += deltaTime;
      projectile.vy += projectile.gravity * deltaTime;
      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;

      if (
        projectile.y + projectile.radius >= this.bossArena.groundY
        || projectile.x < -80
        || projectile.x > this.worldWidth + 80
        || projectile.y < 40
      ) {
        projectile.active = false;
        this.spawnBurst(
          projectile.x,
          Math.min(this.bossArena.groundY - 6, projectile.y),
          '#45b857',
          12,
        );
        continue;
      }

      if (
        this.hero.invulnerabilityTimer <= 0
        && this.circleRectOverlap(
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

    this.enemyProjectiles = this.enemyProjectiles.filter((projectile) => projectile.active);
  }

  private updateEnemies(deltaTime: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.active) {
        enemy.respawnTimer = Math.max(0, enemy.respawnTimer - deltaTime);

        if (enemy.respawnTimer <= 0 && !this.boss.active) {
          enemy.active = true;
          enemy.hp = enemy.type === 'vigia'
            ? 4 + Math.floor(this.phaseData.definition.difficulty / 2)
            : 2 + Math.floor(this.phaseData.definition.difficulty / 3);
          enemy.x = enemy.baseX;
          enemy.y = enemy.baseY;
          enemy.direction = -1;
          enemy.hitFlash = 0;
          enemy.hoverOffset = Math.random() * Math.PI * 2;
          enemy.shootCooldown =
            enemy.type === 'vigia'
              ? this.randomRange(0.55, 2.2)
              : 999;
          enemy.shotDirection = Math.random() > 0.5 ? 1 : -1;
        }

        continue;
      }

      enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
      enemy.hoverOffset += deltaTime * (enemy.type === 'vigia' ? 1.1 : 0.9);
      enemy.shootCooldown = Math.max(0, enemy.shootCooldown - deltaTime);

      enemy.x += enemy.direction * enemy.speed * deltaTime;

      if (enemy.x <= enemy.patrolLeft) {
        enemy.x = enemy.patrolLeft;
        enemy.direction = 1;
      }

      if (enemy.x + enemy.width >= enemy.patrolRight) {
        enemy.x = enemy.patrolRight - enemy.width;
        enemy.direction = -1;
      }

      if (enemy.type === 'vigia') {
        this.tryFireCaptainProjectile(enemy);
      }

      if (
        this.hero.invulnerabilityTimer <= 0
        && this.rectsOverlap(this.hero, enemy)
      ) {
        this.applyHeroDamage(enemy.type === 'vigia' ? 18 : 12);
      }
    }
  }

  private tryFireCaptainProjectile(enemy: Enemy): void {
    if (enemy.shootCooldown > 0) {
      return;
    }

    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2 - 10;
    const targetX =
      enemyCenterX +
      enemy.shotDirection * this.randomRange(130, this.captainAttackRange);
    const targetY = this.bossArena.groundY - 10;
    const gravity = 980;
    const travelTime = this.randomRange(0.78, 0.92);
    const vx = (targetX - enemyCenterX) / travelTime;
    const vy = (targetY - enemyCenterY - 0.5 * gravity * travelTime * travelTime) / travelTime;

    this.enemyProjectiles.push({
      ownerX: enemyCenterX,
      ownerY: enemyCenterY,
      x: enemyCenterX,
      y: enemyCenterY,
      vx,
      vy,
      gravity,
      radius: 10,
      active: true,
      waveOffset: 0,
      amplitude: 0,
      frequency: 0,
      elapsed: 0,
      damage: 14,
    });

    enemy.shotDirection *= -1;
    enemy.shootCooldown = this.randomRange(1.45, 2.05);
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
            this.collectedCoins += 1;
            this.score += 8;
            break;

          case 'heart':
            this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 20);
            this.spawnBurst(item.x, item.y, '#72ff95', 10);
            break;

          case 'ray':
            this.collectedSparks += 1;
            this.specialCharge = Math.min(100, this.specialCharge + 10);
            this.score += 15;
            this.spawnBurst(item.x, item.y, '#7de8ff', 12);
            break;

          case 'flameVial':
            this.collectedSparks += 2;
            this.specialCharge = Math.min(100, this.specialCharge + 25);
            this.score += 25;
            this.spawnBurst(item.x, item.y, '#ffb35c', 14);
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
        this.specialCharge = Math.min(100, this.specialCharge + 50);
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
    if (!this.boss.active && this.hero.x >= this.bossArena.startX - 260) {
      this.boss.active = true;
      this.boss.introPulse = 1.5;
      this.boss.y = this.getBossGroundTop();

      if (!this.bossIntroShown && this.callbacks.onBossIntro) {
        this.bossIntroShown = true;
        this.bossIntroPending = true;
        this.callbacks.onBossIntro(this.phaseData.definition.boss.dialog);
      }
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

    const heroMinX = this.bossArena.startX - 200;
    const heroMaxX = this.bossArena.endX - this.hero.width - 24;

    if (this.hero.x > heroMaxX) {
      this.hero.x = heroMaxX;
    }

    if (this.hero.x < heroMinX) {
      this.hero.x = heroMinX;
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
      const useGooVolley = this.bossAttackPatternIndex % 2 === 1 || bossHpRatio <= 0.55;

      if (useGooVolley) {
        this.fireBossGooVolley();
        this.boss.secondaryCooldown = bossHpRatio <= 0.3 ? 1.15 : 1.7;
        this.boss.castTimer = 0.58;
      } else {
        this.fireBossWaveShot();
        this.boss.secondaryCooldown = bossHpRatio <= 0.3 ? 1.1 : 1.65;
        this.boss.castTimer = 0.45;
      }

      this.bossAttackPatternIndex += 1;
    }

    if (
      this.hero.invulnerabilityTimer <= 0
      && this.rectsOverlap(this.hero, this.boss)
    ) {
      this.applyHeroDamage();
    }
  }

  private startBossJump(): void {
    this.boss.vy = -820;
    this.boss.onGround = false;
    this.boss.jumpCooldown = this.randomRange(2.1, 3.4);
  }

  private updateBossPhysics(deltaTime: number): void {
    if (this.boss.onGround) {
      this.boss.y = this.getBossGroundTop();
      return;
    }

    this.boss.vy += (this.gravity + 900) * deltaTime;
    this.boss.y += this.boss.vy * deltaTime;

    const bossGround = this.getBossGroundTop();

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

  private fireBossGooVolley(): void {
    const launchX = this.boss.x + 26;
    const launchY = this.boss.y + 110;
    const targetX = this.hero.x + this.hero.width / 2 + this.hero.vx * 0.28;
    const count = this.boss.hp / this.boss.maxHp <= 0.35 ? 3 : 2;
    const gravity = 960;
    const middleIndex = (count - 1) / 2;

    for (let index = 0; index < count; index += 1) {
      const spread = (index - middleIndex) * 34;
      const landingX = targetX + spread;
      const timeToLand = this.randomRange(0.8, 1.02);
      const vx = (landingX - launchX) / timeToLand;
      const vy = -this.randomRange(420, 520);

      this.bossProjectiles.push({
        x: launchX,
        y: launchY,
        vx,
        vy,
        gravity,
        radius: 11 + index,
        active: true,
        waveOffset: Math.random() * Math.PI * 2,
        amplitude: 0,
        frequency: 0,
        elapsed: 0,
        damage: 18,
        kind: 'lob',
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

      if (projectile.kind === 'lob') {
        projectile.vy = (projectile.vy ?? 0) + (projectile.gravity ?? 0) * deltaTime;
        projectile.x += projectile.vx * deltaTime;
        projectile.y += (projectile.vy ?? 0) * deltaTime;

        this.spawnBurst(projectile.x, projectile.y, '#45b857', 1);

        if (projectile.y + projectile.radius >= this.bossArena.groundY) {
          projectile.active = false;
          this.spawnBurst(projectile.x, this.bossArena.groundY - 6, '#45b857', 14);

          if (
            this.hero.invulnerabilityTimer <= 0 &&
            Math.abs(this.hero.x + this.hero.width / 2 - projectile.x) <= 46 &&
            this.hero.y + this.hero.height >= this.bossArena.groundY - 40
          ) {
            this.applyHeroDamage(projectile.damage);
          }

          continue;
        }
      } else {
        projectile.x += projectile.vx * deltaTime;
        projectile.y +=
          Math.sin(
            projectile.elapsed * projectile.frequency + projectile.waveOffset,
          ) *
          projectile.amplitude *
          deltaTime;

        if (
          projectile.x + projectile.radius < this.bossArena.startX - 120 ||
          projectile.x - projectile.radius > this.bossArena.endX + 120 ||
          projectile.y < 380 ||
          projectile.y > this.bossArena.groundY - 28
        ) {
          projectile.active = false;
          continue;
        }

        if (
          this.hero.invulnerabilityTimer <= 0
          && this.circleRectOverlap(
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
    }

    this.bossProjectiles = this.bossProjectiles.filter(
      (projectile) => projectile.active,
    );
  }

  private updateHazards(deltaTime: number): void {
    for (const hazard of this.hazards) {
      hazard.pulseOffset += deltaTime * 1.8;

      if (!hazard.active) {
        continue;
      }

      if (
        this.hero.invulnerabilityTimer <= 0
        && this.rectsOverlap(this.hero, hazard)
      ) {
        this.applyHeroDamage(hazard.damage);
      }
    }
  }

  private updateBurstParticles(deltaTime: number): void {
    for (const particle of this.burstParticles) {
      particle.life -= deltaTime;
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += 420 * deltaTime;
    }

    this.burstParticles = this.burstParticles.filter((particle) => particle.life > 0);
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

  private killEnemy(
    enemy: Enemy,
    scoreValue: number,
    burstColor: string,
    burstAmount: number,
  ): void {
    enemy.hp = 0;
    enemy.active = false;
    enemy.respawnTimer = enemy.respawnDelay;
    enemy.shootCooldown =
      enemy.type === 'vigia'
        ? this.randomRange(0.55, 2.2)
        : 999;
    this.score += scoreValue;

    this.enemyProjectiles = this.enemyProjectiles.filter(
      (projectile) =>
        Math.abs(projectile.ownerX - (enemy.x + enemy.width / 2)) > 4
        || Math.abs(projectile.ownerY - (enemy.y + enemy.height / 2 - 10)) > 4,
    );

    this.spawnBurst(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      burstColor,
      burstAmount,
    );
  }

  private applyHeroDamage(damage = 20): void {
    if (this.hero.invulnerabilityTimer > 0 || this.respawningTimer > 0) {
      return;
    }

    this.hero.hp = Math.max(0, this.hero.hp - damage);
    this.hero.invulnerabilityTimer = 1;
    this.hero.hurtTimer = 0.24;
    this.hero.vx = -this.hero.direction * 190;
    this.hero.vy = -260;
    this.gameState.heroProgress.currentHp = this.hero.hp;

    if (this.hero.hp <= 0) {
      this.loseLife();
    }
  }

  private loseLife(): void {
    if (this.respawningTimer > 0 || this.ending) {
      return;
    }

    this.lives = Math.max(0, this.lives - 1);
    this.hero.hp = this.hero.maxHp;
    this.gameState.heroProgress.currentHp = this.hero.hp;

    this.spawnBurst(
      this.hero.x + this.hero.width / 2,
      this.hero.y + this.hero.height / 2,
      '#ff6a00',
      18,
    );

    if (this.lives <= 0) {
      this.startEnding('game-over');
      return;
    }

    this.respawningTimer = 0.7;
    this.hero.x = -9999;
    this.hero.y = -9999;
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.onGround = false;
    this.hero.castTimer = 0;
    this.hero.castDuration = 0;
    this.hero.castAim = 'forward';
    this.hero.hurtTimer = 0;
    this.hero.invulnerabilityTimer = 0;
    this.bullets = [];
    this.bossProjectiles = [];
    this.enemyProjectiles = [];
  }

  private updateCheckpointProgress(): void {
    while (
      this.checkpointIndex + 1 < this.checkpointXs.length
      && this.hero.x >= this.checkpointXs[this.checkpointIndex + 1]
    ) {
      this.checkpointIndex += 1;
      this.setCheckpoint(this.checkpointXs[this.checkpointIndex]);
    }
  }

  private buildCheckpointXs(): number[] {
    const safeBossCheckpoint = Math.max(320, this.bossArena.startX - 320);

    return [
      48,
      820,
      1780,
      2920,
      4040,
      safeBossCheckpoint,
    ];
  }

  private setCheckpoint(x: number): void {
    const spawn = this.findSpawnPointNear(x);
    this.respawnX = spawn.x;
    this.respawnY = spawn.y;
  }

  private placeHeroAtRespawn(isInitialSpawn = false): void {
    this.hero.x = this.respawnX;
    this.hero.y = this.respawnY;
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.direction = 1;
    this.hero.onGround = true;
    this.hero.jumpsRemaining = this.hero.maxJumps;
    this.hero.invulnerabilityTimer = isInitialSpawn ? 0.7 : 1.1;
    this.hero.castTimer = 0;
    this.hero.castDuration = 0;
    this.hero.castAim = 'forward';
    this.hero.hurtTimer = 0;
    this.hero.state = 'idle';
  }

  private findSpawnPointNear(targetX: number): { x: number; y: number } {
    const groundSegments = this.platforms
      .filter((platform) => platform.height >= 70)
      .sort((a, b) => a.x - b.x);

    const preferredGround =
      groundSegments.find(
        (platform) =>
          targetX >= platform.x - 24 && targetX <= platform.x + platform.width + 24,
      ) ?? groundSegments[0];

    if (preferredGround) {
      const safeX = Math.max(
        preferredGround.x + 26,
        Math.min(
          targetX,
          preferredGround.x + preferredGround.width - this.hero.width - 26,
        ),
      );

      return {
        x: safeX,
        y: preferredGround.y - this.hero.height,
      };
    }

    let bestPlatform: Platform | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const platform of this.platforms) {
      const centerX = platform.x + platform.width / 2;
      const distance = Math.abs(centerX - targetX);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestPlatform = platform;
      }
    }

    if (!bestPlatform) {
      return { x: 48, y: 500 };
    }

    return {
      x: bestPlatform.x + 28,
      y: bestPlatform.y - this.hero.height,
    };
  }

  private getBossGroundTop(): number {
    return this.bossArena.groundY - this.boss.height;
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
      a.x < b.x + b.width
      && a.x + a.width > b.x
      && a.y < b.y + b.height
      && a.y + a.height > b.y
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

    drawTunnels(ctx, this.tunnels);
    drawPlatforms(ctx, this.platforms);
    drawHazards(ctx, this.hazards);
    drawCollectibles(ctx, this.collectibles);
    drawChests(ctx, this.chests);
    drawSpecialStrikes(ctx, this.specialStrikes);
    drawEnemies(ctx, this.enemies);
    drawEnemyProjectiles(ctx, this.enemyProjectiles);
    this.drawBullets();
    drawBoss(ctx, this.boss);
    drawBossProjectiles(ctx, this.bossProjectiles);
    drawBurstParticles(ctx, this.burstParticles);

    if (this.respawningTimer <= 0) {
      drawHero(ctx, this.hero);
    }

    ctx.restore();

    drawHud(
      ctx,
      this.canvas,
      this.hero,
      this.specialCharge,
      this.score,
      this.boss,
      this.phaseData.definition.title,
      this.phaseData.definition.boss.bossName,
      this.lives,
      this.maxLives,
      this.gameState.getFormattedCurrentPhaseTime(),
      this.gameState.isPhaseTimeInWarning,
    );

    if (this.specialFlashTimer > 0) {
      const pulse = 0.5 + Math.sin(performance.now() * 0.03) * 0.5;
      const alpha = Math.min(this.specialFlashTimer * 0.3, 0.3) * (0.7 + pulse * 0.3);
      ctx.fillStyle = `rgba(255, 106, 0, ${alpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.respawningTimer > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.paused || this.bossIntroPending) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.paused) {
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

    if (this.gameState.isPhaseTimeExceeded && !this.ending) {
      ctx.fillStyle = 'rgba(30, 0, 0, 0.42)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private drawBullets(): void {
    const ctx = this.ctx;

    for (const bullet of this.bullets) {
      const centerX = bullet.x + bullet.width / 2;
      const centerY = bullet.y + bullet.height / 2;

      if (bullet.kind === 'upward') {
        const glow = ctx.createRadialGradient(
          centerX,
          centerY,
          1,
          centerX,
          centerY,
          16,
        );
        glow.addColorStop(0, 'rgba(255, 228, 180, 0.92)');
        glow.addColorStop(0.35, 'rgba(255, 136, 57, 0.5)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffd7a6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX, bullet.y + bullet.height);
        ctx.lineTo(centerX, bullet.y + 4);
        ctx.stroke();

        ctx.fillStyle = '#ff9b61';
        ctx.beginPath();
        ctx.moveTo(centerX, bullet.y);
        ctx.lineTo(centerX - 5, bullet.y + 8);
        ctx.lineTo(centerX + 5, bullet.y + 8);
        ctx.closePath();
        ctx.fill();

        continue;
      }

      const glow = ctx.createRadialGradient(
        centerX,
        centerY,
        1,
        centerX,
        centerY,
        12,
      );
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
        centerX - Math.sign(bullet.vx || 1) * 5,
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
