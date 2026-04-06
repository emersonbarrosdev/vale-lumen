import { InputAction } from '../../game/domain/input/input-action.model';

export interface GamepadAxisBinding {
  axisIndex: number;
  direction: -1 | 1;
  threshold?: number;
}

export interface InputConfig {
  preventDefaultKeys: string[];
  keyboardBindings: Record<InputAction, string[]>;
  gamepadButtonBindings: Partial<Record<InputAction, number[]>>;
  gamepadAxisBindings: Partial<Record<InputAction, GamepadAxisBinding[]>>;
  gamepadDeadzone: number;
  touchEnabledActions: InputAction[];
}

export const INPUT_CONFIG: InputConfig = {
  preventDefaultKeys: [
    ' ',
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'escape',
  ],
  keyboardBindings: {
    moveLeft: ['a', 'arrowleft'],
    moveRight: ['d', 'arrowright'],
    moveDown: ['s', 'arrowdown'],
    jump: [' ', 'w', 'arrowup'],
    attack: ['j'],
    upAttack: ['i'],
    dash: ['k'],
    special: ['l'],
    pause: ['escape'],
    confirm: ['enter'],
    cancel: ['backspace'],
  },
  gamepadButtonBindings: {
    moveLeft: [14],
    moveRight: [15],
    moveDown: [13],
    jump: [0],
    attack: [2],
    upAttack: [3],
    dash: [1],
    special: [5],
    pause: [9],
    confirm: [0],
    cancel: [1],
  },
  gamepadAxisBindings: {
    moveLeft: [
      {
        axisIndex: 0,
        direction: -1,
      },
    ],
    moveRight: [
      {
        axisIndex: 0,
        direction: 1,
      },
    ],
    moveDown: [
      {
        axisIndex: 1,
        direction: 1,
      },
    ],
  },
  gamepadDeadzone: 0.35,
  touchEnabledActions: [
    'moveLeft',
    'moveRight',
    'jump',
    'attack',
    'upAttack',
    'dash',
    'special',
    'pause',
  ],
};
