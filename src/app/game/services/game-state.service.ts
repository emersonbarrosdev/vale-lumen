import { Injectable } from '@angular/core';
import { GAME_CONFIG } from '../../core/config/game.config';
import { INPUT_CONFIG } from '../../core/config/input.config';
import { HeroProgressState } from '../../core/models/game/hero-progress-state.model';
import { GameRunState } from '../../core/models/game/game-run-state.model';
import {
  GameSettings,
  LastInputDevice,
} from '../../core/models/game/game-settings.model';
import {
  hasBrowserStorage,
  readStoredBoolean,
  readStoredNumber,
  readStoredString,
  removeStoredValue,
  writeStoredBoolean,
  writeStoredNumber,
  writeStoredString,
} from '../../core/utils/storage.util';

export interface GameControlBinding {
  label: string;
  primary: string;
  secondary?: string;
  gamepad?: string;
  touch?: string;
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

  currentCoins = 0;
  lastCoins = 0;
  lastBaseScore = 0;
  lastHpBonus = 0;
  lastCoinMultiplier = 1;

  musicVolume: number = GAME_CONFIG.defaultMusicVolume;
  effectsVolume: number = GAME_CONFIG.defaultEffectsVolume;

  showTouchControls = true;
  touchControlLayout = 'default';
  gamepadDeadzone = INPUT_CONFIG.gamepadDeadzone;
  lastInputDevice: LastInputDevice = 'keyboard';

  currentPhaseElapsedMs = 0;
  lastPhaseElapsedMs = 0;
  totalRunElapsedMs = 0;
  lastRunElapsedMs = 0;

  secretFlameHairEnabled = false;
  secretBossPhaseOverride: number | null = null;

  readonly phaseTimeLimitMs = 10 * 60 * 1000;
  readonly phaseTimeWarningMs = 9 * 60 * 1000;

