import { EngineCallbacks } from '../../../core/models/game/engine-callbacks.model';
import { PhaseBossRuntimeRules } from '../../content/phases/shared/phase-runtime-rules.model';
import { Boss } from '../../domain/bosses/boss.model';
import { Hero } from '../../domain/hero/hero.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';
import { PhasePlayableData } from '../../domain/world/phase-playable-data.model';
import {
  clampHeroInsideBossArenaBase,
  createBossGooVolleyProjectiles,
  createBossUltimateProjectile,
  createBossWaveProjectiles,
  rectsOverlap,
  startBossJumpBase,
  tryActivateBossBase,
  updateBossPhysicsBase,
} from '../helpers/boss-runtime.helper';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export interface BossUpdateSystemParams {
  boss: Boss;
  hero: Hero;
  runtime: EngineRuntime;
  bossArena: BossArenaData;
  phaseData: PhasePlayableData;
  bossRuntimeRules: PhaseBossRuntimeRules;
  callbacks: EngineCallbacks;
  gravity: number;
  deltaTime: number;
  randomRange: (min: number, max: number) => number;
  applyHeroDamage: (damage?: number) => void;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
  playBossSpecialSfx: () => void;
}

export function updateBossSystem({
  boss,
  hero,
  runtime,
  bossArena,
  phaseData,
  bossRuntimeRules,
  callbacks,
  gravity,
  deltaTime,
  randomRange,
  applyHeroDamage,
  spawnBurst,
  playBossSpecialSfx,
}: BossUpdateSystemParams): void {
  const activatedNow = tryActivateBossBase({
    boss,
    hero,
    runtime,
    bossArena,
    activationOffset: 120,
  });

  if (activatedNow && !runtime.bossIntroShown && callbacks.onBossIntro) {
    runtime.bossIntroShown = true;
    runtime.bossIntroPending = true;
    callbacks.onBossIntro(phaseData.definition.boss.dialog);
  }

  if (!boss.active || boss.hp <= 0) {
    return;
  }

  const bossHpRatio = boss.hp / boss.maxHp;

  updateBossTimers(boss, deltaTime);

  clampHeroInsideBossArenaBase({
    hero,
    bossArena,
    heroArenaLeftOffset: bossRuntimeRules.heroArenaLeftOffset,
    heroArenaRightOffset: bossRuntimeRules.heroArenaRightOffset,
  });

  if (boss.jumpCooldown <= 0 && boss.onGround) {
    startBossJumpBase(boss, randomRange);
  }

  updateBossPhysicsBase({
    boss,
    bossArena,
    gravity,
    deltaTime,
    spawnBurst,
  });

  resolveBossAttackPattern({
    boss,
    hero,
    runtime,
    bossHpRatio,
    randomRange,
    playBossSpecialSfx,
  });

  if (hero.invulnerabilityTimer <= 0 && rectsOverlap(hero, boss)) {
    applyHeroDamage();
  }
}

function updateBossTimers(
  boss: Boss,
  deltaTime: number,
): void {
  boss.hitFlash = Math.max(0, boss.hitFlash - deltaTime);
  boss.secondaryCooldown -= deltaTime;
  boss.jumpCooldown -= deltaTime;
  boss.introPulse = Math.max(0, boss.introPulse - deltaTime);
  boss.castTimer = Math.max(0, boss.castTimer - deltaTime);
  boss.squashTimer = Math.max(0, boss.squashTimer - deltaTime);
  boss.armSwing += deltaTime * (boss.castTimer > 0 ? 8 : 2.8);
}

function resolveBossAttackPattern(params: {
  boss: Boss;
  hero: Hero;
  runtime: EngineRuntime;
  bossHpRatio: number;
  randomRange: (min: number, max: number) => number;
  playBossSpecialSfx: () => void;
}): void {
  const {
    boss,
    hero,
    runtime,
    bossHpRatio,
    randomRange,
    playBossSpecialSfx,
  } = params;

  if (!boss.special50Used && bossHpRatio <= 0.5) {
    runtime.bossProjectiles.push(createBossUltimateProjectile(boss));
    boss.special50Used = true;
    boss.castTimer = 0.9;
    boss.secondaryCooldown = 1.2;
    playBossSpecialSfx();
    return;
  }

  if (!boss.special15Used && bossHpRatio <= 0.15) {
    runtime.bossProjectiles.push(createBossUltimateProjectile(boss));
    boss.special15Used = true;
    boss.castTimer = 0.9;
    boss.secondaryCooldown = 1;
    playBossSpecialSfx();
    return;
  }

  if (boss.secondaryCooldown > 0) {
    return;
  }

  const useGooVolley =
    runtime.bossAttackPatternIndex % 2 === 1 || bossHpRatio <= 0.55;

  if (useGooVolley) {
    runtime.bossProjectiles.push(
      ...createBossGooVolleyProjectiles({
        boss,
        hero,
        lowHpMode: bossHpRatio <= 0.35,
        randomRange,
      }),
    );

    boss.secondaryCooldown = bossHpRatio <= 0.3 ? 1.15 : 1.7;
    boss.castTimer = 0.58;
    playBossSpecialSfx();
  } else {
    runtime.bossProjectiles.push(
      ...createBossWaveProjectiles(boss, bossHpRatio <= 0.3),
    );

    boss.secondaryCooldown = bossHpRatio <= 0.3 ? 1.1 : 1.65;
    boss.castTimer = 0.45;
    playBossSpecialSfx();
  }

  runtime.bossAttackPatternIndex += 1;
}
