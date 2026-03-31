import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingOverlayService } from '../../../services/loading-overlay.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss',
})
export class LoadingOverlayComponent {
  readonly state$ = this.loadingOverlayService.state$;

  constructor(private readonly loadingOverlayService: LoadingOverlayService) {}
}
