import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  currentScore = 0;
  lastScore = 0;
  currentPhase = 1;
  musicVolume = Number(localStorage.getItem('musicVolume') ?? '70');
  effectsVolume = Number(localStorage.getItem('effectsVolume') ?? '80');

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

    localStorage.setItem('musicVolume', String(musicVolume));
    localStorage.setItem('effectsVolume', String(effectsVolume));
  }
}
