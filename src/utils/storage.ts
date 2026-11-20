import "expo-sqlite/localStorage/install";

// JSON helpers over the expo-sqlite `localStorage` polyfill
// Importing the install here guarantees it runs before any slice reads storage.
export const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeJson = (key: string, value: unknown): void => {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is a cache/preferences layer only — never block the UI on it.
  }
};
