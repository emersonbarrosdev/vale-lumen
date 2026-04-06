import { Hero } from '../../domain/hero/hero.model';
import { Collectible } from '../../domain/world/collectible.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export interface CollectibleUpdateSystemParams {
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
}: CollectibleUpdateSystemParams): void {
  for (const item of collectibles) {
    if (item.collected) {
      continue;
    }

    if (!rectsOverlap(hero, item)) {
      continue;
    }

    item.collected = true;

    switch (item.type) {
      case 'coin':
        runtime.collectedCoins += 1;
        runtime.score += 8;
        break;

      case 'heart':
        hero.hp = Math.min(hero.maxHp, hero.hp + 20);
        spawnBurst(item.x, item.y, '#72ff95', 10);
        break;

      case 'ray':
        runtime.collectedSparks += 1;
        runtime.specialCharge = Math.min(100, runtime.specialCharge + 10);
        runtime.score += 15;
        spawnBurst(item.x, item.y, '#7de8ff', 12);
        break;

      case 'flameVial':
        runtime.collectedSparks += 2;
        runtime.specialCharge = Math.min(100, runtime.specialCharge + 25);
        runtime.score += 25;
        spawnBurst(item.x, item.y, '#ffb35c', 14);
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
