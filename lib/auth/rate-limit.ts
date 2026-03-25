type Entry = {
  count: number;
  expiresAt: number;
};

const store = new Map<string, Entry>();

export function enforceRateLimit(key: string, maxAttempts: number, windowMs: number) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxAttempts) {
    return false;
  }

  current.count += 1;
  store.set(key, current);
  return true;
}
