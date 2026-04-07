import { EnemyData } from '../enemies/enemy.model';
import { BossArenaData } from './boss-arena.model';
import { ChestData } from './chest.model';
import { CollectibleData } from './collectible.model';
import { PhaseDefinition } from './phase-definition.model';
import { PlatformData } from './platform.model';

export type HazardType = 'goo' | 'crystal' | 'spike' | 'geyser';

export interface HazardData {
  type: HazardType;
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
}

export interface TunnelData {
  x: number;
  width: number;
  ceilingY: number;
  thickness: number;
}

export interface PhasePlayableData {
  definition: PhaseDefinition;
  worldWidth: number;
  platforms: PlatformData[];
  enemies: EnemyData[];
  collectibles: CollectibleData[];
  chests: ChestData[];
  bossArena: BossArenaData;
  hazards: HazardData[];
  tunnels: TunnelData[];
}
