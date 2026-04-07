import { INPUT_CONFIG } from '../../core/config/input.config';
import {
  GAME_INPUT_ACTIONS,
  InputAction,
  InputSourceType,
} from '../domain/input/input-action.model';

export class InputManager {
  private readonly pressedActions = new Set<InputAction>();
  private readonly justPressedActions = new Set<InputAction>();
  private readonly actionSources = new Map<InputAction, Set<string>>();
  private readonly keyToActionsMap = this.buildKeyToActionsMap();
  private readonly previousGamepadTokens = new Map<string, InputAction>();

  private lastInputSource: InputSourceType = 'keyboard';

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const key = this.normalizeKey(event.key);
    const actions = this.keyToActionsMap.get(key) ?? [];

    for (const action of actions) {
      this.activateAction(action, `keyboard:${key}`, 'keyboard');
    }

    if (INPUT_CONFIG.preventDefaultKeys.includes(key)) {
      event.preventDefault();
    }
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const key = this.normalizeKey(event.key);
    const actions = this.keyToActionsMap.get(key) ?? [];

    for (const action of actions) {
      this.deactivateAction(action, `keyboard:${key}`);
    }
  };

  private readonly handleWindowBlur = (): void => {
    this.clearAllInputs();
  };

  attach(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  detach(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('blur', this.handleWindowBlur);
    }

    this.clearAllInputs();
  }

  beginFrame(): void {
    this.syncGamepads();
  }

  endFrame(): void {
    this.justPressedActions.clear();
  }

  isPressed(actionOrKey: InputAction | string): boolean {
    const resolvedAction = this.resolveAction(actionOrKey);

    return resolvedAction ? this.pressedActions.has(resolvedAction) : false;
  }

  isJustPressed(actionOrKey: InputAction | string): boolean {
    const resolvedAction = this.resolveAction(actionOrKey);

    return resolvedAction ? this.justPressedActions.has(resolvedAction) : false;
  }

  isActionPressed(action: InputAction): boolean {
    return this.pressedActions.has(action);
  }

  isActionJustPressed(action: InputAction): boolean {
    return this.justPressedActions.has(action);
  }

  setVirtualActionState(
    action: InputAction,
    pressed: boolean,
    source: InputSourceType = 'touch',
  ): void {
    const token = `${source}:${action}`;

    if (pressed) {
      this.activateAction(action, token, source);
      return;
    }

    this.deactivateAction(action, token);
  }

  clearVirtualInputs(source: InputSourceType = 'touch'): void {
    for (const action of GAME_INPUT_ACTIONS) {
      this.deactivateAction(action, `${source}:${action}`);
    }
  }

  getLastInputSource(): InputSourceType {
    return this.lastInputSource;
  }

  private buildKeyToActionsMap(): Map<string, InputAction[]> {
    const map = new Map<string, InputAction[]>();

    for (const action of GAME_INPUT_ACTIONS) {
      const keys = INPUT_CONFIG.keyboardBindings[action] ?? [];

      for (const key of keys) {
        const normalizedKey = this.normalizeKey(key);
        const actions = map.get(normalizedKey) ?? [];
        actions.push(action);
        map.set(normalizedKey, actions);
      }
    }

    return map;
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase();
  }

  private resolveAction(actionOrKey: InputAction | string): InputAction | null {
    if ((GAME_INPUT_ACTIONS as string[]).includes(actionOrKey)) {
      return actionOrKey as InputAction;
    }

    const normalizedKey = this.normalizeKey(actionOrKey);
    const actions = this.keyToActionsMap.get(normalizedKey);

    return actions?.[0] ?? null;
  }

  private activateAction(
    action: InputAction,
    sourceToken: string,
    sourceType: InputSourceType,
  ): void {
    const activeSources = this.getActionSources(action);
    const wasInactive = activeSources.size === 0;

    if (activeSources.has(sourceToken)) {
      return;
    }

    activeSources.add(sourceToken);
    this.pressedActions.add(action);
    this.lastInputSource = sourceType;

    if (wasInactive) {
      this.justPressedActions.add(action);
    }
  }

  private deactivateAction(action: InputAction, sourceToken: string): void {
    const activeSources = this.actionSources.get(action);

    if (!activeSources?.has(sourceToken)) {
      return;
    }

    activeSources.delete(sourceToken);

    if (activeSources.size === 0) {
      this.pressedActions.delete(action);
    }
  }

  private getActionSources(action: InputAction): Set<string> {
    const existing = this.actionSources.get(action);

    if (existing) {
      return existing;
    }

    const created = new Set<string>();
    this.actionSources.set(action, created);
    return created;
  }

  private syncGamepads(): void {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
      return;
    }

    const currentTokens = new Map<string, InputAction>();
    const gamepads = navigator.getGamepads();

    for (const gamepad of gamepads) {
      if (!gamepad?.connected) {
        continue;
      }

      this.collectGamepadButtonActions(gamepad, currentTokens);
      this.collectGamepadAxisActions(gamepad, currentTokens);
    }

    for (const [token, action] of currentTokens) {
      if (!this.previousGamepadTokens.has(token)) {
        this.activateAction(action, token, 'gamepad');
      }
    }

    for (const [token, action] of this.previousGamepadTokens) {
      if (!currentTokens.has(token)) {
        this.deactivateAction(action, token);
      }
    }

    this.previousGamepadTokens.clear();

    for (const [token, action] of currentTokens) {
      this.previousGamepadTokens.set(token, action);
    }
  }

  private collectGamepadButtonActions(
    gamepad: Gamepad,
    currentTokens: Map<string, InputAction>,
  ): void {
    for (const action of GAME_INPUT_ACTIONS) {
      const buttonIndexes = INPUT_CONFIG.gamepadButtonBindings[action] ?? [];

      for (const buttonIndex of buttonIndexes) {
        const button = gamepad.buttons[buttonIndex];

        if (!button?.pressed) {
          continue;
        }

        currentTokens.set(
          `gamepad:${gamepad.index}:button:${buttonIndex}`,
          action,
        );
      }
    }
  }

  private collectGamepadAxisActions(
    gamepad: Gamepad,
    currentTokens: Map<string, InputAction>,
  ): void {
    for (const action of GAME_INPUT_ACTIONS) {
      const axisBindings = INPUT_CONFIG.gamepadAxisBindings[action] ?? [];

      for (const axisBinding of axisBindings) {
        const axisValue = gamepad.axes[axisBinding.axisIndex] ?? 0;
        const threshold = axisBinding.threshold ?? INPUT_CONFIG.gamepadDeadzone;

        if (axisBinding.direction === -1 && axisValue <= -threshold) {
          currentTokens.set(
            `gamepad:${gamepad.index}:axis:${axisBinding.axisIndex}:negative`,
            action,
          );
        }

        if (axisBinding.direction === 1 && axisValue >= threshold) {
          currentTokens.set(
            `gamepad:${gamepad.index}:axis:${axisBinding.axisIndex}:positive`,
            action,
          );
        }
      }
    }
  }

  private clearAllInputs(): void {
    this.pressedActions.clear();
    this.justPressedActions.clear();
    this.previousGamepadTokens.clear();

    for (const sources of this.actionSources.values()) {
      sources.clear();
    }
  }
}
