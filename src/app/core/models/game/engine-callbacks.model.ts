export interface EngineCallbacks {
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
}
