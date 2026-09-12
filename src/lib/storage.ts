/**
 * localStorage access that cannot throw.
 *
 * Reads and writes fail in private windows, when site data is blocked, and
 * during thumbnail/preview capture — so every access is guarded and callers
 * must render correctly with no stored value.
 */

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable — the feature degrades to in-memory only.
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to do.
  }
}
