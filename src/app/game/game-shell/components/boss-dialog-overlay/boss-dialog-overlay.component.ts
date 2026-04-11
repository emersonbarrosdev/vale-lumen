import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { BossDialogService } from './../../../services/boss-dialog.service';

@Component({
  selector: 'app-boss-dialog-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boss-dialog-overlay.component.html',
  styleUrl: './boss-dialog-overlay.component.scss',
})
export class BossDialogOverlayComponent implements OnInit, OnDestroy {
  readonly dialog$ = this.bossDialogService.dialog$;

  private readonly isBrowser: boolean;
  private dialogSubscription?: Subscription;
  private animationFrameId = 0;
  private acceptInputAt = 0;
  private confirmConsumed = false;
  private cancelConsumed = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly bossDialogService: BossDialogService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.dialogSubscription = this.dialog$.subscribe((dialog) => {
      if (!this.isBrowser) {
        return;
      }

      if (dialog) {
        this.armInputDelay();
        this.startGamepadLoop();
        return;
      }

      this.stopGamepadLoop();
      this.resetConsumptions();
    });
  }

  ngOnDestroy(): void {
    this.dialogSubscription?.unsubscribe();
    this.stopGamepadLoop();
  }

  close(): void {
    this.bossDialogService.close();
  }

  continueBattle(): void {
    this.bossDialogService.close();
  }

  @HostListener('window:keydown', ['$event'])
  handleWindowKeydown(event: KeyboardEvent): void {
    if (!this.bossDialogService.isOpen || !this.isBrowser || !this.canAcceptInput()) {
      return;
    }

    const ignoredKeys = ['shift', 'control', 'alt', 'meta', 'tab'];

    if (ignoredKeys.includes(event.key.toLowerCase())) {
      return;
    }

    event.preventDefault();
    this.continueBattle();
  }

  private armInputDelay(): void {
    this.acceptInputAt = performance.now() + 220;
    this.resetConsumptions();
  }

  private canAcceptInput(): boolean {
    return performance.now() >= this.acceptInputAt;
  }

  private startGamepadLoop(): void {
    if (this.animationFrameId) {
      return;
    }

    const tick = (): void => {
      this.pollGamepadCloseInput();
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopGamepadLoop(): void {
    if (!this.animationFrameId) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
  }

  private pollGamepadCloseInput(): void {
    if (!this.bossDialogService.isOpen) {
      return;
    }

    const gamepad = this.getActiveGamepad();

    if (!gamepad) {
      this.resetConsumptions();
      return;
    }

    const axisX = gamepad.axes[0] ?? 0;
    const axisY = gamepad.axes[1] ?? 0;

    const confirmActive =
      this.isAnyFaceButtonPressed(gamepad) ||
      this.isButtonPressed(gamepad, 9) ||
      this.isButtonPressed(gamepad, 8);

    const cancelActive =
      this.isButtonPressed(gamepad, 1) ||
      this.isButtonPressed(gamepad, 3) ||
      Math.abs(axisX) >= 0.75 ||
      Math.abs(axisY) >= 0.75 ||
      this.isButtonPressed(gamepad, 12) ||
      this.isButtonPressed(gamepad, 13) ||
      this.isButtonPressed(gamepad, 14) ||
      this.isButtonPressed(gamepad, 15);

    if (!this.canAcceptInput()) {
      return;
    }

    if (confirmActive && !this.confirmConsumed) {
      this.confirmConsumed = true;
      this.continueBattle();
    } else if (!confirmActive) {
      this.confirmConsumed = false;
    }

    if (cancelActive && !this.cancelConsumed && this.bossDialogService.isOpen) {
      this.cancelConsumed = true;
      this.continueBattle();
    } else if (!cancelActive) {
      this.cancelConsumed = false;
    }
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

  private isAnyFaceButtonPressed(gamepad: Gamepad): boolean {
    return (
      this.isButtonPressed(gamepad, 0) ||
      this.isButtonPressed(gamepad, 1) ||
      this.isButtonPressed(gamepad, 2) ||
      this.isButtonPressed(gamepad, 3)
    );
  }

  private resetConsumptions(): void {
    this.confirmConsumed = false;
    this.cancelConsumed = false;
  }
}
