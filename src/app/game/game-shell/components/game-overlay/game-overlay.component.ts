import { Component } from '@angular/core';
import { BossDialogOverlayComponent } from '../boss-dialog-overlay/boss-dialog-overlay.component';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-game-overlay',
  standalone: true,
  imports: [BossDialogOverlayComponent, LoadingOverlayComponent],
  templateUrl: './game-overlay.component.html',
  styleUrl: './game-overlay.component.scss',
})
export class GameOverlayComponent {}
