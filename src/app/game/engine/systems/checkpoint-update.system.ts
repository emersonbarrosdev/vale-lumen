import { Hero } from '../../domain/hero/hero.model';
import { Platform } from '../../domain/world/platform.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';
import { PhaseRuntimeRules } from '../../content/phases/shared/phase-runtime-rules.model';

export interface CheckpointUpdateSystemParams {
  hero: Hero;
  runtime: EngineRuntime;
  platforms: Platform[];
}

export function buildCheckpointXs(
  runtimeRules: PhaseRuntimeRules,
): number[] {
  const checkpointXs = [...runtimeRules.checkpointXs]
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (!checkpointXs.length) {
    return [48];
  }

  return Array.from(new Set(checkpointXs));
}

export function updateCheckpointProgressSystem({
  hero,
  runtime,
  platforms,
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
    );
  }
}

export function setCheckpoint(
  x: number,
  runtime: EngineRuntime,
  hero: Hero,
  platforms: Platform[],
): void {
  const spawn = findSpawnPointNear(x, hero, platforms);
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
  hero.state = 'idle';
}

export function findSpawnPointNear(
  targetX: number,
  hero: Hero,
  platforms: Platform[],
): { x: number; y: number } {
  const groundSegments = platforms
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
        preferredGround.x + preferredGround.width - hero.width - 26,
      ),
    );

    return {
      x: safeX,
      y: preferredGround.y - hero.height,
    };
  }

  let bestPlatform: Platform | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const platform of platforms) {
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
    y: bestPlatform.y - hero.height,
  };
}
