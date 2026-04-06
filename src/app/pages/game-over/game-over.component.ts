import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../game/services/game-state.service';
import { PhaseFlowService } from '../../game/services/phase-flow.service';
import { PHASE_CONFIG } from '../../core/config/phase.config';

@Component({
  selector: 'app-game-over',
  standalone: true,
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss',
})
export class GameOverComponent {
  constructor(
    public readonly gameState: GameStateService,
    private readonly router: Router,
    private readonly phaseFlowService: PhaseFlowService,
  ) {}

  get canContinue(): boolean {
    return this.gameState.canContinue(PHASE_CONFIG.maxContinuesPerPhase);
  }

  get lastRunTime(): string {
    return this.gameState.getFormattedLastRunTime();
  }

  get lastPhaseTime(): string {
    return this.gameState.getFormattedLastPhaseTime();
  }

  continuePhase(): void {
    this.router.navigateByUrl('/phase-loading');
  }

  goToMenu(): void {
    this.router.navigateByUrl('/');
  }

  restartFromBeginning(): void {
    this.phaseFlowService.startNewRun();
    this.router.navigateByUrl('/phase-loading');
  }
}
