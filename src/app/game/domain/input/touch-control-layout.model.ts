import { InputAction } from './input-action.model';

export interface TouchControlButtonConfig {
  action: InputAction;
  label: string;
  cluster: 'left' | 'right' | 'top';
  size: 'sm' | 'md' | 'lg';
}

export interface TouchControlLayout {
  id: string;
  opacity: number;
  buttons: TouchControlButtonConfig[];
}

export const DEFAULT_TOUCH_CONTROL_LAYOUT: TouchControlLayout = {
  id: 'default',
  opacity: 0.92,
  buttons: [
    {
      action: 'moveLeft',
      label: '◀',
      cluster: 'left',
      size: 'lg',
    },
    {
      action: 'moveRight',
      label: '▶',
      cluster: 'left',
      size: 'lg',
    },
    {
      action: 'jump',
      label: 'JUMP',
      cluster: 'right',
      size: 'lg',
    },
    {
      action: 'attack',
      label: 'ATK',
      cluster: 'right',
      size: 'md',
    },
    {
      action: 'upAttack',
      label: 'UP',
      cluster: 'right',
      size: 'md',
    },
    {
      action: 'dash',
      label: 'DASH',
      cluster: 'right',
      size: 'md',
    },
    {
      action: 'special',
      label: 'SP',
      cluster: 'right',
      size: 'md',
    },
    {
      action: 'pause',
      label: 'II',
      cluster: 'top',
      size: 'sm',
    },
  ],
};
