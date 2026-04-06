export type LastInputDevice = 'keyboard' | 'gamepad' | 'touch';

export interface GameSettings {
  musicVolume: number;
  effectsVolume: number;
  showTouchControls: boolean;
  touchControlLayout: string;
  gamepadDeadzone: number;
  lastInputDevice: LastInputDevice;
}
