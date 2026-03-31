import { Injectable } from '@angular/core';
import { GAME_CONFIG } from '../../core/config/game.config';
import { GameRunState } from '../../core/models/game/game-run-state.model';
import { GameSettings } from '../../core/models/game/game-settings.model';
import {
  readStoredNumber,
  writeStoredNumber,
} from '../../core/utils/storage.util';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  currentScore: number = GAME_CONFIG.defaultCurrentScore;
  lastScore: number = GAME_CONFIG.defaultLastScore;
  currentPhase: number = GAME_CONFIG.defaultCurrentPhase;
  musicVolume: number = GAME_CONFIG.defaultMusicVolume;
  effectsVolume: number = GAME_CONFIG.defaultEffectsVolume;

  constructor() {
    this.musicVolume = readStoredNumber(
      'musicVolume',
      GAME_CONFIG.defaultMusicVolume,
    );
    this.effectsVolume = readStoredNumber(
      'effectsVolume',
      GAME_CONFIG.defaultEffectsVolume,
    );
  }

  get runState(): GameRunState {
    return {
      currentScore: this.currentScore,
      lastScore: this.lastScore,
      currentPhase: this.currentPhase,
    };
  }

  get settings(): GameSettings {
    return {
      musicVolume: this.musicVolume,
      effectsVolume: this.effectsVolume,
    };
  }

  resetRun(): void {
    this.currentScore = 0;
    this.currentPhase = 1;
  }

  setCurrentScore(score: number): void {
    this.currentScore = score;
  }

  finishRun(score: number): void {
    this.currentScore = score;
    this.lastScore = score;
  }

  saveSettings(musicVolume: number, effectsVolume: number): void {
    this.musicVolume = musicVolume;
    this.effectsVolume = effectsVolume;

    writeStoredNumber('musicVolume', musicVolume);
    writeStoredNumber('effectsVolume', effectsVolume);
  }
}
