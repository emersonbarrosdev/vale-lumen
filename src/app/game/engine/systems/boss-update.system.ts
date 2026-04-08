import { EngineCallbacks } from '../../../core/models/game/engine-callbacks.model';
import { PhaseBossRuntimeRules } from '../../content/phases/shared/phase-runtime-rules.model';
import { Boss } from '../../domain/bosses/boss.model';
import { BossProjectile } from '../../domain/bosses/boss-projectile.model';
import { Hero } from '../../domain/hero/hero.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';
import { PhasePlayableData } from '../../domain/world/phase-playable-data.model';
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
}: BossUpdateSystemParams): void {
  tryActivateBoss({
    boss,
    hero,
    runtime,
    bossArena,
    phaseData,
    callbacks,
  });

  if (!boss.active || boss.hp <= 0) {
    return;
  }

  const bossHpRatio = boss.hp / boss.maxHp;

  boss.hitFlash = Math.max(0, boss.hitFlash - deltaTime);
  boss.secondaryCooldown -= deltaTime;
  boss.jumpCooldown -= deltaTime;
  boss.introPulse = Math.max(0, boss.introPulse - deltaTime);
  boss.castTimer = Math.max(0, boss.castTimer - deltaTime);
  boss.squashTimer = Math.max(0, boss.squashTimer - deltaTime);
  boss.armSwing += deltaTime * (boss.castTimer > 0 ? 8 : 2.8);

  clampHeroInsideBossArena(hero, bossArena, bossRuntimeRules);

  if (boss.jumpCooldown <= 0 && boss.onGround) {
    startBossJump(boss, randomRange);
  }

  updateBossPhysics({
    boss,
    bossArena,
    gravity,
    deltaTime,
    spawnBurst,
  });

  if (!boss.special50Used && bossHpRatio <= 0.5) {
    fireBossUltimateShot(boss, runtime);
    boss.special50Used = true;
    boss.castTimer = 0.9;
    boss.secondaryCooldown = 1.2;
  } else if (!boss.special15Used && bossHpRatio <= 0.15) {
    fireBossUltimateShot(boss, runtime);
    boss.special15Used = true;
    boss.castTimer = 0.9;
    boss.secondaryCooldown = 1;
  } else if (boss.secondaryCooldown <= 0) {
    const useGooVolley =
      runtime.bossAttackPatternIndex % 2 === 1 || bossHpRatio <= 0.55;

    if (useGooVolley) {
      fireBossGooVolley({
        boss,
        hero,
        runtime,
        randomRange,
      });
      boss.secondaryCooldown = bossHpRatio <= 0.3 ? 1.15 : 1.7;
      boss.castTimer = 0.58;
    } else {
      fireBossWaveShot(boss, runtime);
      boss.secondaryCooldown = bossHpRatio <= 0.3 ? 1.1 : 1.65;
      boss.castTimer = 0.45;
    }

    runtime.bossAttackPatternIndex += 1;
  }

  if (hero.invulnerabilityTimer <= 0 && rectsOverlap(hero, boss)) {
    applyHeroDamage();
  }
}

function tryActivateBoss({
  boss,
  hero,
  runtime,
  bossArena,
  phaseData,
  callbacks,
}: {
  boss: Boss;
  hero: Hero;
  runtime: EngineRuntime;
  bossArena: BossArenaData;
  phaseData: PhasePlayableData;
  callbacks: EngineCallbacks;
}): void {
  if (boss.active) {
    return;
  }

  /**
   * Ativação mais segura:
   * o herói precisa realmente entrar no chão da arena,
   * não apenas se aproximar pelo lado de fora.
   */
  const heroCenterX = hero.x + hero.width / 2;
  const arenaActivationX = bossArena.startX + 120;

  if (heroCenterX < arenaActivationX) {
    return;
  }

  boss.active = true;
  boss.introPulse = 1.5;
  boss.y = getBossGroundTop(boss, bossArena);

  /**
   * Garante que a intro aconteça já em piso seguro,
   * sem o herói ficar travado em borda ruim.
   */
  hero.x = Math.max(hero.x, bossArena.startX + 42);
  hero.y = bossArena.groundY - hero.height;
  hero.vx = 0;
  hero.vy = 0;
  hero.onGround = true;
  hero.jumpsRemaining = hero.maxJumps;

  if (!runtime.bossIntroShown && callbacks.onBossIntro) {
    runtime.bossIntroShown = true;
    runtime.bossIntroPending = true;
    callbacks.onBossIntro(phaseData.definition.boss.dialog);
  }
}

