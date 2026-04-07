import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStateService } from '../../game/services/game-state.service';

@Component({
  selector: 'app-victory',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './victory.component.html',
  styleUrl: './victory.component.scss',
})
export class VictoryComponent {
  constructor(public readonly gameState: GameStateService) {}

  get finalRunTime(): string {
    return this.gameState.getFormattedLastRunTime();
  }

  get finalPhaseTime(): string {
    return this.gameState.getFormattedLastPhaseTime();
  }

  get baseTotalBeforeCoins(): number {
    return this.gameState.lastBaseScore + this.gameState.lastHpBonus;
  }
}
