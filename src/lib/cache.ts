// Client-side caching utility with localStorage persistence and stale-while-revalidate pattern

const CACHE_PREFIX = "zz_cache_";
const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface CachePayload<T> {
  data: T;
  timestamp: number;
}

/**
 * Retrieve cached data from localStorage.
 * Returns defaultValue immediately if no cache or on server.
 */
export function getLocalCache<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return defaultValue;
    const parsed: CachePayload<T> = JSON.parse(raw);
    if (parsed && parsed.data !== undefined) {
      return parsed.data;
    }
    return defaultValue;
  } catch (err) {
    console.warn(`Error reading cache for ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Save data to localStorage cache.
 */
export function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachePayload<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch (err) {
    console.warn(`Error writing cache for ${key}:`, err);
  }
}

/**
 * Remove a specific key or all zz_cache keys from localStorage.
 */
export function clearLocalCache(key?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (key) {
      localStorage.removeItem(CACHE_PREFIX + key);
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn("Error clearing cache:", err);
  }
}
