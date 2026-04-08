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
    'w',
    's',
    'e',
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'escape',
    'j',
    'l',
    'enter',
    'backspace',
  ],
  keyboardBindings: {
    moveLeft: ['a', 'arrowleft'],
    moveRight: ['d', 'arrowright'],
    moveDown: ['s', 'arrowdown'],
    jump: [' ', 'w'],
    attack: ['j'],
    upAttack: ['e', 'arrowup'],
    dash: [],
    special: ['l'],
    pause: ['escape'],
    confirm: ['enter'],
    cancel: ['backspace'],
  },
  gamepadButtonBindings: {
    moveLeft: [14],
    moveRight: [15],
    moveDown: [13],
    upAttack: [12],

    jump: [0],     // PS5 X | Xbox A
    special: [1],  // PS5 Bola | Xbox B
    attack: [2],   // PS5 Quadrado | Xbox X

    dash: [],
    pause: [9],    // Start / Options
    confirm: [2],
    cancel: [1],
  },
  gamepadAxisBindings: {
    // leitura analógica real feita no InputManager com snap cardinal refinado
  },

  gamepadDeadzone: 0.34,

  touchEnabledActions: [
    'moveLeft',
    'moveRight',
    'moveDown',
    'jump',
    'attack',
    'upAttack',
    'special',
    'pause',
  ],
};
