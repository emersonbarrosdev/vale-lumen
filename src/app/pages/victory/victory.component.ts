import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GameStateService } from '../../game/services/game-state.service';
import { AudioService } from '../../game/services/audio.service';

@Component({
  selector: 'app-victory',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './victory.component.html',
  styleUrl: './victory.component.scss',
})
export class VictoryComponent implements AfterViewInit, OnDestroy {
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
    private readonly audioService: AudioService,
    public readonly gameState: GameStateService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get finalRunTime(): string {
    return this.gameState.getFormattedLastRunTime();
  }

  get finalPhaseTime(): string {
    return this.gameState.getFormattedLastPhaseTime();
  }

  get baseTotalBeforeCoins(): number {
    return this.gameState.lastBaseScore + this.gameState.lastHpBonus;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.ensureSelection();
    this.startGamepadLoop();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
  }

  private startGamepadLoop(): void {
    const tick = (): void => {
      this.pollGamepadMenuInput();
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private pollGamepadMenuInput(): void {
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
      this.moveSelection(-1);
      this.leftConsumed = true;
    } else if (!leftActive) {
      this.leftConsumed = false;
    }

    if (rightActive && !this.rightConsumed) {
      this.moveSelection(1);
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
    const items = this.getFocusableMenuItems();

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
    this.audioService.playSfx('ui-move');
  }

  private activateSelectedItem(): void {
    const items = this.getFocusableMenuItems();

    if (!items.length) {
      return;
    }

    const selected = items[this.selectedIndex] ?? items[0];
    this.focusSelectedItem(items);
    this.audioService.playSfx('ui-confirm');
    selected.click();
  }

  private ensureSelection(): void {
    const items = this.getFocusableMenuItems();

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

  private getFocusableMenuItems(): HTMLElement[] {
    const root = this.elementRef.nativeElement;

    return Array.from(
      root.querySelectorAll<HTMLElement>('button, a[href]'),
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
}
