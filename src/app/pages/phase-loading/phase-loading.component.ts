import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PHASE_CONFIG } from '../../core/config/phase.config';
import { PhaseFlowService } from '../../game/services/phase-flow.service';
import { AudioService } from '../../game/services/audio.service';

@Component({
  selector: 'app-phase-loading',
  standalone: true,
  templateUrl: './phase-loading.component.html',
  styleUrl: './phase-loading.component.scss',
})
export class PhaseLoadingComponent implements OnInit {
  readonly phase = this.phaseFlowService.getCurrentPhaseDefinition();

  constructor(
    private readonly router: Router,
    private readonly phaseFlowService: PhaseFlowService,
    private readonly audioService: AudioService,
  ) {}

  ngOnInit(): void {
    this.audioService.playSfx('loading-transition');

    setTimeout(() => {
      this.router.navigateByUrl('/game');
    }, PHASE_CONFIG.loadingScreenDelayMs);
  }
}
