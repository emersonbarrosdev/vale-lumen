import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { GamepadState } from '../domain/input/gamepad-state.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceInputService implements OnDestroy {
  private readonly isBrowser: boolean;
  private readonly gamepadsSubject = new BehaviorSubject<GamepadState[]>([]);

  readonly gamepads$ = this.gamepadsSubject.asObservable();
  readonly hasConnectedGamepad$ = this.gamepads$.pipe(
    map((gamepads) => gamepads.length > 0),
    distinctUntilChanged(),
  );

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (!this.isBrowser) {
      return;
    }

    window.addEventListener('gamepadconnected', this.handleGamepadChange);
    window.addEventListener('gamepaddisconnected', this.handleGamepadChange);

    this.refresh();
  }

  refresh(): void {
    if (!this.isBrowser || typeof navigator.getGamepads !== 'function') {
      this.gamepadsSubject.next([]);
      return;
    }

    const gamepads = Array.from(navigator.getGamepads())
      .filter((gamepad): gamepad is Gamepad => !!gamepad && gamepad.connected)
      .map((gamepad) => ({
        connected: gamepad.connected,
        index: gamepad.index,
        id: gamepad.id,
        mapping: gamepad.mapping,
        buttonsCount: gamepad.buttons.length,
        axesCount: gamepad.axes.length,
      }));

    this.gamepadsSubject.next(gamepads);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    window.removeEventListener('gamepadconnected', this.handleGamepadChange);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadChange);
  }

  private readonly handleGamepadChange = (): void => {
    this.refresh();
  };
}
