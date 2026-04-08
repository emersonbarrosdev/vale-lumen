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
    // D-pad
    moveLeft: [14],
    moveRight: [15],
    moveDown: [13],
    upAttack: [12],

    // Face buttons - padrão W3C standard
    jump: [0],     // PS5 X | Xbox A
    special: [1],  // PS5 Bola | Xbox B
    attack: [2],   // PS5 Quadrado | Xbox X

    dash: [],
    pause: [9],    // Start / Options
    confirm: [2],  // PS5 Quadrado | Xbox X
    cancel: [1],   // PS5 Bola | Xbox B
  },
  gamepadAxisBindings: {
    // leitura analógica real será feita pelo InputManager com snap cardinal,
    // para evitar diagonais falsas e "olhar para cima" ao andar para o lado
  },
  gamepadDeadzone: 0.42,
  touchEnabledActions: [
    'moveLeft',
    'moveRight',
    'jump',
    'attack',
    'upAttack',
    'special',
    'pause',
  ],
};
