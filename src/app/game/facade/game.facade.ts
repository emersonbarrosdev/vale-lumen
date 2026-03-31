import { Injectable } from '@angular/core';
import { GameStateService } from '../services/game-state.service';

@Injectable({
  providedIn: 'root',
})
export class GameFacade {
  constructor(private readonly gameState: GameStateService) {}

  get currentScore(): number {
    return this.gameState.currentScore;
  }

  get lastScore(): number {
    return this.gameState.lastScore;
  }

  get currentPhase(): number {
    return this.gameState.currentPhase;
  }

  resetRun(): void {
    this.gameState.resetRun();
  }

  finishRun(score: number): void {
    this.gameState.finishRun(score);
  }

  saveSettings(musicVolume: number, effectsVolume: number): void {
    this.gameState.saveSettings(musicVolume, effectsVolume);
  }
}
