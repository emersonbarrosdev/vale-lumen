import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStateService } from '../../game/services/game-state.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss',
})
export class GameOverComponent {
  constructor(public readonly gameState: GameStateService) {}
}
