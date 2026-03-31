export interface GameConfig {
  defaultMusicVolume: number;
  defaultEffectsVolume: number;
  defaultCurrentPhase: number;
  defaultCurrentScore: number;
  defaultLastScore: number;
}

export const GAME_CONFIG: GameConfig = {
  defaultMusicVolume: 70,
  defaultEffectsVolume: 80,
  defaultCurrentPhase: 1,
  defaultCurrentScore: 0,
  defaultLastScore: 0,
};
