import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PHASE_CONFIG } from '../../core/config/phase.config';
import { PhaseClearOverlayComponent } from '../../game/game-shell/components/phase-clear-overlay/phase-clear-overlay.component';
import { AudioService } from '../../game/services/audio.service';
import { PhaseFlowService } from '../../game/services/phase-flow.service';

@Component({
  selector: 'app-phase-clear',
  standalone: true,
  imports: [CommonModule, PhaseClearOverlayComponent],
  templateUrl: './phase-clear.component.html',
  styleUrl: './phase-clear.component.scss',
})
export class PhaseClearComponent implements OnInit {
  readonly result = this.phaseFlowService.getLastPhaseResult();

  constructor(
    private readonly router: Router,
    private readonly phaseFlowService: PhaseFlowService,
    private readonly audioService: AudioService,
  ) {}

  ngOnInit(): void {
    this.audioService.playSfx('phase-clear');
    this.audioService.playMusic('phase-clear-theme');

    setTimeout(() => {
      this.router.navigateByUrl('/phase-loading');
    }, PHASE_CONFIG.phaseClearAutoAdvanceMs);
  }
}
