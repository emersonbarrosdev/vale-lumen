export type CollectibleType = 'coin' | 'heart' | 'ray' | 'flameVial';

export interface CollectibleData {
  type: CollectibleType;
  x: number;
  y: number;
}

export interface Collectible extends CollectibleData {
  width: number;
  height: number;
  collected: boolean;
  vy: number;
  falling: boolean;
  settled: boolean;
}
