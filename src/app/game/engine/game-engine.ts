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
import { Collectible } from '../domain/world/collectible.model';
import { Hazard } from '../domain/world/hazard.model';
import { PhasePlayableData } from '../domain/world/phase-playable-data.model';
import { Platform } from '../domain/world/platform.model';
import { Tunnel } from '../domain/world/tunnel.model';
import { GameStateService } from '../services/game-state.service';
import { createBoss } from './factories/boss.factory';
import { createEnemies } from './factories/enemy.factory';
import { createHero } from './factories/hero.factory';
import { createWorldState } from './factories/world.factory';
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
  updateSpecialSequenceSystem,
  updateSpecialStrikesSystem,
} from './systems/projectile-update.system';
import { renderFrameWithHud } from './systems/render-frame.system';

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly input = new InputManager();
  private readonly callbacks: EngineCallbacks;
  private readonly gameState: GameStateService;
  private readonly phaseData: PhasePlayableData;
  private readonly runtimeRules: PhaseRuntimeRules;
  private readonly bossRuntimeRules: PhaseBossRuntimeRules;

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
  private readonly runtime: EngineRuntime = createInitialEngineRuntime();

  private readonly hero: Hero;
  private readonly boss: Boss;

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
    this.bossArena = phaseData.bossArena;
    this.runtimeRules = getPhaseRuntimeRules(phaseData.definition);
    this.bossRuntimeRules = getPhaseBossRuntimeRules(phaseData.definition);

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
    );
    placeHeroAtRespawn(this.hero, this.runtime, true);
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
    }

    if (this.runtime.paused || this.runtime.bossIntroPending) {
      return;
    }

    this.gameState.addPhaseElapsedTime(deltaTime * 1000);
    this.gameState.setCurrentScore(this.runtime.score);

    if (this.gameState.isPhaseTimeExceeded) {
      startEnding(this.runtime, 'game-over');
      return;
    }

    if (this.runtime.respawningTimer > 0) {
      this.updateRespawnTimer(deltaTime);
      updateBurstParticlesSystem(this.runtime, deltaTime);
      updateSpecialStrikesSystem(this.runtime, deltaTime);
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
      activateSpecial: this.activateSpecial,
    });

    this.updateProgressScore();

    updateCheckpointProgressSystem({
      hero: this.hero,
      runtime: this.runtime,
      platforms: this.platforms,
    });

    updateBulletsSystem({
      runtime: this.runtime,
      boss: this.boss,
      enemies: this.enemies,
      chests: this.chests,
      hazards: this.hazards,
      tunnels: this.tunnels,
      worldWidth: this.worldWidth,
      canvasHeight: this.canvas.height,
      deltaTime,
      spawnBurst: this.spawnBurst,
      breakChest: this.breakChest,
      killEnemy: this.killEnemy,
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
    });

    updateCollectiblesSystem({
      hero: this.hero,
      collectibles: this.collectibles,
      runtime: this.runtime,
      spawnBurst: this.spawnBurst,
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

  private updateRespawnTimer(deltaTime: number): void {
    this.runtime.respawningTimer = Math.max(
      0,
      this.runtime.respawningTimer - deltaTime,
    );

    if (this.runtime.respawningTimer > 0) {
      return;
    }

    placeHeroAtRespawn(this.hero, this.runtime);
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

  private readonly fireBullet = (kind: 'forward' | 'upward'): void => {
    if (kind === 'upward') {
      this.runtime.bullets.push({
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

    this.runtime.bullets.push({
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
  };

  private readonly activateSpecial = (): void => {
    this.runtime.specialCharge = 0;
    this.runtime.specialSequenceActive = true;
    this.runtime.specialPulsesRemaining = 8;
    this.runtime.specialPulseTimer = 0;
    this.runtime.specialFlashTimer = 1.6;
  };

  private readonly breakChest = (chest: Chest): void => {
    breakChestSystem({
      chest,
      runtime: this.runtime,
      hero: this.hero,
      spawnBurst: this.spawnBurst,
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

  private readonly applyHeroDamage = (damage = 20): void => {
    if (
      this.hero.invulnerabilityTimer > 0 ||
      this.runtime.respawningTimer > 0
    ) {
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
      startEnding(this.runtime, 'game-over');
      return;
    }

    this.runtime.respawningTimer = 0.7;
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
    this.runtime.bullets = [];
    this.runtime.bossProjectiles = [];
    this.runtime.enemyProjectiles = [];
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
      burstParticles: this.runtime.burstParticles,

      platforms: this.platforms,
      enemies: this.enemies,
      collectibles: this.collectibles,
      chests: this.chests,
      hazards: this.hazards,
      tunnels: this.tunnels,

      score: this.runtime.score,
      specialCharge: this.runtime.specialCharge,
      lives: this.runtime.lives,
      maxLives: this.maxLives,

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
