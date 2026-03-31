import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AudioService } from '../../game/services/audio.service';
import { PhaseFlowService } from '../../game/services/phase-flow.service';

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
    private readonly phaseFlowService: PhaseFlowService,
    private readonly audioService: AudioService,
  ) {}

  startGame(): void {
    this.phaseFlowService.startNewRun();
    this.audioService.playSfx('ui-confirm');
    this.router.navigateByUrl('/phase-loading');
  }
}
