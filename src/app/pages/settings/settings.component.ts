import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  GameControlBinding,
  GameStateService,
} from '../../game/services/game-state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  readonly form = new FormGroup({
    musicVolume: new FormControl(70, { nonNullable: true }),
    effectsVolume: new FormControl(80, { nonNullable: true }),
  });

  readonly controls: GameControlBinding[] = this.gameState.controls;

  saved = false;
  private saveFeedbackTimeoutId: number | null = null;

  constructor(private readonly gameState: GameStateService) {}

  ngOnInit(): void {
    this.form.patchValue({
      musicVolume: this.gameState.musicVolume,
      effectsVolume: this.gameState.effectsVolume,
    });
  }

  save(): void {
    const { musicVolume, effectsVolume } = this.form.getRawValue();
    this.gameState.saveSettings(musicVolume, effectsVolume);
    this.showSavedFeedback();
  }

  trackByControlLabel(_: number, item: GameControlBinding): string {
    return item.label;
  }

  private showSavedFeedback(): void {
    this.saved = true;

    if (this.saveFeedbackTimeoutId !== null) {
      window.clearTimeout(this.saveFeedbackTimeoutId);
    }

    this.saveFeedbackTimeoutId = window.setTimeout(() => {
      this.saved = false;
      this.saveFeedbackTimeoutId = null;
    }, 1500);
  }
}
