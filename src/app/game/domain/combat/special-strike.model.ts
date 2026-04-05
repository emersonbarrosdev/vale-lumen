export interface LightningPoint {
  x: number;
  y: number;
}

export type SpecialStrikeTheme = 'heroSpecial';

export interface SpecialStrike {
  points: LightningPoint[];
  life: number;
  maxLife: number;
  width: number;
  theme?: SpecialStrikeTheme;
}
