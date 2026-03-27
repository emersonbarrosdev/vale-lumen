import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameStateService } from '../../game/services/game-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(
    private readonly router: Router,
    private readonly gameState: GameStateService,
  ) {}

  startGame(): void {
    this.gameState.resetRun();
    this.router.navigateByUrl('/game');
  }
}
