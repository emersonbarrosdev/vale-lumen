import { PhaseRuntimeRules } from '../../content/phases/shared/phase-runtime-rules.model';
import { Hero } from '../../domain/hero/hero.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';
import { Hazard } from '../../domain/world/hazard.model';
import { Platform } from '../../domain/world/platform.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

const HERO_RESPAWN_VISUAL_OFFSET = 2;

export interface CheckpointUpdateSystemParams {
  hero: Hero;
  runtime: EngineRuntime;
  platforms: Platform[];
  hazards?: Hazard[];
  bossArena?: BossArenaData;
}

export function buildCheckpointXs(
  runtimeRules: PhaseRuntimeRules,
): number[] {
  const checkpointXs = [...runtimeRules.checkpointXs]
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (!checkpointXs.length) {
    return [96];
  }

  return Array.from(new Set(checkpointXs));
}

export function updateCheckpointProgressSystem({
  hero,
  runtime,
  platforms,
  hazards = [],
  bossArena,
}: CheckpointUpdateSystemParams): void {
  while (
    runtime.checkpointIndex + 1 < runtime.checkpointXs.length &&
    hero.x >= runtime.checkpointXs[runtime.checkpointIndex + 1]
  ) {
    runtime.checkpointIndex += 1;

    setCheckpoint(
      runtime.checkpointXs[runtime.checkpointIndex],
      runtime,
      hero,
      platforms,
      hazards,
      bossArena,
    );
  }
}

export function setCheckpoint(
  x: number,
  runtime: EngineRuntime,
  hero: Hero,
  platforms: Platform[],
  hazards: Hazard[] = [],
  bossArena?: BossArenaData,
): void {
  const spawn = findSpawnPointNear(
    x,
    hero,
    platforms,
    hazards,
    bossArena,
  );

  runtime.respawnX = spawn.x;
  runtime.respawnY = spawn.y;
}

export function placeHeroAtRespawn(
  hero: Hero,
  runtime: EngineRuntime,
  isInitialSpawn = false,
): void {
  hero.x = runtime.respawnX;
  hero.y = runtime.respawnY;
  hero.vx = 0;
  hero.vy = 0;
  hero.direction = 1;
  hero.onGround = true;
  hero.jumpsRemaining = hero.maxJumps;
  hero.invulnerabilityTimer = isInitialSpawn ? 0.7 : 1.1;
  hero.castTimer = 0;
  hero.castDuration = 0;
  hero.castAim = 'forward';
  hero.hurtTimer = 0;
  hero.landingTimer = 0;
  hero.state = 'idle';
  hero.aimingUp = false;
  hero.specialCasting = false;
  hero.megaCasting = false;
  hero.megaVisualTimer = 0;
  hero.shieldGraceTimer = 0;
  hero.coyoteTimer = 0;
  hero.jumpBufferTimer = 0;
  hero.crouching = false;
  hero.attackHoldTimer = 0;
  hero.chargedShotPending = false;
}

export function findSpawnPointNear(
  targetX: number,
  hero: Hero,
  platforms: Platform[],
  hazards: Hazard[] = [],
  bossArena?: BossArenaData,
): { x: number; y: number } {
  const safeGroundSegments = platforms
    .filter((platform) => platform.height >= 70 && platform.active !== false)
    .sort((a, b) => a.x - b.x);

  let bestSpawn: { x: number; y: number } | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const platform of safeGroundSegments) {
    const usableLeft = platform.x + 56;
    const usableRight = platform.x + platform.width - hero.width - 56;

    if (usableRight <= usableLeft) {
      continue;
    }

    const candidateXs = buildCandidateXs(targetX, usableLeft, usableRight);

    for (const candidateX of candidateXs) {
      const candidate = {
        x: candidateX,
        y: platform.y - hero.height - HERO_RESPAWN_VISUAL_OFFSET,
      };

      if (!isSafeRespawnPoint(candidate, hero, platform, hazards, bossArena)) {
        continue;
      }

      const score = Math.abs(candidateX - targetX);

      if (score < bestScore) {
        bestScore = score;
        bestSpawn = candidate;
      }
    }
  }

  if (bestSpawn) {
    return bestSpawn;
  }

  const preferredGround =
    safeGroundSegments.find(
      (platform) =>
        targetX >= platform.x + 48 &&
        targetX <= platform.x + platform.width - hero.width - 48,
    ) ??
    safeGroundSegments[0];

  if (preferredGround) {
    return {
      x: Math.max(
        preferredGround.x + 56,
        Math.min(
          targetX,
          preferredGround.x + preferredGround.width - hero.width - 56,
        ),
      ),
      y: preferredGround.y - hero.height - HERO_RESPAWN_VISUAL_OFFSET,
    };
  }

  return { x: 96, y: 500 };
}

function buildCandidateXs(
  targetX: number,
  usableLeft: number,
  usableRight: number,
): number[] {
  const center = usableLeft + (usableRight - usableLeft) / 2;

  return Array.from(
    new Set([
      clamp(targetX, usableLeft, usableRight),
      clamp(targetX - 72, usableLeft, usableRight),
      clamp(targetX + 72, usableLeft, usableRight),
      clamp(center, usableLeft, usableRight),
    ]),
  );
}

function isSafeRespawnPoint(
  spawn: { x: number; y: number },
  hero: Hero,
  platform: Platform,
  hazards: Hazard[],
  bossArena?: BossArenaData,
): boolean {
  const heroLeft = spawn.x;
  const heroRight = spawn.x + hero.width;
  const heroTop = spawn.y;
  const heroBottom = spawn.y + hero.height;

  const leftMargin = heroLeft - platform.x;
  const rightMargin = platform.x + platform.width - heroRight;

  if (leftMargin < 52 || rightMargin < 52) {
    return false;
  }

  for (const hazard of hazards) {
    if (!hazard.active) {
      continue;
    }

    const expandedLeft = hazard.x - 28;
    const expandedRight = hazard.x + hazard.width + 28;
    const expandedTop = hazard.y - hero.height - 12;
    const expandedBottom = hazard.y + hazard.height + 12;

    const overlapsX = heroRight > expandedLeft && heroLeft < expandedRight;
    const overlapsY = heroBottom > expandedTop && heroTop < expandedBottom;

    if (overlapsX && overlapsY) {
      return false;
    }
  }

  if (bossArena) {
    const unsafeBossStart = bossArena.startX - 40;
    const unsafeBossEnd = bossArena.startX + 180;

    if (heroRight >= unsafeBossStart && heroLeft <= unsafeBossEnd) {
      return false;
    }
  }

  return true;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
