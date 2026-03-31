import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BossDialogService } from './../../../services/boss-dialog.service';

@Component({
  selector: 'app-boss-dialog-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boss-dialog-overlay.component.html',
  styleUrl: './boss-dialog-overlay.component.scss',
})
export class BossDialogOverlayComponent {
  readonly dialog$ = this.bossDialogService.dialog$;

  constructor(private readonly bossDialogService: BossDialogService) {}
}
