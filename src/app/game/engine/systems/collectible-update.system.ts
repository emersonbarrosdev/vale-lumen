import { Collectible } from '../../domain/world/collectible.model';
import { Hero } from '../../domain/hero/hero.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export interface CollectibleUpdateParams {
  hero: Hero;
  collectibles: Collectible[];
  runtime: EngineRuntime;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
}

export function updateCollectiblesSystem({
  hero,
  collectibles,
  runtime,
  spawnBurst,
}: CollectibleUpdateParams): void {
  for (const item of collectibles) {
    if (item.collected) {
      continue;
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
        break;

      case 'ray':
        runtime.collectedSparks += 1;
        runtime.specialCharge = Math.min(100, runtime.specialCharge + 10);
        spawnBurst(centerX, centerY, '#8eeaff', 10);
        break;

      case 'flameVial':
        runtime.specialCharge = Math.min(100, runtime.specialCharge + 25);
        runtime.score += 40;
        spawnBurst(centerX, centerY, '#ff9b42', 12);
        break;

      case 'heart':
        runtime.lives = Math.min(3, runtime.lives + 1);
        runtime.score += 60;
        spawnBurst(centerX, centerY, '#ff7b7b', 12);
        break;

      case 'shieldOrb':
        hero.shieldActive = true;
        runtime.score += 80;
        spawnBurst(centerX, centerY, '#82e8ff', 16);
        break;

      default:
        break;
    }
  }
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
