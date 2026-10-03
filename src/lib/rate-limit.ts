interface RateLimitData {
  count: number;
  blockedUntil: number | null;
}

const rateLimitMap = new Map<string, RateLimitData>();

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { 
  success: boolean; 
  blocked: boolean; 
  remainingTimeMs?: number;
  attempts: number;
} {
  const now = Date.now();
  let data = rateLimitMap.get(ip);

  if (!data) {
    data = { count: 0, blockedUntil: null };
    rateLimitMap.set(ip, data);
  }

  if (data.blockedUntil) {
    if (now < data.blockedUntil) {
      return { 
        success: false, 
        blocked: true, 
        remainingTimeMs: data.blockedUntil - now,
        attempts: data.count 
      };
    } else {
      // Block expired
      data.count = 0;
      data.blockedUntil = null;
    }
  }

  return { success: true, blocked: false, attempts: data.count };
}

export function recordFailedAttempt(ip: string): { blocked: boolean; attempts: number } {
  let data = rateLimitMap.get(ip);
  if (!data) {
    data = { count: 0, blockedUntil: null };
    rateLimitMap.set(ip, data);
  }

  data.count += 1;

  if (data.count >= MAX_ATTEMPTS) {
    data.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    return { blocked: true, attempts: data.count };
  }

  return { blocked: false, attempts: data.count };
}

export function resetRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}
