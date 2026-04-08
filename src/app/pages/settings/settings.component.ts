import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  GameControlBinding,
  GameStateService,
} from '../../game/services/game-state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly form = new FormGroup({
    musicVolume: new FormControl(70, { nonNullable: true }),
    effectsVolume: new FormControl(80, { nonNullable: true }),
  });

  readonly controls: GameControlBinding[] = this.gameState.controls;

  saved = false;
  private saveFeedbackTimeoutId: number | null = null;

  private readonly isBrowser: boolean;
  private animationFrameId = 0;
  private selectedIndex = 0;

  private upConsumed = false;
  private downConsumed = false;
  private leftConsumed = false;
  private rightConsumed = false;
  private confirmConsumed = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly gameState: GameStateService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.form.patchValue({
      musicVolume: this.gameState.musicVolume,
      effectsVolume: this.gameState.effectsVolume,
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.ensureSelection();
    this.startGamepadLoop();
  }

  ngOnDestroy(): void {
    if (this.saveFeedbackTimeoutId !== null) {
      window.clearTimeout(this.saveFeedbackTimeoutId);
    }

    if (!this.isBrowser) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
  }

  save(): void {
    const { musicVolume, effectsVolume } = this.form.getRawValue();
    this.gameState.saveSettings(musicVolume, effectsVolume);
    this.showSavedFeedback();
  }

  trackByControlLabel(_: number, item: GameControlBinding): string {
    return item.label;
  }

  private startGamepadLoop(): void {
    const tick = (): void => {
      this.pollGamepadSettingsInput();
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private pollGamepadSettingsInput(): void {
    const gamepad = this.getActiveGamepad();

    if (!gamepad) {
      this.resetConsumptions();
      return;
    }

    const axisX = gamepad.axes[0] ?? 0;
    const axisY = gamepad.axes[1] ?? 0;

    const upActive = this.isButtonPressed(gamepad, 12) || axisY <= -0.6;
    const downActive = this.isButtonPressed(gamepad, 13) || axisY >= 0.6;
    const leftActive = this.isButtonPressed(gamepad, 14) || axisX <= -0.6;
    const rightActive = this.isButtonPressed(gamepad, 15) || axisX >= 0.6;
    const confirmActive = this.isButtonPressed(gamepad, 2) || this.isButtonPressed(gamepad, 9);

    if (upActive && !this.upConsumed) {
      this.moveSelection(-1);
      this.upConsumed = true;
    } else if (!upActive) {
      this.upConsumed = false;
    }

    if (downActive && !this.downConsumed) {
      this.moveSelection(1);
      this.downConsumed = true;
    } else if (!downActive) {
      this.downConsumed = false;
    }

    if (leftActive && !this.leftConsumed) {
      if (!this.adjustFocusedRange(-5)) {
        this.moveSelection(-1);
      }
      this.leftConsumed = true;
    } else if (!leftActive) {
      this.leftConsumed = false;
    }

    if (rightActive && !this.rightConsumed) {
      if (!this.adjustFocusedRange(5)) {
        this.moveSelection(1);
      }
      this.rightConsumed = true;
    } else if (!rightActive) {
      this.rightConsumed = false;
    }

    if (confirmActive && !this.confirmConsumed) {
      this.confirmConsumed = true;
      this.activateSelectedItem();
    } else if (!confirmActive) {
      this.confirmConsumed = false;
    }
  }

  private moveSelection(step: -1 | 1): void {
    const items = this.getFocusableItems();

    if (!items.length) {
      return;
    }

    this.selectedIndex += step;

    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    }

    if (this.selectedIndex > items.length - 1) {
      this.selectedIndex = items.length - 1;
    }

    this.focusSelectedItem(items);
  }

  private activateSelectedItem(): void {
    const items = this.getFocusableItems();

    if (!items.length) {
      return;
    }

    const selected = items[this.selectedIndex] ?? items[0];
    this.focusSelectedItem(items);

    if (selected instanceof HTMLInputElement) {
      selected.focus({ preventScroll: true });
      return;
    }

    selected.click();
  }

  private adjustFocusedRange(delta: number): boolean {
    const items = this.getFocusableItems();
    const selected = items[this.selectedIndex];

    if (!(selected instanceof HTMLInputElement) || selected.type !== 'range') {
      return false;
    }

    const min = Number(selected.min || 0);
    const max = Number(selected.max || 100);
    const current = Number(selected.value || 0);
    const next = Math.min(max, Math.max(min, current + delta));

    if (next === current) {
      return true;
    }

    selected.value = String(next);
    selected.dispatchEvent(new Event('input', { bubbles: true }));
    selected.dispatchEvent(new Event('change', { bubbles: true }));
    selected.focus({ preventScroll: true });

    return true;
  }

  private ensureSelection(): void {
    const items = this.getFocusableItems();

    if (!items.length) {
      return;
    }

    this.selectedIndex = 0;
    this.focusSelectedItem(items);
  }

  private focusSelectedItem(items: HTMLElement[]): void {
    const selected = items[this.selectedIndex] ?? items[0];

    for (const item of items) {
      item.removeAttribute('data-gamepad-selected');
    }

    selected.setAttribute('data-gamepad-selected', 'true');
    selected.focus({ preventScroll: true });
  }

  private getFocusableItems(): HTMLElement[] {
    const root = this.elementRef.nativeElement;

    return Array.from(
      root.querySelectorAll<HTMLElement>('input, button, a[href]'),
    ).filter((element) => !element.hasAttribute('disabled'));
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

  private resetConsumptions(): void {
    this.upConsumed = false;
    this.downConsumed = false;
    this.leftConsumed = false;
    this.rightConsumed = false;
    this.confirmConsumed = false;
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
