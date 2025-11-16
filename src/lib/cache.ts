type CacheEntry<T> = { value: T; expiresAt: number }

const store = new Map<string, CacheEntry<any>>()

export function getCache<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value as T
}

export function setCache<T>(key: string, value: T, ttlMs: number = 60_000): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function delCache(key: string): void {
  store.delete(key)
}

export function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const existing = getCache<T>(key)
  if (existing) return Promise.resolve(existing)
  return fn().then((val) => {
    setCache(key, val, ttlMs)
    return val
  })
}
