import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  currentScore = 0;
  lastScore = 0;
  currentPhase = 1;
  musicVolume = 70;
  effectsVolume = 80;

  constructor() {
    this.musicVolume = this.readNumber('musicVolume', 70);
    this.effectsVolume = this.readNumber('effectsVolume', 80);
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

    this.writeNumber('musicVolume', musicVolume);
    this.writeNumber('effectsVolume', effectsVolume);
  }

  private readNumber(key: string, fallback: number): number {
    if (!this.hasBrowserStorage()) {
      return fallback;
    }

    const rawValue = window.localStorage.getItem(key);
    const parsedValue = Number(rawValue);

    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  private writeNumber(key: string, value: number): void {
    if (!this.hasBrowserStorage()) {
      return;
    }

    window.localStorage.setItem(key, String(value));
  }

  private hasBrowserStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }
}
