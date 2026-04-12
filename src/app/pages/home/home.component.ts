import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AudioService } from '../../game/services/audio.service';
import { PhaseFlowService } from '../../game/services/phase-flow.service';
import {
  SecretCodeDirection,
  SecretCodeService,
} from '../../game/services/secret-code.service';
import { GameStateService } from '../../game/services/game-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  private animationFrameId = 0;
  private selectedIndex = 0;

  private dpadUpConsumed = false;
  private dpadDownConsumed = false;
  private dpadLeftConsumed = false;
  private dpadRightConsumed = false;
  private confirmConsumed = false;
  private menuShortcutConsumed = false;
  private closeConsumed = false;

  optionsOpen = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly router: Router,
    private readonly phaseFlowService: PhaseFlowService,
    private readonly audioService: AudioService,
    private readonly secretCodeService: SecretCodeService,
    private readonly gameState: GameStateService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.ensureSelection();
    this.startGamepadLoop();
    this.audioService.playMusic('menu-theme');
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
  }

  startGame(): void {
    this.phaseFlowService.startNewRun();
    this.audioService.playSfx('ui-confirm');
    this.router.navigateByUrl('/phase-loading');
  }

  goToSettings(): void {
    this.audioService.playSfx('ui-confirm');
    this.router.navigateByUrl('/settings');
  }

  goToCredits(): void {
    this.audioService.playSfx('ui-confirm');
    this.router.navigateByUrl('/credits');
  }

  restartGame(): void {
    this.phaseFlowService.startNewRun();
    this.audioService.playSfx('ui-confirm');
    this.router.navigateByUrl('/phase-loading');
  }

  toggleOptions(): void {
    this.optionsOpen = !this.optionsOpen;
    this.audioService.playSfx('ui-move');
    this.selectedIndex = 0;
    queueMicrotask(() => this.ensureSelection());
  }

  openOptions(): void {
    if (this.optionsOpen) {
      return;
    }

    this.optionsOpen = true;
    this.audioService.playSfx('ui-move');
    this.selectedIndex = 0;
    queueMicrotask(() => this.ensureSelection());
  }

  closeOptions(): void {
    if (!this.optionsOpen) {
      return;
    }

    this.optionsOpen = false;
    this.audioService.playSfx('ui-move');
    this.selectedIndex = 0;
    queueMicrotask(() => this.ensureSelection());
  }

  @HostListener('window:keydown', ['$event'])
  handleWindowKeydown(event: KeyboardEvent): void {
    if (!this.isBrowser) {
      return;
    }

    const key = event.key.toLowerCase();

    if (this.optionsOpen && (key === 'escape' || key === 'backspace')) {
      event.preventDefault();
      this.closeOptions();
      return;
    }

    const direction = this.mapKeyboardDirection(event.key);

    if (!direction) {
      return;
    }

    event.preventDefault();
    this.consumeSecretInput(direction);
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
    const closeActive = this.isButtonPressed(gamepad, 1);
    const menuShortcutActive = this.isMenuShortcutPressed(gamepad);

    if (menuShortcutActive && !this.menuShortcutConsumed) {
      this.menuShortcutConsumed = true;

      if (this.optionsOpen) {
        this.closeOptions();
      } else {
        this.openOptions();
      }

      return;
    } else if (!menuShortcutActive) {
      this.menuShortcutConsumed = false;
    }

    if (this.optionsOpen) {
      if (closeActive && !this.closeConsumed) {
        this.closeConsumed = true;
        this.closeOptions();
        return;
      } else if (!closeActive) {
        this.closeConsumed = false;
      }
    } else {
      this.closeConsumed = false;
    }

    if (upActive && !this.dpadUpConsumed) {
      this.consumeSecretInput('up');
      this.moveSelection(-1);
      this.dpadUpConsumed = true;
    } else if (!upActive) {
      this.dpadUpConsumed = false;
    }

    if (downActive && !this.dpadDownConsumed) {
      this.consumeSecretInput('down');
      this.moveSelection(1);
      this.dpadDownConsumed = true;
    } else if (!downActive) {
      this.dpadDownConsumed = false;
    }

    if (leftActive && !this.dpadLeftConsumed) {
      this.consumeSecretInput('left');
      this.moveSelection(-1);
      this.dpadLeftConsumed = true;
    } else if (!leftActive) {
      this.dpadLeftConsumed = false;
    }

    if (rightActive && !this.dpadRightConsumed) {
      this.consumeSecretInput('right');
      this.moveSelection(1);
      this.dpadRightConsumed = true;
    } else if (!rightActive) {
      this.dpadRightConsumed = false;
    }

    if (confirmActive && !this.confirmConsumed) {
      this.confirmConsumed = true;
      this.activateSelectedItem();
    } else if (!confirmActive) {
      this.confirmConsumed = false;
    }
  }

  private consumeSecretInput(direction: SecretCodeDirection): void {
    const match = this.secretCodeService.pushInput(direction);

    if (!match) {
      return;
    }

    if (match.action === 'unlockFlameHair') {
      this.gameState.enableSecretFlameHair();
      this.audioService.playSfx('ui-confirm');
      return;
    }

    if (match.action === 'jumpToBossPhase' && match.bossPhase === 1) {
      this.gameState.setSecretBossPhaseOverride(1);
      this.audioService.playSfx('ui-confirm');
    }
  }

  private mapKeyboardDirection(key: string): SecretCodeDirection | null {
    const normalized = key.toLowerCase();

    switch (normalized) {
      case 'arrowup':
      case 'w':
        return 'up';

      case 'arrowdown':
      case 's':
        return 'down';

      case 'arrowleft':
      case 'a':
        return 'left';

      case 'arrowright':
      case 'd':
        return 'right';

      default:
        return null;
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
    const selector = this.optionsOpen
      ? '[data-options-item="true"]'
      : '.gear-button, .press-start';

    return Array.from(
      root.querySelectorAll<HTMLElement>(selector),
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

  private isMenuShortcutPressed(gamepad: Gamepad): boolean {
    const gamepadId = gamepad.id.toLowerCase();

    if (this.isPlayStationGamepad(gamepadId)) {
      return (
        this.isButtonPressed(gamepad, 17) ||
        this.isButtonPressed(gamepad, 8)
      );
    }

    if (this.isXboxGamepad(gamepadId)) {
      return this.isButtonPressed(gamepad, 3);
    }

    return false;
  }

  private isPlayStationGamepad(gamepadId: string): boolean {
    return (
      gamepadId.includes('dualsense') ||
      gamepadId.includes('dualshock') ||
      gamepadId.includes('playstation') ||
      gamepadId.includes('wireless controller') ||
      gamepadId.includes('sony')
    );
  }

  private isXboxGamepad(gamepadId: string): boolean {
    return gamepadId.includes('xbox');
  }

  private resetConsumptions(): void {
    this.dpadUpConsumed = false;
    this.dpadDownConsumed = false;
    this.dpadLeftConsumed = false;
    this.dpadRightConsumed = false;
    this.confirmConsumed = false;
    this.menuShortcutConsumed = false;
    this.closeConsumed = false;
  }
}
