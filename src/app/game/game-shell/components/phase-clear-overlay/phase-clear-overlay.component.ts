import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PhaseResult } from '../../../../core/models/game/phase-result.model';

@Component({
  selector: 'app-phase-clear-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './phase-clear-overlay.component.html',
  styleUrl: './phase-clear-overlay.component.scss',
})
export class PhaseClearOverlayComponent {
  @Input() result: PhaseResult | null = null;
}
