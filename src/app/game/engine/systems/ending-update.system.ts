import { EngineCallbacks } from '../../../core/models/game/engine-callbacks.model';
import { Boss } from '../../domain/bosses/boss.model';
import { Hero } from '../../domain/hero/hero.model';
import { GameStateService } from '../../services/game-state.service';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export interface EndingTimerUpdateParams {
  runtime: EngineRuntime;
  deltaTime: number;
  callbacks: EngineCallbacks;
}

export interface EndingStateCheckParams {
  runtime: EngineRuntime;
  hero: Hero;
  boss: Boss;
  canvasHeight: number;
  gameState: GameStateService;
  loseLife: () => void;
}

export function updateEndingTimerSystem({
  runtime,
  deltaTime,
  callbacks,
}: EndingTimerUpdateParams): boolean {
  if (!runtime.ending) {
    return false;
  }

  runtime.endingTimer -= deltaTime;

  if (runtime.endingTimer <= 0) {
    if (runtime.ending === 'game-over') {
      callbacks.onGameOver(runtime.score);
    } else {
      callbacks.onVictory(runtime.score);
    }
  }

  return true;
}

export function startEnding(
  runtime: EngineRuntime,
  type: 'game-over' | 'victory',
): void {
  if (runtime.ending) {
    return;
  }

  runtime.ending = type;
  runtime.endingTimer = 1;
}

export function checkEndingConditionsSystem({
  runtime,
  hero,
  boss,
  canvasHeight,
  gameState,
  loseLife,
}: EndingStateCheckParams): void {
  if (hero.y > canvasHeight + 260) {
    loseLife();
  }

  if (runtime.lives <= 0) {
    startEnding(runtime, 'game-over');
    return;
  }

  if (boss.active && boss.hp <= 0) {
    gameState.finalizeCurrentPhaseTime();
    runtime.score += 1200;
    startEnding(runtime, 'victory');
  }
}
