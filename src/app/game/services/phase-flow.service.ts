import { Injectable } from '@angular/core';
import { PHASE_CONFIG } from '../../core/config/phase.config';
import { PhaseResult } from '../../core/models/game/phase-result.model';
import {
  getNextPhaseDefinition,
  PHASE_REGISTRY,
} from '../content/phases/registry/phase-definition.registry';
import { PhaseDefinition } from '../domain/world/phase-definition.model';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root',
})
export class PhaseFlowService {
  private lastPhaseResult: PhaseResult | null = null;

  constructor(private readonly gameState: GameStateService) {}

  startNewRun(): PhaseDefinition {
    this.gameState.resetRun();
    return PHASE_REGISTRY[0];
  }

  getCurrentPhaseDefinition(): PhaseDefinition {
    return (
      PHASE_REGISTRY.find(
        (phase: PhaseDefinition) => phase.id === this.gameState.currentPhaseId,
      ) ?? PHASE_REGISTRY[0]
    );
  }

  getLastPhaseResult(): PhaseResult | null {
    return this.lastPhaseResult;
  }

  registerDeath(score: number): boolean {
    this.gameState.finalizeCurrentPhaseTime();
    this.gameState.finishRun(score, {
      coins: this.gameState.currentCoins,
      baseScore: score,
      hpBonus: 0,
      coinMultiplier: 1,
    });

    if (this.gameState.canContinue(PHASE_CONFIG.maxContinuesPerPhase)) {
      this.gameState.useContinue();
      return true;
    }

    return false;
  }

  completeCurrentPhase(
    score: number,
    coins = 0,
    sparks = 0,
    timeMs = 0,
  ): { nextPhase: PhaseDefinition | null; finishedGame: boolean } {
    const currentPhase = this.getCurrentPhaseDefinition();
    const resolvedTimeMs =
      timeMs > 0 ? timeMs : this.gameState.currentPhaseElapsedMs;

    this.gameState.finalizeCurrentPhaseTime();

    const bonusHp = Math.floor(this.gameState.heroProgress.currentHp * 0.5);
    const baseTotal = score + bonusHp;
    const coinMultiplier = Math.max(1, coins);
    const finalTotal = baseTotal * coinMultiplier;

    this.lastPhaseResult = {
      phaseId: currentPhase.id,
      phaseTitle: currentPhase.title,
      score,
      coins,
      sparks,
      timeMs: resolvedTimeMs,
      formattedTime: this.gameState.formatTime(resolvedTimeMs),
      bonusHp,
      totalScore: finalTotal,
      clearedAt: Date.now(),
    };

    this.gameState.finishRun(finalTotal, {
      coins,
      baseScore: score,
      hpBonus: bonusHp,
      coinMultiplier,
    });

    this.gameState.applyPhaseProgression(currentPhase.order);

    const nextPhase = getNextPhaseDefinition(currentPhase.id);

    if (!nextPhase) {
      return {
        nextPhase: null,
        finishedGame: true,
      };
    }

    this.gameState.setCurrentPhase(nextPhase.order, nextPhase.id);

    return {
      nextPhase,
      finishedGame: false,
    };
  }
}
