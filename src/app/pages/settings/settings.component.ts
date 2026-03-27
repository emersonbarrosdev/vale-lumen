import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GameStateService } from '../../game/services/game-state.service';

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

  saved = false;

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
    this.saved = true;

    setTimeout(() => {
      this.saved = false;
    }, 1500);
  }
}
