export type CollectibleType = 'coin' | 'heart' | 'ray';

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