function clampHeroInsideBossArena(
  hero: Hero,
  bossArena: BossArenaData,
  bossRuntimeRules: PhaseBossRuntimeRules,
): void {
  const heroMinX = bossArena.startX - bossRuntimeRules.heroArenaLeftOffset;
  const heroMaxX = bossArena.endX - hero.width - bossRuntimeRules.heroArenaRightOffset;

  if (hero.x > heroMaxX) {
    hero.x = heroMaxX;
  }

  if (hero.x < heroMinX) {
    hero.x = heroMinX;
  }
}

function startBossJump(
  boss: Boss,
  randomRange: (min: number, max: number) => number,
): void {
  boss.vy = -820;
  boss.onGround = false;
  boss.jumpCooldown = randomRange(2.1, 3.4);
}

function updateBossPhysics({
  boss,
  bossArena,
  gravity,
  deltaTime,
  spawnBurst,
}: {
  boss: Boss;
  bossArena: BossArenaData;
  gravity: number;
  deltaTime: number;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
}): void {
  if (boss.onGround) {
    boss.y = getBossGroundTop(boss, bossArena);
    return;
  }

  boss.vy += (gravity + 900) * deltaTime;
  boss.y += boss.vy * deltaTime;

  const bossGround = getBossGroundTop(boss, bossArena);

  if (boss.y >= bossGround) {
    boss.y = bossGround;
    boss.vy = 0;
    boss.onGround = true;
    boss.squashTimer = 0.16;
    spawnBurst(
      boss.x + boss.width / 2,
      boss.y + boss.height - 4,
      '#8b3d55',
      10,
    );
  }
}

function fireBossWaveShot(
  boss: Boss,
  runtime: EngineRuntime,
): void {
  const count = boss.hp / boss.maxHp <= 0.3 ? 3 : 2;

  for (let index = 0; index < count; index += 1) {
    const projectile: BossProjectile = {
      x: boss.x + 26,
      y: boss.y + 126 + index * 8,
      vx: -185 - index * 10,
      radius: 13,
      active: true,
      waveOffset: Math.random() * Math.PI * 2,
      amplitude: 18 + index * 6,
      frequency: 6.1 + index * 0.25,
      elapsed: 0,
      damage: 16,
      kind: 'normal',
    };

    runtime.bossProjectiles.push(projectile);
  }
}

function fireBossGooVolley({
  boss,
  hero,
  runtime,
  randomRange,
}: {
  boss: Boss;
  hero: Hero;
  runtime: EngineRuntime;
  randomRange: (min: number, max: number) => number;
}): void {
  const launchX = boss.x + 26;
  const launchY = boss.y + 110;
  const targetX = hero.x + hero.width / 2 + hero.vx * 0.28;
  const count = boss.hp / boss.maxHp <= 0.35 ? 3 : 2;
  const gravity = 960;
  const middleIndex = (count - 1) / 2;

  for (let index = 0; index < count; index += 1) {
    const spread = (index - middleIndex) * 34;
    const landingX = targetX + spread;
    const timeToLand = randomRange(0.8, 1.02);
    const vx = (landingX - launchX) / timeToLand;
    const vy = -randomRange(420, 520);

    const projectile: BossProjectile = {
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
    };

    runtime.bossProjectiles.push(projectile);
  }
}

function fireBossUltimateShot(
  boss: Boss,
  runtime: EngineRuntime,
): void {
  const projectile: BossProjectile = {
    x: boss.x + 24,
    y: boss.y + 120,
    vx: -155,
    radius: 28,
    active: true,
    waveOffset: Math.random() * Math.PI * 2,
    amplitude: 10,
    frequency: 4.3,
    elapsed: 0,
    damage: 30,
    kind: 'ultimate',
  };

  runtime.bossProjectiles.push(projectile);
}

function getBossGroundTop(
  boss: Boss,
  bossArena: BossArenaData,
): number {
  return bossArena.groundY - boss.height;
}

function rectsOverlap(
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
