import { z } from 'zod';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const memoryFallback = new Map<string, string>();

function readRaw(key: string): string | null {
  if (isBrowser) return window.localStorage.getItem(key);
  return memoryFallback.get(key) ?? null;
}

function writeRaw(key: string, value: string): void {
  if (isBrowser) {
    window.localStorage.setItem(key, value);
    return;
  }
  memoryFallback.set(key, value);
}

function removeRaw(key: string): void {
  if (isBrowser) {
    window.localStorage.removeItem(key);
    return;
  }
  memoryFallback.delete(key);
}

export const storage = {
  read<S extends z.ZodTypeAny>(key: string, schema: S): z.infer<S> | null {
    const raw = readRaw(key);
    if (raw === null) return null;
    try {
      return schema.parse(JSON.parse(raw)) as z.infer<S>;
    } catch {
      return null;
    }
  },
  write<T>(key: string, value: T): void {
    writeRaw(key, JSON.stringify(value));
  },
  remove(key: string): void {
    removeRaw(key);
  },
  clearByPrefix(prefix: string): void {
    if (isBrowser) {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) keys.push(key);
      }
      keys.forEach((k) => window.localStorage.removeItem(k));
      return;
    }
    Array.from(memoryFallback.keys())
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => memoryFallback.delete(k));
  },
};
