const store = new Map<string, { count: number; resetAt: number }>();
let callCount = 0;

function cleanupExpired(now: number) {
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();

  // Delete this key if expired
  const existing = store.get(key);
  if (existing && now > existing.resetAt) {
    store.delete(key);
  }

  // Periodic full sweep every 100 calls to prevent memory leak
  callCount++;
  if (callCount % 100 === 0) {
    cleanupExpired(now);
  }

  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

export function getRateLimitHeaders(remaining: number, limit: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
  };
}
