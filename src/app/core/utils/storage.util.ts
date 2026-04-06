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

export function readStoredBoolean(key: string, fallback: boolean): boolean {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  return rawValue === 'true';
}

export function writeStoredBoolean(key: string, value: boolean): void {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(key, String(value));
}

export function readStoredString(key: string, fallback: string): string {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
}

export function writeStoredString(key: string, value: string): void {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(key, value);
}

export function readStoredJson<T>(key: string, fallback: T): T {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeStoredJson<T>(key: string, value: T): void {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStoredValue(key: string): void {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
}
