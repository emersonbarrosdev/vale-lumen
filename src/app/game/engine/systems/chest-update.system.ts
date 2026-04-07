import { Chest } from '../../domain/world/chest.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';
import { Hero } from '../../domain/hero/hero.model';

export interface ChestUpdateSystemParams {
  chests: Chest[];
  deltaTime: number;
}

export interface BreakChestSystemParams {
  chest: Chest;
  runtime: EngineRuntime;
  hero: Hero;
  spawnBurst: (x: number, y: number, color: string, amount: number) => void;
}

export function updateChestsSystem({
  chests,
  deltaTime,
}: ChestUpdateSystemParams): void {
  for (const chest of chests) {
    if (chest.breakTimer > 0) {
      chest.breakTimer = Math.max(0, chest.breakTimer - deltaTime);
    }
  }
}

export function breakChestSystem({
  chest,
  runtime,
  hero,
  spawnBurst,
}: BreakChestSystemParams): void {
  if (!chest.active) {
    return;
  }

  chest.active = false;
  chest.breakTimer = 0.58;

  if (!chest.rewardGranted) {
    chest.rewardGranted = true;

    if (chest.rare) {
      addSpecialCharge(runtime, 100);
      hero.hp = Math.min(hero.maxHp, hero.hp + 25);
      runtime.score += 150;
    } else {
      addSpecialCharge(runtime, 50);
      hero.hp = Math.min(hero.maxHp, hero.hp + 20);
      runtime.score += 80;
    }

    syncSpecialHudState(runtime);
  }

  const centerX = chest.x + chest.width / 2;
  const centerY = chest.y + chest.height / 2;

  spawnBurst(centerX, centerY, '#ffda7d', chest.rare ? 20 : 16);
  spawnBurst(centerX, centerY, '#7de8ff', chest.rare ? 16 : 12);
  spawnBurst(centerX, centerY, '#72ff95', chest.rare ? 12 : 8);
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
