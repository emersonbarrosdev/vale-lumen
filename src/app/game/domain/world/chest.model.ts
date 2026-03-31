export interface ChestData {
  x: number;
  y: number;
  width: number;
  height: number;
  rare?: boolean;
}

export interface Chest extends ChestData {
  active: boolean;
  breakTimer: number;
  rewardGranted: boolean;
}
