// src/app/pages/phase-clear/phase-clear.component.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
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
export class PhaseClearComponent implements OnInit, OnDestroy {
  readonly result = this.phaseFlowService.getLastPhaseResult();

  private readonly isBrowser: boolean;
  private timeoutId: number | null = null;
  private animationFrameId = 0;
  private confirmConsumed = false;
  private advancing = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly router: Router,
    private readonly phaseFlowService: PhaseFlowService,
    private readonly audioService: AudioService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.audioService.playSfx('phase-clear');
    this.audioService.playMusic('phase-clear-theme');

    this.timeoutId = window.setTimeout(() => {
      this.goToNextPhase();
    }, PHASE_CONFIG.phaseClearAutoAdvanceMs);

    if (this.isBrowser) {
      this.startGamepadLoop();
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.isBrowser) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private startGamepadLoop(): void {
    const tick = (): void => {
      this.pollGamepadInput();
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private pollGamepadInput(): void {
    const gamepad = this.getActiveGamepad();

    if (!gamepad) {
      this.confirmConsumed = false;
      return;
    }

    const confirmActive =
      this.isButtonPressed(gamepad, 2) ||
      this.isButtonPressed(gamepad, 9);

    if (confirmActive && !this.confirmConsumed) {
      this.confirmConsumed = true;
      this.audioService.playSfx('ui-confirm');
      this.goToNextPhase();
    } else if (!confirmActive) {
      this.confirmConsumed = false;
    }
  }

  private goToNextPhase(): void {
    if (this.advancing) {
      return;
    }

    this.advancing = true;

    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.router.navigateByUrl('/phase-loading');
  }

  private getActiveGamepad(): Gamepad | null {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
      return null;
    }

    for (const gamepad of navigator.getGamepads()) {
      if (gamepad?.connected) {
        return gamepad;
      }
    }

    return null;
  }

  private isButtonPressed(gamepad: Gamepad, buttonIndex: number): boolean {
    const button = gamepad.buttons[buttonIndex];
    return !!button && (button.pressed || button.value >= 0.5);
  }
}
