import { Collectible } from '../../domain/world/collectible.model';
import { Hero } from '../../domain/hero/hero.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

const SPAWN_GRAVITY = 980;

export interface CollectibleUpdateParams {
  hero: Hero;
  collectibles: Collectible[];
  runtime: EngineRuntime;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
  playCollectibleSfx: (trackId: 'coin-pickup' | 'spark-pickup' | 'heart-pickup' | 'extra-life') => void;
}

export function updateCollectiblesSystem({
  hero,
  collectibles,
  runtime,
  spawnBurst,
  playCollectibleSfx,
}: CollectibleUpdateParams): void {
  for (const item of collectibles) {
    if (item.collected) {
      continue;
    }

    if (item.spawnedDuringRun) {
      updateSpawnedCollectible(item);
    }

    if (!rectsOverlap(hero, item)) {
      continue;
    }

    item.collected = true;

    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;

    switch (item.type) {
      case 'coin':
        runtime.collectedCoins += 1;
        runtime.score += 100;
        spawnBurst(centerX, centerY, '#ffd45a', 10);
        playCollectibleSfx('coin-pickup');

        if (runtime.collectedCoins % 100 === 0) {
          runtime.lives += 1;
          runtime.score += 250;
          spawnBurst(centerX, centerY - 8, '#9cff88', 18);
          playCollectibleSfx('extra-life');
        }
        break;

      case 'coin10':
      case 'bigCoin10':
        runtime.collectedCoins += 10;
        runtime.score += 500;
        spawnBurst(centerX, centerY, '#ffe27a', 16);
        playCollectibleSfx('coin-pickup');
        break;

      case 'lifeFragment':
        runtime.score += 85;
        runtime.lives += 1;
        spawnBurst(centerX, centerY, '#ff9aa2', 14);
        playCollectibleSfx('heart-pickup');
        break;

      case 'specialSpark':
        runtime.collectedSparks += 1;
        runtime.score += 120;
        addSpecialCharge(runtime, 16);
        spawnBurst(centerX, centerY, '#8eeaff', 14);
        playCollectibleSfx('spark-pickup');
        break;

      case 'ray':
        runtime.collectedSparks += 1;
        addSpecialCharge(runtime, 10);
        spawnBurst(centerX, centerY, '#8eeaff', 10);
        playCollectibleSfx('spark-pickup');
        break;

      case 'flameVial':
        addSpecialCharge(runtime, 25);
        runtime.score += 40;
        spawnBurst(centerX, centerY, '#ff9b42', 12);
        playCollectibleSfx('spark-pickup');
        break;

      case 'heart':
        runtime.lives += 1;
        runtime.score += 60;
        spawnBurst(centerX, centerY, '#ff7b7b', 12);
        playCollectibleSfx('heart-pickup');
        break;

      case 'shieldOrb':
        hero.shieldActive = true;
        runtime.score += 80;
        spawnBurst(centerX, centerY, '#82e8ff', 16);
        playCollectibleSfx('spark-pickup');
        break;

      default:
        break;
    }
  }

  syncSpecialHudState(runtime);
}

function updateSpawnedCollectible(item: Collectible): void {
  item.spawnTimer = (item.spawnTimer ?? 0) + 1 / 60;
  item.spawnVy = (item.spawnVy ?? 0) + SPAWN_GRAVITY / 60;
  item.y += (item.spawnVy ?? 0) / 60;

  if (
    item.startY !== undefined &&
    item.spawnVy !== undefined &&
    item.spawnTimer > 0.2 &&
    item.spawnVy > 0 &&
    item.y >= item.startY
  ) {
    item.y = item.startY;
    item.spawnVy = 0;
    item.spawnedDuringRun = false;
  }
}

function addSpecialCharge(runtime: EngineRuntime, amount: number): void {
  runtime.specialCharge = Math.max(0, Math.min(100, runtime.specialCharge + amount));
}

function syncSpecialHudState(runtime: EngineRuntime): void {
  runtime.specialSegmentsReady = Math.min(3, Math.floor(runtime.specialCharge / 33.34));

  if (runtime.specialCharge >= 100) {
    runtime.ignitionReady = true;
    runtime.specialHudLabel = 'Ignição';
    runtime.specialSegmentsReady = 3;
    return;
  }

  runtime.ignitionReady = false;
  runtime.specialHudLabel = 'Especial';
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
