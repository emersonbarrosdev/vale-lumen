import { Chest } from '../../domain/world/chest.model';
import { Collectible } from '../../domain/world/collectible.model';
import { Hazard } from '../../domain/world/hazard.model';
import { PhasePlayableData } from '../../domain/world/phase-playable-data.model';
import { Platform } from '../../domain/world/platform.model';
import { Tunnel } from '../../domain/world/tunnel.model';

export interface EngineWorldState {
  worldWidth: number;
  platforms: Platform[];
  collectibles: Collectible[];
  chests: Chest[];
  hazards: Hazard[];
  tunnels: Tunnel[];
}

export function createWorldState(
  phaseData: PhasePlayableData,
): EngineWorldState {
  return {
    worldWidth: phaseData.worldWidth,
    platforms: [...phaseData.platforms].sort((a, b) => a.x - b.x),
    collectibles: phaseData.collectibles.map((item) => ({
      ...item,
      width: getCollectibleWidth(item.type),
      height: getCollectibleHeight(item.type),
      collected: false,
      vy: 0,
      falling: false,
      settled: false,
    })),
    chests: phaseData.chests.map((chest) => ({
      ...chest,
      active: true,
      breakTimer: 0,
      rewardGranted: false,
    })),
    hazards: (phaseData.hazards ?? []).map((hazard) => ({
      ...hazard,
      active: true,
      pulseOffset: Math.random() * Math.PI * 2,
    })),
    tunnels: (phaseData.tunnels ?? []).map((tunnel) => ({ ...tunnel })),
  };
}

function getCollectibleWidth(type: Collectible['type']): number {
  switch (type) {
    case 'coin':
      return 18;
    case 'specialCoin':
      return 24;
    case 'heart':
      return 22;
    case 'ray':
      return 22;
    case 'flameVial':
      return 22;
    case 'shieldOrb':
      return 24;
    default:
      return 22;
  }
}

function getCollectibleHeight(type: Collectible['type']): number {
  switch (type) {
    case 'coin':
      return 18;
    case 'specialCoin':
      return 24;
    case 'heart':
      return 22;
    case 'ray':
      return 22;
    case 'flameVial':
      return 22;
    case 'shieldOrb':
      return 24;
    default:
      return 22;
  }
}
