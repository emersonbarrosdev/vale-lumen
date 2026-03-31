export function hasBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readStoredNumber(key: string, fallback: number): number {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function writeStoredNumber(key: string, value: number): void {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(key, String(value));
}
