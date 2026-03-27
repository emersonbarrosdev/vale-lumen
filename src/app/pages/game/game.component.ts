import { Component } from '@angular/core';
import { GameCanvasComponent } from '../../game/ui/game-canvas/game-canvas.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [GameCanvasComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {}
