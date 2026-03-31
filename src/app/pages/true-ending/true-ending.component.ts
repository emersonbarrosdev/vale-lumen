import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../game/services/audio.service';
import { GameStateService } from '../../game/services/game-state.service';

@Component({
  selector: 'app-true-ending',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './true-ending.component.html',
  styleUrl: './true-ending.component.scss',
})
export class TrueEndingComponent implements OnInit {
  constructor(
    public readonly gameState: GameStateService,
    private readonly audioService: AudioService,
  ) {}

  ngOnInit(): void {
    this.audioService.playMusic('true-ending-theme');
  }
}
