export interface LightningPoint {
  x: number;
  y: number;
}

export interface SpecialStrike {
  points: LightningPoint[];
  life: number;
  maxLife: number;
  width: number;
}
