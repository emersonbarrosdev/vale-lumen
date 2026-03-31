import { EnemyData } from '../enemies/enemy.model';
import { BossArenaData } from './boss-arena.model';
import { ChestData } from './chest.model';
import { CollectibleData } from './collectible.model';
import { PhaseDefinition } from './phase-definition.model';
import { PlatformData } from './platform.model';

export interface PhasePlayableData {
  definition: PhaseDefinition;
  worldWidth: number;
  platforms: PlatformData[];
  enemies: EnemyData[];
  collectibles: CollectibleData[];
  chests: ChestData[];
  bossArena: BossArenaData;
}
