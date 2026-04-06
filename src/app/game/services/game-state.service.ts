import { Injectable } from '@angular/core';
import { GAME_CONFIG } from '../../core/config/game.config';
import { HeroProgressState } from '../../core/models/game/hero-progress-state.model';
import { GameRunState } from '../../core/models/game/game-run-state.model';
import { GameSettings } from '../../core/models/game/game-settings.model';
import {
  hasBrowserStorage,
  readStoredNumber,
  writeStoredNumber,
} from '../../core/utils/storage.util';

export interface GameControlBinding {
  label: string;
  primary: string;
  secondary?: string;
  description: string;
}

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

  currentPhaseElapsedMs = 0;
  lastPhaseElapsedMs = 0;
  totalRunElapsedMs = 0;
  lastRunElapsedMs = 0;

  readonly phaseTimeLimitMs = 10 * 60 * 1000;
  readonly phaseTimeWarningMs = 9 * 60 * 1000;

  readonly controls: GameControlBinding[] = [
    {
      label: 'Mover',
      primary: 'A / D',
      secondary: '← / →',
      description: 'Move o herói para a esquerda e para a direita.',
    },
    {
      label: 'Pular',
      primary: 'Espaço',
      secondary: 'W / ↑',
      description: 'Salto principal. Também permite o segundo pulo no ar.',
    },
    {
      label: 'Atirar magia',
      primary: 'J',
      description: 'Dispara magia para frente ou para cima.',
    },
    {
      label: 'Especial',
      primary: 'L',
      description: 'Ativa o especial quando a carga estiver completa.',
    },
    {
      label: 'Dash',
      primary: 'K',
      description: 'Avanço rápido para atravessar trechos perigosos.',
    },
    {
      label: 'Pausa',
      primary: 'ESC',
      description: 'Pausa e retoma a partida.',
    },
  ];

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

    this.lastRunElapsedMs = readStoredNumber('lastRunElapsedMs', 0);
    this.lastPhaseElapsedMs = readStoredNumber('lastPhaseElapsedMs', 0);
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

  get isPhaseTimeInWarning(): boolean {
    return this.currentPhaseElapsedMs >= this.phaseTimeWarningMs;
  }

  get isPhaseTimeExceeded(): boolean {
    return this.currentPhaseElapsedMs >= this.phaseTimeLimitMs;
  }

  get remainingPhaseTimeMs(): number {
    return Math.max(0, this.phaseTimeLimitMs - this.currentPhaseElapsedMs);
  }

  resetRun(): void {
    this.currentScore = 0;
    this.currentPhase = 1;
    this.currentPhaseId = 'phase-01';
    this.continuesUsedInCurrentPhase = 0;

    this.currentPhaseElapsedMs = 0;
    this.lastPhaseElapsedMs = 0;
    this.totalRunElapsedMs = 0;

    this.heroProgress.currentHp = this.heroProgress.maxHp;
    this.heroProgress.manaCurrent = this.heroProgress.manaMax;
    this.heroProgress.specialGaugeCurrent = 0;
  }

  setCurrentScore(score: number): void {
    this.currentScore = score;
  }

  addPhaseElapsedTime(deltaMs: number): void {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
      return;
    }

    this.currentPhaseElapsedMs += deltaMs;
    this.totalRunElapsedMs += deltaMs;
  }

  resetCurrentPhaseTimer(): void {
    this.currentPhaseElapsedMs = 0;
  }

  finalizeCurrentPhaseTime(): void {
    this.lastPhaseElapsedMs = this.currentPhaseElapsedMs;
    writeStoredNumber('lastPhaseElapsedMs', this.lastPhaseElapsedMs);
  }

  finishRun(score: number): void {
    this.currentScore = score;
    this.lastScore = score;
    this.lastRunElapsedMs = this.totalRunElapsedMs;

    writeStoredNumber('lastRunElapsedMs', this.lastRunElapsedMs);
  }

  setCurrentPhase(phaseNumber: number, phaseId: string): void {
    this.currentPhase = phaseNumber;
    this.currentPhaseId = phaseId;
    this.continuesUsedInCurrentPhase = 0;
    this.currentPhaseElapsedMs = 0;
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

  formatTime(ms: number): string {
    const safeMs = Math.max(0, Math.floor(ms));
    const totalSeconds = Math.floor(safeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  getFormattedCurrentPhaseTime(): string {
    return this.formatTime(this.currentPhaseElapsedMs);
  }

  getFormattedLastPhaseTime(): string {
    return this.formatTime(this.lastPhaseElapsedMs);
  }

  getFormattedLastRunTime(): string {
    return this.formatTime(this.lastRunElapsedMs);
  }

  clearStoredProgressTimes(): void {
    this.lastRunElapsedMs = 0;
    this.lastPhaseElapsedMs = 0;

    if (!hasBrowserStorage()) {
      return;
    }

    window.localStorage.removeItem('lastRunElapsedMs');
    window.localStorage.removeItem('lastPhaseElapsedMs');
  }
}
