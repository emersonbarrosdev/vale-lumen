import {
  CommonModule,
} from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  DEFAULT_TOUCH_CONTROL_LAYOUT,
  TouchControlButtonConfig,
  TouchControlLayout,
} from '../../../domain/input/touch-control-layout.model';
import { InputAction } from '../../../domain/input/input-action.model';

export interface TouchActionStateChange {
  action: InputAction;
  pressed: boolean;
}

@Component({
  selector: 'app-mobile-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-controls.component.html',
  styleUrl: './mobile-controls.component.scss',
})
export class MobileControlsComponent implements OnDestroy {
  @Input() blocked = false;
  @Input() layout: TouchControlLayout = DEFAULT_TOUCH_CONTROL_LAYOUT;

  @Output() readonly actionStateChange =
    new EventEmitter<TouchActionStateChange>();

  private readonly activeActions = new Set<InputAction>();

  get leftButtons(): TouchControlButtonConfig[] {
    return this.layout.buttons.filter((button) => button.cluster === 'left');
  }

  get rightButtons(): TouchControlButtonConfig[] {
    return this.layout.buttons.filter((button) => button.cluster === 'right');
  }

  get topButtons(): TouchControlButtonConfig[] {
    return this.layout.buttons.filter((button) => button.cluster === 'top');
  }

  ngOnDestroy(): void {
    this.releaseAllActions();
  }

  @HostListener('window:blur')
  handleWindowBlur(): void {
    this.releaseAllActions();
  }

  pressAction(event: Event, action: InputAction): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.blocked || this.activeActions.has(action)) {
      return;
    }

    this.activeActions.add(action);
    this.actionStateChange.emit({
      action,
      pressed: true,
    });
  }

  releaseAction(event: Event, action: InputAction): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.activeActions.has(action)) {
      return;
    }

    this.activeActions.delete(action);
    this.actionStateChange.emit({
      action,
      pressed: false,
    });
  }

  trackByAction(_: number, button: TouchControlButtonConfig): InputAction {
    return button.action;
  }

  private releaseAllActions(): void {
    for (const action of this.activeActions) {
      this.actionStateChange.emit({
        action,
        pressed: false,
      });
    }

    this.activeActions.clear();
  }
}
