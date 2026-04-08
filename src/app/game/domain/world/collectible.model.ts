export type CollectibleType =
  | 'coin'
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
}
