export type InputAction =
  | 'moveLeft'
  | 'moveRight'
  | 'moveDown'
  | 'jump'
  | 'attack'
  | 'upAttack'
  | 'dash'
  | 'special'
  | 'pause'
  | 'confirm'
  | 'cancel';

export type InputSourceType = 'keyboard' | 'gamepad' | 'touch';

export const GAME_INPUT_ACTIONS: InputAction[] = [
  'moveLeft',
  'moveRight',
  'moveDown',
  'jump',
  'attack',
  'upAttack',
  'dash',
  'special',
  'pause',
  'confirm',
  'cancel',
];
