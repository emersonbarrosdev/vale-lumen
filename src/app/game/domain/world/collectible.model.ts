export type CollectibleType =
  | 'coin'
  | 'coin10'
  | 'bigCoin10'
  | 'lifeFragment'
  | 'specialSpark'
  | 'heart'
  | 'ray'
  | 'flameVial'
  | 'shieldOrb';

export interface CollectibleData {
  type: CollectibleType;
  x: number;
  y: number;
}

export interface Collectible extends CollectibleData {
  width: number;
  height: number;
  collected: boolean;
  spawnedDuringRun?: boolean;
  spawnTimer?: number;
  spawnVy?: number;
  startY?: number;
}
