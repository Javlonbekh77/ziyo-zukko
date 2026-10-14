interface RateLimitEntry {
  count: number;
  blockedUntil: number | null;
  lastAttempt: number;
}

// In-memory rate limiting map
// Keys are formatted as `ip:${ip}` and `email:${normalizedEmail}`
const rateLimitMap = new Map<string, RateLimitEntry>();

export const MAX_LOGIN_ATTEMPTS = 5;
export const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 daqiqa (15 minutes)
export const CAPTCHA_TRIGGER_ATTEMPTS = 3;

/**
 * Periodically purge stale entries older than 24 hours to prevent memory leaks
 */
function cleanupStaleEntries() {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.lastAttempt > ONE_DAY_MS && (!value.blockedUntil || now > value.blockedUntil)) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup occasionally
if (typeof setInterval !== "undefined") {
  setInterval(cleanupStaleEntries, 30 * 60 * 1000); // Har 30 daqiqada
}

function getRecord(key: string): RateLimitEntry {
  let record = rateLimitMap.get(key);
  if (!record) {
    record = { count: 0, blockedUntil: null, lastAttempt: Date.now() };
    rateLimitMap.set(key, record);
  }
  return record;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  blocked: boolean;
  remainingTimeMs: number;
  remainingSeconds: number;
  remainingMinutes: number;
  attempts: number;
  maxAttempts: number;
  requireCaptcha: boolean;
}

/**
 * Checks if the IP or email is currently blocked by rate limiting.
 */
export function checkRateLimit(ip: string, email?: string): RateLimitCheckResult {
  const now = Date.now();
  const keys = [`ip:${ip.trim()}`];
  if (email && email.trim()) {
    keys.push(`email:${email.trim().toLowerCase()}`);
  }

  let highestAttempts = 0;
  let maxBlockedUntil: number | null = null;

  for (const key of keys) {
    const record = rateLimitMap.get(key);
    if (!record) continue;

    if (record.count > highestAttempts) {
      highestAttempts = record.count;
    }

    if (record.blockedUntil) {
      if (now < record.blockedUntil) {
        if (!maxBlockedUntil || record.blockedUntil > maxBlockedUntil) {
          maxBlockedUntil = record.blockedUntil;
        }
      } else {
        // Bloklash vaqti tugagan - reset
        record.blockedUntil = null;
        record.count = 0;
      }
    }
  }

  if (maxBlockedUntil && now < maxBlockedUntil) {
    const remainingTimeMs = maxBlockedUntil - now;
    const remainingSeconds = Math.ceil(remainingTimeMs / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);

    return {
      allowed: false,
      blocked: true,
      remainingTimeMs,
      remainingSeconds,
      remainingMinutes,
      attempts: highestAttempts,
      maxAttempts: MAX_LOGIN_ATTEMPTS,
      requireCaptcha: true,
    };
  }

  return {
    allowed: true,
    blocked: false,
    remainingTimeMs: 0,
    remainingSeconds: 0,
    remainingMinutes: 0,
    attempts: highestAttempts,
    maxAttempts: MAX_LOGIN_ATTEMPTS,
    requireCaptcha: highestAttempts >= CAPTCHA_TRIGGER_ATTEMPTS,
  };
}

/**
 * Records a failed attempt for both the client IP and targeted account.
 */
export function recordFailedAttempt(ip: string, email?: string): RateLimitCheckResult {
  const now = Date.now();
  const keys = [`ip:${ip.trim()}`];
  if (email && email.trim()) {
    keys.push(`email:${email.trim().toLowerCase()}`);
  }

  let highestAttempts = 0;
  let isBlocked = false;
  let blockedUntilMs: number | null = null;

  for (const key of keys) {
    const record = getRecord(key);
    record.lastAttempt = now;
    record.count += 1;

    if (record.count > highestAttempts) {
      highestAttempts = record.count;
    }

    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
      isBlocked = true;
      blockedUntilMs = record.blockedUntil;
    }
  }

  const remainingTimeMs = isBlocked && blockedUntilMs ? blockedUntilMs - now : 0;
  const remainingSeconds = Math.ceil(remainingTimeMs / 1000);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  return {
    allowed: !isBlocked,
    blocked: isBlocked,
    remainingTimeMs,
    remainingSeconds,
    remainingMinutes,
    attempts: highestAttempts,
    maxAttempts: MAX_LOGIN_ATTEMPTS,
    requireCaptcha: highestAttempts >= CAPTCHA_TRIGGER_ATTEMPTS,
  };
}

/**
 * Resets the failed attempts counter on successful authentication.
 */
export function resetRateLimit(ip: string, email?: string) {
  rateLimitMap.delete(`ip:${ip.trim()}`);
  if (email && email.trim()) {
    rateLimitMap.delete(`email:${email.trim().toLowerCase()}`);
  }
}

/**
 * Computes progressive artificial delay (in ms) to slow down automated bot attacks.
 * E.g., attempt 1: 0ms, attempt 2: 500ms, attempt 3: 1500ms, attempt 4: 3000ms.
 */
export function calculateBruteForceDelay(attempts: number): number {
  if (attempts <= 1) return 200; // Small constant delay to prevent timing attacks
  if (attempts === 2) return 600;
  if (attempts === 3) return 1500;
  return 2500;
}
