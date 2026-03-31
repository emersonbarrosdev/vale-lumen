import { Injectable } from '@angular/core';
import { GAME_CONFIG } from '../../core/config/game.config';
import { HeroProgressState } from '../../core/models/game/hero-progress-state.model';
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
  currentPhaseId = 'phase-01';
  continuesUsedInCurrentPhase = 0;

  musicVolume: number = GAME_CONFIG.defaultMusicVolume;
  effectsVolume: number = GAME_CONFIG.defaultEffectsVolume;

  heroProgress: HeroProgressState = {
    level: 1,
    maxHp: 100,
    currentHp: 100,
    manaMax: 100,
    manaCurrent: 100,
    manaRegenPerSecond: 10,
    specialGaugeMax: 100,
    specialGaugeCurrent: 0,
    baseAttack: 10,
    magicPower: 10,
    doubleJumpUnlocked: true,
    dashUnlocked: true,
    dashCharges: 1,
    shieldUnlocked: false,
    relicSlots: 0,
    cosmeticsUnlocked: [],
    relicsUnlocked: [],
  };

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
    this.currentPhaseId = 'phase-01';
    this.continuesUsedInCurrentPhase = 0;
    this.heroProgress.currentHp = this.heroProgress.maxHp;
    this.heroProgress.manaCurrent = this.heroProgress.manaMax;
    this.heroProgress.specialGaugeCurrent = 0;
  }

  setCurrentScore(score: number): void {
    this.currentScore = score;
  }

  finishRun(score: number): void {
    this.currentScore = score;
    this.lastScore = score;
  }

  setCurrentPhase(phaseNumber: number, phaseId: string): void {
    this.currentPhase = phaseNumber;
    this.currentPhaseId = phaseId;
    this.continuesUsedInCurrentPhase = 0;
  }

  useContinue(): void {
    this.continuesUsedInCurrentPhase += 1;
    this.heroProgress.currentHp = this.heroProgress.maxHp;
    this.heroProgress.manaCurrent = this.heroProgress.manaMax;
    this.heroProgress.specialGaugeCurrent = 0;
  }

  canContinue(maxContinuesPerPhase: number): boolean {
    return this.continuesUsedInCurrentPhase < maxContinuesPerPhase;
  }

  applyPhaseProgression(phaseNumber: number): void {
    this.heroProgress.level = Math.max(this.heroProgress.level, phaseNumber);

    if (phaseNumber === 2) {
      this.heroProgress.manaRegenPerSecond += 2;
    }

    if (phaseNumber === 4) {
      this.heroProgress.shieldUnlocked = true;
    }

    if (phaseNumber === 5) {
      this.heroProgress.maxHp += 10;
      this.heroProgress.currentHp = this.heroProgress.maxHp;
    }

    if (phaseNumber === 6) {
      this.heroProgress.dashCharges = 2;
    }

    if (phaseNumber === 8) {
      this.heroProgress.magicPower += 4;
    }

    if (phaseNumber === 10) {
      this.heroProgress.maxHp += 10;
      this.heroProgress.currentHp = this.heroProgress.maxHp;
    }

    if (phaseNumber === 11) {
      this.heroProgress.manaRegenPerSecond += 3;
    }

    if (phaseNumber === 12) {
      this.heroProgress.specialGaugeMax = 120;
    }
  }

  saveSettings(musicVolume: number, effectsVolume: number): void {
    this.musicVolume = musicVolume;
    this.effectsVolume = effectsVolume;

    writeStoredNumber('musicVolume', musicVolume);
    writeStoredNumber('effectsVolume', effectsVolume);
  }
}
