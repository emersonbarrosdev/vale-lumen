import { EngineCallbacks } from '../../core/models/game/engine-callbacks.model';
import {
  getPhaseBossRuntimeRules,
  getPhaseRuntimeRules,
} from '../content/phases/registry/phase-rules.registry';
import {
  PhaseBossRuntimeRules,
  PhaseRuntimeRules,
} from '../content/phases/shared/phase-runtime-rules.model';
import { Boss } from '../domain/bosses/boss.model';
import { Enemy } from '../domain/enemies/enemy.model';
import { Hero } from '../domain/hero/hero.model';
import { InputAction, InputSourceType } from '../domain/input/input-action.model';
import { BossArenaData } from '../domain/world/boss-arena.model';
import { Chest } from '../domain/world/chest.model';
import { Collectible, CollectibleType } from '../domain/world/collectible.model';
import { Hazard } from '../domain/world/hazard.model';
import { PhasePlayableData } from '../domain/world/phase-playable-data.model';
import { Platform } from '../domain/world/platform.model';
import { Tunnel } from '../domain/world/tunnel.model';
import { AudioService } from '../services/audio.service';
import { GameStateService } from '../services/game-state.service';
import { createBoss } from './factories/boss.factory';
import { createEnemies } from './factories/enemy.factory';
import { createHero } from './factories/hero.factory';
import { createWorldState } from './factories/world.factory';
import {
  consumeSpecialCharge,
  resetHeroTransientCombatState,
  syncSpecialHudState,
} from './helpers/game-engine-state.helper';
import {
  createForwardBullet,
  createMegaSpecialBullet,
  createMegaSpecialStrike,
  createSimpleChargedBullet,
  createSpecialBullet,
  createUpwardBullet,
} from './helpers/hero-shot.helper';
import { InputManager } from './input-manager';
import { createInitialEngineRuntime } from './runtime/engine-state.factory';
import { EngineRuntime } from './runtime/engine-runtime.model';
import { updateBossSystem } from './systems/boss-update.system';
import { calculateCameraX } from './systems/camera-update.system';
import {
  breakChestSystem,
  updateChestsSystem,
} from './systems/chest-update.system';
import {
  buildCheckpointXs,
  placeHeroAtRespawn,
  setCheckpoint,
  updateCheckpointProgressSystem,
} from './systems/checkpoint-update.system';
import { updateCollectiblesSystem } from './systems/collectible-update.system';
import {
  checkEndingConditionsSystem,
  startEnding,
  updateEndingTimerSystem,
} from './systems/ending-update.system';
import { updateEnemiesSystem } from './systems/enemy-update.system';
import { updateHazardsSystem } from './systems/hazard-update.system';
import { updateHeroSystem } from './systems/hero-update.system';
import {
  updateBossProjectilesSystem,
  updateBulletsSystem,
  updateBurstParticlesSystem,
  updateEnemyProjectilesSystem,
  updateSpecialExplosionsSystem,
  updateSpecialSequenceSystem,
  updateSpecialStrikesSystem,
} from './systems/projectile-update.system';
import { renderFrameWithHud } from './systems/render-frame.system';

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly input: InputManager;
  private readonly callbacks: EngineCallbacks;
  private readonly gameState: GameStateService;
  private readonly audioService: AudioService;
  private readonly phaseData: PhasePlayableData;
  private readonly runtimeRules: PhaseRuntimeRules;
  private readonly bossRuntimeRules: PhaseBossRuntimeRules;

  private animationFrameId = 0;
  private lastTime = 0;

  private readonly gravity = 2350;
  private readonly fallBoost = 1350;
  private readonly captainAttackRange = 230;
  private readonly specialSegmentCost = 33.34;

  private readonly worldWidth: number;
  private readonly platforms: Platform[];
  private readonly enemies: Enemy[];
  private readonly collectibles: Collectible[];
  private readonly chests: Chest[];
  private readonly bossArena: BossArenaData;
  private readonly hazards: Hazard[];
  private readonly tunnels: Tunnel[];

  private readonly runtime: EngineRuntime = createInitialEngineRuntime();

  private readonly hero: Hero;
  private readonly boss: Boss;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gameState: GameStateService,
    audioService: AudioService,
    phaseData: PhasePlayableData,
    callbacks: EngineCallbacks,
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.gameState = gameState;
    this.audioService = audioService;
    this.phaseData = phaseData;
    this.callbacks = callbacks;
    this.bossArena = phaseData.bossArena;
    this.runtimeRules = getPhaseRuntimeRules(phaseData.definition);
    this.bossRuntimeRules = getPhaseBossRuntimeRules(phaseData.definition);
    this.input = new InputManager(this.gameState.settings.gamepadDeadzone);

    this.gameState.resetCurrentPhaseTimer();

    this.hero = createHero(gameState);

    const worldState = createWorldState(phaseData);
    this.worldWidth = this.runtimeRules.worldWidth || worldState.worldWidth;
    this.platforms = worldState.platforms;
    this.collectibles = worldState.collectibles;
    this.chests = worldState.chests;
    this.hazards = worldState.hazards;
    this.tunnels = worldState.tunnels;

    this.boss = createBoss(phaseData, this.bossArena);
    this.enemies = createEnemies(phaseData, this.randomRange);

    this.runtime.checkpointXs = buildCheckpointXs(this.runtimeRules);

    setCheckpoint(
      this.runtime.checkpointXs[0],
      this.runtime,
      this.hero,
      this.platforms,
      this.hazards,
      this.bossArena,
    );

    placeHeroAtRespawn(this.hero, this.runtime, true);
    this.applySecretBossStartIfNeeded();

    this.runtime.cameraX = calculateCameraX(
      this.hero,
      this.canvas.width,
      this.worldWidth,
    );
  }

  start(): void {
    this.input.attach();
    this.lastTime = performance.now();
    this.render();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.input.detach();
  }

  resumeBossBattle(): void {
    this.runtime.bossIntroPending = false;
  }

  setVirtualActionState(action: InputAction, pressed: boolean): void {
    this.input.setVirtualActionState(action, pressed, 'touch');
  }

  clearVirtualInputs(source: InputSourceType = 'touch'): void {
    this.input.clearVirtualInputs(source);
  }

  private readonly loop = (time: number): void => {
    const deltaTime = Math.min((time - this.lastTime) / 1000, 0.032);
    this.lastTime = time;

    this.input.beginFrame();
    this.update(deltaTime);
    this.render();
    this.input.endFrame();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number): void {
    this.runtime.lastInputSource = this.input.getLastInputSource();
    this.gameState.saveLastInputDevice(this.runtime.lastInputSource);

    if (
      updateEndingTimerSystem({
        runtime: this.runtime,
        deltaTime,
        callbacks: this.callbacks,
      })
    ) {
      return;
    }

    if (this.input.isActionJustPressed('pause')) {
      this.runtime.paused = !this.runtime.paused;

      if (this.runtime.paused) {
        this.audioService.pauseCurrentMusic();
      } else {
        this.audioService.resumeCurrentMusic();
      }
    }

    if (this.runtime.paused || this.runtime.bossIntroPending) {
      return;
    }

    this.gameState.addPhaseElapsedTime(deltaTime * 1000);
    this.gameState.setCurrentScore(this.runtime.score);
    this.gameState.setCurrentCoins(this.runtime.collectedCoins);

    if (this.gameState.isPhaseTimeExceeded) {
      startEnding(this.runtime, 'game-over');
      return;
    }

    if (this.runtime.respawningTimer > 0) {
      this.updateRespawnTimer(deltaTime);
      updateBurstParticlesSystem(this.runtime, deltaTime);
      updateSpecialStrikesSystem(this.runtime, deltaTime);
      updateSpecialExplosionsSystem({
        runtime: this.runtime,
        boss: this.boss,
        enemies: this.enemies,
        chests: this.chests,
        hazards: this.hazards,
        spawnBurst: this.spawnBurst,
        breakChest: this.breakChest,
        killEnemy: this.killEnemy,
        deltaTime,
        playEnemyHitSfx: this.playEnemyHitSfx,
        playEnemyDeathSfx: this.playEnemyDeathSfx,
        playBossHitSfx: this.playBossHitSfx,
      });
      this.updateCamera();
      return;
    }

    updateHeroSystem({
      hero: this.hero,
      input: this.input,
      runtime: this.runtime,
      worldWidth: this.worldWidth,
      gravity: this.gravity,
      fallBoost: this.fallBoost,
      deltaTime,
      platforms: this.platforms,
      hazards: this.hazards,
      tunnels: this.tunnels,
      fireBullet: this.fireBullet,
      playJumpSfx: this.playJumpSfx,
      activateSpecial: this.activateSpecial,
      activateMegaSpecial: this.activateMegaSpecial,
      simpleChargedShotUnlocked:
        this.gameState.heroProgress.simpleChargedShotUnlocked &&
        this.gameState.currentPhase >= 2,
    });

    this.updateProgressScore();
    syncSpecialHudState(this.runtime);

    updateCheckpointProgressSystem({
      hero: this.hero,
      runtime: this.runtime,
      platforms: this.platforms,
      hazards: this.hazards,
      bossArena: this.bossArena,
    });

    updateBulletsSystem({
      runtime: this.runtime,
      boss: this.boss,
      enemies: this.enemies,
      chests: this.chests,
      hazards: this.hazards,
      platforms: this.platforms,
      tunnels: this.tunnels,
      worldWidth: this.worldWidth,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      cameraX: this.runtime.cameraX,
      deltaTime,
      spawnBurst: this.spawnBurst,
      spawnCollectibleFromBlock: this.spawnCollectibleFromBlock,
      breakChest: this.breakChest,
      killEnemy: this.killEnemy,
      playEnemyHitSfx: this.playEnemyHitSfx,
      playEnemyDeathSfx: this.playEnemyDeathSfx,
      playBossHitSfx: this.playBossHitSfx,
      playHeroSpecialExplosionSfx: this.playHeroSpecialExplosionSfx,
    });

    updateEnemyProjectilesSystem({
      runtime: this.runtime,
      hero: this.hero,
      bossArena: this.bossArena,
      worldWidth: this.worldWidth,
      deltaTime,
      spawnBurst: this.spawnBurst,
      applyHeroDamage: this.applyHeroDamage,
    });

    updateEnemiesSystem({
      enemies: this.enemies,
      hero: this.hero,
      runtime: this.runtime,
      bossActive: this.boss.active,
      bossArenaGroundY: this.bossArena.groundY,
      phaseDifficulty: this.phaseData.definition.difficulty,
      captainAttackRange: this.captainAttackRange,
      deltaTime,
      randomRange: this.randomRange,
      applyHeroDamage: this.applyHeroDamage,
      platforms: this.platforms,
    });

    updateCollectiblesSystem({
      hero: this.hero,
      collectibles: this.collectibles,
      runtime: this.runtime,
      spawnBurst: this.spawnBurst,
      playCollectibleSfx: this.playCollectibleSfx,
    });

    updateChestsSystem({
      chests: this.chests,
      deltaTime,
    });

    updateBossSystem({
      boss: this.boss,
      hero: this.hero,
      runtime: this.runtime,
      bossArena: this.bossArena,
      phaseData: this.phaseData,
      bossRuntimeRules: this.bossRuntimeRules,
      callbacks: this.callbacks,
      gravity: this.gravity,
      deltaTime,
      randomRange: this.randomRange,
      applyHeroDamage: this.applyHeroDamage,
      spawnBurst: this.spawnBurst,
      playBossSpecialSfx: this.playBossSpecialSfx,
    });

    updateBossProjectilesSystem({
      runtime: this.runtime,
      hero: this.hero,
      bossArena: this.bossArena,
      deltaTime,
      spawnBurst: this.spawnBurst,
      applyHeroDamage: this.applyHeroDamage,
    });

    updateSpecialSequenceSystem({
      runtime: this.runtime,
      hero: this.hero,
      boss: this.boss,
      enemies: this.enemies,
      chests: this.chests,
      deltaTime,
      randomRange: this.randomRange,
      spawnBurst: this.spawnBurst,
      breakChest: this.breakChest,
      killEnemy: this.killEnemy,
    });

    updateSpecialExplosionsSystem({
      runtime: this.runtime,
      boss: this.boss,
      enemies: this.enemies,
      chests: this.chests,
      hazards: this.hazards,
      spawnBurst: this.spawnBurst,
      breakChest: this.breakChest,
      killEnemy: this.killEnemy,
      deltaTime,
      playEnemyHitSfx: this.playEnemyHitSfx,
      playEnemyDeathSfx: this.playEnemyDeathSfx,
      playBossHitSfx: this.playBossHitSfx,
    });

    updateSpecialStrikesSystem(this.runtime, deltaTime);
    updateBurstParticlesSystem(this.runtime, deltaTime);

    updateHazardsSystem({
      hazards: this.hazards,
      hero: this.hero,
      deltaTime,
      applyHeroDamage: this.applyHeroDamage,
    });

    this.updateCamera();

    if (this.runtime.specialFlashTimer > 0) {
      this.runtime.specialFlashTimer = Math.max(
        0,
        this.runtime.specialFlashTimer - deltaTime,
      );
    }

    syncSpecialHudState(this.runtime);

    this.gameState.setCurrentScore(this.runtime.score);
    this.gameState.setCurrentCoins(this.runtime.collectedCoins);

    checkEndingConditionsSystem({
      runtime: this.runtime,
      hero: this.hero,
      boss: this.boss,
      canvasHeight: this.canvas.height,
      gameState: this.gameState,
      loseLife: this.loseLife,
    });

    if (this.hero.y > this.canvas.height + this.runtimeRules.heroFallDeathOffset) {
      this.loseLife();
    }

    if (this.runtime.lives <= 0 && !this.runtime.ending) {
      startEnding(this.runtime, 'game-over');
    }

    if (this.boss.active && this.boss.hp <= 0 && !this.runtime.ending) {
      this.gameState.finalizeCurrentPhaseTime();
      this.runtime.score += 1200;
      startEnding(this.runtime, 'victory');
    }
  }

  private applySecretBossStartIfNeeded(): void {
    if (this.gameState.secretBossPhaseOverride !== 1) {
      return;
    }

    const arenaStartX = this.bossArena.startX;
    const arenaEndX = this.bossArena.endX;
    const safeHeroX = Math.max(48, arenaStartX + 120);
    const groundY = this.bossArena.groundY;

    this.runtime.checkpointIndex = Math.max(0, this.runtime.checkpointXs.length - 1);
    this.runtime.respawnX = safeHeroX;
    this.runtime.respawnY = groundY - this.hero.height;

    this.hero.x = safeHeroX;
    this.hero.y = groundY - this.hero.height;
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.onGround = true;
    this.hero.coyoteTimer = 0;
    this.hero.jumpBufferTimer = 0;
    this.hero.castTimer = 0;
    this.hero.castDuration = 0;
    this.hero.specialCasting = false;
    this.hero.megaCasting = false;
    this.hero.aimingUp = false;
    this.hero.crouching = false;
    this.hero.attackHoldTimer = 0;
    this.hero.chargedShotPending = false;

    this.runtime.bossIntroShown = true;
    this.runtime.bossIntroPending = false;

    this.boss.active = true;
    this.boss.x = Math.min(
      Math.max(this.bossArena.bossX, arenaStartX + 40),
      arenaEndX - this.boss.width - 40,
    );
    this.boss.y = groundY - this.boss.height;
    this.boss.vy = 0;
    this.boss.onGround = true;
    this.boss.jumpCooldown = Math.max(this.boss.jumpCooldown, 0.8);
    this.boss.secondaryCooldown = Math.max(this.boss.secondaryCooldown, 1.2);
    this.boss.castTimer = 0;
    this.boss.armSwing = 0;
    this.boss.squashTimer = 0;
    this.boss.introPulse = 0;
    this.boss.hitFlash = 0;

    this.runtime.cameraX = calculateCameraX(
      this.hero,
      this.canvas.width,
      this.worldWidth,
    );

    this.gameState.setSecretBossPhaseOverride(null);
  }

  private updateRespawnTimer(deltaTime: number): void {
    this.runtime.respawningTimer = Math.max(
      0,
      this.runtime.respawningTimer - deltaTime,
    );

    if (this.runtime.respawningTimer > 0) {
      return;
    }

    this.resetFallingPlatforms();
    this.resetInteractiveBlocks();

    setCheckpoint(
      this.runtime.checkpointXs[this.runtime.checkpointIndex] ??
        this.runtime.checkpointXs[0] ??
        96,
      this.runtime,
      this.hero,
      this.platforms,
      this.hazards,
      this.bossArena,
    );

    this.runtime.bossIntroPending = false;

    placeHeroAtRespawn(this.hero, this.runtime);
    this.runtime.cameraX = calculateCameraX(
      this.hero,
      this.canvas.width,
      this.worldWidth,
    );
  }

  private resetFallingPlatforms(): void {
    for (const platform of this.platforms) {
      if (!platform.fallAway) {
        continue;
      }

      platform.triggered = false;
      platform.triggerTimer = platform.fallDelay ?? 0.35;
      platform.falling = false;
      platform.active = true;

      if (typeof platform.startY === 'number') {
        platform.y = platform.startY;
      }
    }
  }

  private resetInteractiveBlocks(): void {
    for (const platform of this.platforms) {
      if (platform.kind !== 'brickBlock' && platform.kind !== 'questionBlock') {
        continue;
      }

      platform.used = false;
      platform.broken = false;
      platform.active = true;
    }

    this.collectibles.forEach((item) => {
      if (item.spawnedDuringRun) {
        item.collected = true;
      }
    });
  }

  private updateProgressScore(): void {
    const scoreStep = Math.floor(
      this.hero.x / this.runtimeRules.scoreStepDistance,
    );

    if (scoreStep > this.runtime.furthestScoreStep) {
      this.runtime.score +=
        (scoreStep - this.runtime.furthestScoreStep) *
        this.runtimeRules.scorePerStep;
      this.runtime.furthestScoreStep = scoreStep;
    }
  }

  private readonly fireBullet = (
    kind: 'forward' | 'upward' | 'chargedForward',
  ): void => {
    const bullet =
      kind === 'upward'
        ? createUpwardBullet(this.hero)
        : kind === 'chargedForward'
          ? createSimpleChargedBullet(this.hero)
          : createForwardBullet(this.hero);

    this.runtime.bullets.push(bullet);

    if (kind === 'chargedForward') {
      this.audioService.playSfx('hero-special-shot');
      return;
    }

    this.audioService.playSfx('hero-shot');
  };

  private readonly playJumpSfx = (): void => {
    this.audioService.playSfx('hero-jump');
  };

  private readonly playCollectibleSfx = (
    trackId: 'coin-pickup' | 'spark-pickup' | 'heart-pickup' | 'extra-life',
  ): void => {
    this.audioService.playSfx(trackId);
  };

  private readonly playChestOpenSfx = (
    trackId: 'chest-open-common' | 'chest-open-rare',
  ): void => {
    this.audioService.playSfx(trackId);
  };

  private readonly playBossSpecialSfx = (): void => {
    this.audioService.playSfx('boss-special');
  };

  private readonly playEnemyHitSfx = (): void => {
    this.audioService.playSfx('enemy-hit');
  };

  private readonly playEnemyDeathSfx = (): void => {
    this.audioService.playSfx('enemy-death');
  };

  private readonly playBossHitSfx = (): void => {
    this.audioService.playSfx('boss-hit');
  };

  private readonly playHeroSpecialExplosionSfx = (): void => {
    this.audioService.playSfx('hero-special-explosion');
  };

  private readonly activateSpecial = (): void => {
    if (this.runtime.specialSegmentsReady < 1) {
      return;
    }

    consumeSpecialCharge(this.runtime, this.specialSegmentCost);
    this.runtime.specialFlashTimer = 0.62;

    this.runtime.bullets.push(
      createSpecialBullet(this.hero, this.canvas.width),
    );

    this.audioService.playSfx('hero-special-shot');

    this.runtime.enemyProjectiles = [];
    this.runtime.bossProjectiles = [];
    syncSpecialHudState(this.runtime);
  };

  private readonly activateMegaSpecial = (): void => {
    if (!this.runtime.ignitionReady || this.runtime.specialCharge < 100) {
      return;
    }

    this.runtime.specialCharge = 0;
    this.runtime.specialSegmentsReady = 0;
    this.runtime.ignitionReady = false;
    this.runtime.specialHudLabel = 'Especial';
    this.runtime.megaComboTimer = 0;
    this.runtime.specialFlashTimer = 0.86;
    this.hero.megaVisualTimer = 1.05;

    this.runtime.bullets.push(
      createMegaSpecialBullet(this.hero, this.canvas.width),
    );

    this.runtime.specialStrikes.push(
      createMegaSpecialStrike(this.hero, this.canvas.width),
    );

    this.audioService.playSfx('hero-special-shot');

    this.runtime.enemyProjectiles = [];
    this.runtime.bossProjectiles = [];
  };

  private readonly breakChest = (chest: Chest): void => {
    breakChestSystem({
      chest,
      runtime: this.runtime,
      hero: this.hero,
      spawnBurst: this.spawnBurst,
      playChestOpenSfx: this.playChestOpenSfx,
    });
  };

  private readonly spawnBurst = (
    x: number,
    y: number,
    color: string,
    amount: number,
  ): void => {
    for (let index = 0; index < amount; index += 1) {
      this.runtime.burstParticles.push({
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
  };

  private readonly spawnCollectibleFromBlock = (
    x: number,
    y: number,
    type: CollectibleType,
  ): void => {
    const width = this.getCollectibleWidth(type);
    const height = this.getCollectibleHeight(type);

    this.collectibles.push({
      type,
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      collected: false,
      spawnedDuringRun: true,
      spawnTimer: 0,
      spawnVy: -220,
      startY: y - height / 2,
    });
  };

  private getCollectibleWidth(type: CollectibleType): number {
    switch (type) {
      case 'coin':
        return 18;
      case 'coin10':
      case 'bigCoin10':
        return 28;
      case 'lifeFragment':
        return 18;
      case 'specialSpark':
        return 20;
      case 'heart':
        return 22;
      case 'ray':
        return 22;
      case 'flameVial':
        return 22;
      case 'shieldOrb':
        return 24;
      default:
        return 22;
    }
  }

  private getCollectibleHeight(type: CollectibleType): number {
    switch (type) {
      case 'coin':
        return 18;
      case 'coin10':
      case 'bigCoin10':
        return 28;
      case 'lifeFragment':
        return 18;
      case 'specialSpark':
        return 20;
      case 'heart':
        return 22;
      case 'ray':
        return 22;
      case 'flameVial':
        return 22;
      case 'shieldOrb':
        return 24;
      default:
        return 22;
    }
  }

  private readonly killEnemy = (
    enemy: Enemy,
    scoreValue: number,
    burstColor: string,
    burstAmount: number,
  ): void => {
    enemy.hp = 0;
    enemy.active = false;
    enemy.respawnTimer = enemy.respawnDelay;
    enemy.shootCooldown =
      enemy.type === 'vigia' ? this.randomRange(0.55, 2.2) : 999;
    this.runtime.score += scoreValue;

    this.runtime.enemyProjectiles = this.runtime.enemyProjectiles.filter(
      (projectile) =>
        Math.abs(projectile.ownerX - (enemy.x + enemy.width / 2)) > 4 ||
        Math.abs(projectile.ownerY - (enemy.y + enemy.height / 2 - 10)) > 4,
    );

    this.spawnBurst(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      burstColor,
      burstAmount,
    );
  };

  private readonly applyHeroDamage = (): void => {
    if (
      this.hero.invulnerabilityTimer > 0 ||
      this.runtime.respawningTimer > 0
    ) {
      return;
    }

    if (this.hero.shieldGraceTimer > 0) {
      return;
    }

    if (this.hero.shieldActive) {
      this.hero.shieldActive = false;
      this.hero.shieldGraceTimer = 3;
      this.hero.invulnerabilityTimer = 0;
      this.hero.hurtTimer = 0.16;
      this.hero.vx = -this.hero.direction * 120;
      this.hero.vy = -160;

      this.spawnBurst(
        this.hero.x + this.hero.width / 2,
        this.hero.y + this.hero.height / 2,
        '#82e8ff',
        18,
      );

      return;
    }

    this.hero.invulnerabilityTimer = 1;
    this.hero.hurtTimer = 0.24;
    this.hero.vx = -this.hero.direction * 190;
    this.hero.vy = -260;
    this.loseLife();
  };

  private readonly loseLife = (): void => {
    if (this.runtime.respawningTimer > 0 || this.runtime.ending) {
      return;
    }

    this.runtime.lives = Math.max(0, this.runtime.lives - 1);
    this.hero.hp = this.hero.maxHp;
    this.gameState.heroProgress.currentHp = this.hero.hp;

    this.spawnBurst(
      this.hero.x + this.hero.width / 2,
      this.hero.y + this.hero.height / 2,
      '#ff6a00',
      18,
    );

    if (this.runtime.lives <= 0) {
      this.audioService.playSfx('game-over');
      startEnding(this.runtime, 'game-over');
      return;
    }

    this.runtime.respawningTimer = 0.7;
    this.hero.x = -9999;
    this.hero.y = -9999;
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.onGround = false;

    resetHeroTransientCombatState(this.hero, this.runtime);
  };

  private updateCamera(): void {
    this.runtime.cameraX = calculateCameraX(
      this.hero,
      this.canvas.width,
      this.worldWidth,
    );
  }

  private readonly randomRange = (min: number, max: number): number =>
    min + Math.random() * (max - min);

  private render(): void {
    renderFrameWithHud({
      ctx: this.ctx,
      canvas: this.canvas,
      hero: this.hero,
      boss: this.boss,
      phaseData: this.phaseData,

      cameraX: this.runtime.cameraX,
      bullets: this.runtime.bullets,
      bossProjectiles: this.runtime.bossProjectiles,
      enemyProjectiles: this.runtime.enemyProjectiles,
      specialStrikes: this.runtime.specialStrikes,
      specialExplosions: this.runtime.specialExplosions,
      burstParticles: this.runtime.burstParticles,

      platforms: this.platforms,
      enemies: this.enemies,
      collectibles: this.collectibles,
      chests: this.chests,
      hazards: this.hazards,
      tunnels: this.tunnels,

      score: this.runtime.score,
      specialCharge: this.runtime.specialCharge,
      specialHudLabel: this.runtime.specialHudLabel,
      lives: this.runtime.lives,
      coins: this.runtime.collectedCoins,
      effectsVolume: this.gameState.effectsVolume,

      paused: this.runtime.paused,
      bossIntroPending: this.runtime.bossIntroPending,
      respawningTimer: this.runtime.respawningTimer,
      specialFlashTimer: this.runtime.specialFlashTimer,
      ending: this.runtime.ending,

      formattedTime: this.gameState.getFormattedCurrentPhaseTime(),
      isTimeWarning: this.gameState.isPhaseTimeInWarning,
      isTimeExceeded: this.gameState.isPhaseTimeExceeded,
    });
  }
}
