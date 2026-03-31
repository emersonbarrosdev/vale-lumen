import { Component } from '@angular/core';
import { GameCanvasComponent } from '../../game/game-shell/components/game-canvas/game-canvas.component';
import { GameOverlayComponent } from '../../game/game-shell/components/game-overlay/game-overlay.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [GameCanvasComponent, GameOverlayComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {}
