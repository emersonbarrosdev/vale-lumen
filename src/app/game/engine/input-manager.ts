export class InputManager {
  private readonly pressed = new Set<string>();
  private readonly justPressed = new Set<string>();

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();

    if (!this.pressed.has(key)) {
      this.justPressed.add(key);
    }

    this.pressed.add(key);

    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
    }
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    this.pressed.delete(key);
  };

  attach(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.pressed.clear();
    this.justPressed.clear();
  }

  isPressed(key: string): boolean {
    return this.pressed.has(key.toLowerCase());
  }

  isJustPressed(key: string): boolean {
    return this.justPressed.has(key.toLowerCase());
  }

  endFrame(): void {
    this.justPressed.clear();
  }
}
