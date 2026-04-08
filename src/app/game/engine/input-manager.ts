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
  private readonly gamepadDeadzone: number;
  private hasConnectedGamepad = false;

  constructor(gamepadDeadzone: number = INPUT_CONFIG.gamepadDeadzone) {
    this.gamepadDeadzone = gamepadDeadzone;
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.hasConnectedGamepad) {
      return;
    }

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
      this.hasConnectedGamepad = false;
      return;
    }

    const currentTokens = new Map<string, InputAction>();
    const gamepads = navigator.getGamepads();

    this.hasConnectedGamepad = false;

    for (const gamepad of gamepads) {
      if (!gamepad?.connected) {
        continue;
      }

      this.hasConnectedGamepad = true;

      this.collectStandardButtons(gamepad, currentTokens);
      this.collectLeftStickCardinal(gamepad, currentTokens);
      this.collectFirefoxDualSenseDpadFallback(gamepad, currentTokens);
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

  private collectStandardButtons(
    gamepad: Gamepad,
    currentTokens: Map<string, InputAction>,
  ): void {
    for (const action of GAME_INPUT_ACTIONS) {
      const buttonIndexes = INPUT_CONFIG.gamepadButtonBindings[action] ?? [];

      for (const buttonIndex of buttonIndexes) {
        const button = gamepad.buttons[buttonIndex];

        if (!button || (!button.pressed && button.value < 0.5)) {
          continue;
        }

        currentTokens.set(
          `gamepad:${gamepad.index}:button:${buttonIndex}:action:${action}`,
          action,
        );
      }
    }
  }

  private collectLeftStickCardinal(
    gamepad: Gamepad,
    currentTokens: Map<string, InputAction>,
  ): void {
    const x = gamepad.axes[0] ?? 0;
    const y = gamepad.axes[1] ?? 0;
    const deadzone = this.gamepadDeadzone;
    const dominanceGap = 0.14;

    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX < deadzone && absY < deadzone) {
      return;
    }

    // Snap cardinal:
    // só aceita uma direção dominante por vez para evitar diagonal falsa
    if (absX > absY + dominanceGap) {
      if (x <= -deadzone) {
        currentTokens.set(
          `gamepad:${gamepad.index}:left-stick:move-left`,
          'moveLeft',
        );
      } else if (x >= deadzone) {
        currentTokens.set(
          `gamepad:${gamepad.index}:left-stick:move-right`,
          'moveRight',
        );
      }
      return;
    }

    if (absY > absX + dominanceGap) {
      if (y <= -deadzone) {
        currentTokens.set(
          `gamepad:${gamepad.index}:left-stick:up-attack`,
          'upAttack',
        );
      } else if (y >= deadzone) {
        currentTokens.set(
          `gamepad:${gamepad.index}:left-stick:move-down`,
          'moveDown',
        );
      }
      return;
    }

    // se estiver muito diagonal, não ativa vertical/horizontal nenhuma
    // para não gerar “andar e olhar pra cima” ao mesmo tempo sem querer
  }

  private collectFirefoxDualSenseDpadFallback(
    gamepad: Gamepad,
    currentTokens: Map<string, InputAction>,
  ): void {
    const isFirefox =
      typeof navigator !== 'undefined' &&
      navigator.userAgent.toLowerCase().includes('firefox');

    const isDualSense = gamepad.id.toLowerCase().includes('dualsense');
    const needsFallback = isFirefox && isDualSense && gamepad.mapping !== 'standard';

    if (!needsFallback) {
      return;
    }

    const axis9 = gamepad.axes[9];
    if (typeof axis9 !== 'number') {
      return;
    }

    const approx = (value: number, target: number, epsilon = 0.2): boolean =>
      Math.abs(value - target) <= epsilon;

    if (approx(axis9, -1.0) || approx(axis9, 1.0)) {
      currentTokens.set(`gamepad:${gamepad.index}:ff:dpad-up`, 'upAttack');
    }

    if (approx(axis9, 0.14286) || approx(axis9, 0.42857)) {
      currentTokens.set(`gamepad:${gamepad.index}:ff:dpad-down`, 'moveDown');
    }

    if (approx(axis9, 0.71429) || approx(axis9, 0.42857) || approx(axis9, 1.0)) {
      currentTokens.set(`gamepad:${gamepad.index}:ff:dpad-left`, 'moveLeft');
    }

    if (approx(axis9, -0.42857) || approx(axis9, -0.71429) || approx(axis9, -0.14286)) {
      currentTokens.set(`gamepad:${gamepad.index}:ff:dpad-right`, 'moveRight');
    }
  }

  private clearAllInputs(): void {
    this.pressedActions.clear();
    this.justPressedActions.clear();
    this.previousGamepadTokens.clear();
    this.hasConnectedGamepad = false;

    for (const sources of this.actionSources.values()) {
      sources.clear();
    }
  }
}