  readonly controls: GameControlBinding[] = [
    {
      label: 'Olhar para cima',
      primary: 'E',
      gamepad: 'Direcional ↑ / Analógico ↑',
      touch: 'Botão UP',
      description: 'Muda a mira para cima.',
    },
    {
      label: 'Mover para a esquerda',
      primary: 'A',
      gamepad: 'Direcional ← / Analógico ←',
      touch: 'Botão ◀',
      description: 'Move o herói para a esquerda.',
    },
    {
      label: 'Mover para a direita',
      primary: 'D',
      gamepad: 'Direcional → / Analógico →',
      touch: 'Botão ▶',
      description: 'Move o herói para a direita.',
    },
    {
      label: 'Agachar',
      primary: 'S',
      secondary: '↓',
      gamepad: 'Direcional ↓ / Analógico ↓',
      touch: 'Botão DOWN',
      description: 'Faz o herói agachar no chão e permite atirar agachado.',
    },
    {
      label: 'Pular',
      primary: 'W / Espaço',
      gamepad: 'X (PS5) / A (Xbox)',
      touch: 'Botão JUMP',
      description: 'Executa o salto do herói.',
    },
    {
      label: 'Atirar',
      primary: 'J',
      gamepad: 'Quadrado (PS5) / X (Xbox)',
      touch: 'Botão ATK',
      description: 'Dispara o tiro principal.',
    },
    {
      label: 'Especial',
      primary: 'L',
      gamepad: 'Bola (PS5) / B (Xbox)',
      touch: 'Botão SP',
      description: 'Ativa o especial quando houver carga suficiente.',
    },
    {
      label: 'Super especial',
      primary: 'J + L',
      gamepad: 'Bola + Triângulo (PS5) / B + Y (Xbox)',
      touch: 'Combinação especial',
      description: 'Ativa o super especial quando a barra estiver completa.',
    },
    {
      label: 'Pausa',
      primary: 'ESC',
      gamepad: 'Start / Options',
      touch: 'Botão II',
      description: 'Pausa e retoma a partida.',
    },
    {
      label: 'Menus',
      primary: 'Enter',
      secondary: 'Setas',
      gamepad: 'Quadrado/X para confirmar, direcional/analógico para navegar',
      touch: 'Toque',
      description: 'Navega entre opções e confirma ações nas telas do jogo.',
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
    weakFlameCoreUnlocked: false,
    simpleChargedShotUnlocked: false,
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

    this.showTouchControls = readStoredBoolean('showTouchControls', true);
    this.touchControlLayout = readStoredString('touchControlLayout', 'default');
    this.gamepadDeadzone = readStoredNumber(
      'gamepadDeadzone',
      INPUT_CONFIG.gamepadDeadzone,
    );
    this.lastInputDevice = readStoredString(
      'lastInputDevice',
      'keyboard',
    ) as LastInputDevice;

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
      showTouchControls: this.showTouchControls,
      touchControlLayout: this.touchControlLayout,
      gamepadDeadzone: this.gamepadDeadzone,
      lastInputDevice: this.lastInputDevice,
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
    this.currentCoins = 0;
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

  clearSecretSelections(): void {
    this.secretFlameHairEnabled = false;
    this.secretBossPhaseOverride = null;
  }

  enableSecretFlameHair(): void {
    this.secretFlameHairEnabled = true;
  }

  setSecretBossPhaseOverride(phase: number | null): void {
    this.secretBossPhaseOverride =
      typeof phase === 'number' && phase > 0 ? Math.floor(phase) : null;
  }

  setCurrentScore(score: number): void {
    this.currentScore = score;
  }

  setCurrentCoins(coins: number): void {
    this.currentCoins = Math.max(0, Math.floor(coins));
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

  finishRun(
    score: number,
    metadata?: {
      coins?: number;
      baseScore?: number;
      hpBonus?: number;
      coinMultiplier?: number;
    },
  ): void {
    this.currentScore = score;
    this.lastScore = score;
    this.lastRunElapsedMs = this.totalRunElapsedMs;

    this.lastCoins = Math.max(0, Math.floor(metadata?.coins ?? this.currentCoins));
    this.lastBaseScore = Math.max(0, Math.floor(metadata?.baseScore ?? score));
    this.lastHpBonus = Math.max(0, Math.floor(metadata?.hpBonus ?? 0));
    this.lastCoinMultiplier = Math.max(
      1,
      Math.floor(metadata?.coinMultiplier ?? (this.lastCoins || 1)),
    );

    writeStoredNumber('lastRunElapsedMs', this.lastRunElapsedMs);
  }

  setCurrentPhase(phaseNumber: number, phaseId: string): void {
    this.currentPhase = phaseNumber;
    this.currentPhaseId = phaseId;
    this.continuesUsedInCurrentPhase = 0;
    this.currentPhaseElapsedMs = 0;
    this.currentCoins = 0;
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

    /**
     * Regras:
     * - concluiu a fase 1 -> entra na fase 2 com o Núcleo da Chama Fraca
     * - upgrades de uma fase sempre valem para a próxima
     */
    if (phaseNumber === 1) {
      this.heroProgress.weakFlameCoreUnlocked = true;
      this.heroProgress.simpleChargedShotUnlocked = true;
    }

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

  saveTouchControlsPreference(visible: boolean): void {
    this.showTouchControls = visible;
    writeStoredBoolean('showTouchControls', visible);
  }

  saveTouchControlLayout(layoutId: string): void {
    this.touchControlLayout = layoutId;
    writeStoredString('touchControlLayout', layoutId);
  }

  saveGamepadDeadzone(deadzone: number): void {
    this.gamepadDeadzone = deadzone;
    writeStoredNumber('gamepadDeadzone', deadzone);
  }

  saveLastInputDevice(device: LastInputDevice): void {
    if (this.lastInputDevice === device) {
      return;
    }

    this.lastInputDevice = device;
    writeStoredString('lastInputDevice', device);
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

    removeStoredValue('lastRunElapsedMs');
    removeStoredValue('lastPhaseElapsedMs');
  }
}
