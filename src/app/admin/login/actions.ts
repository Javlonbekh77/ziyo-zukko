"use server";

import { loginSchema } from "@/lib/validations";
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  resetRateLimit, 
  calculateBruteForceDelay,
  MAX_LOGIN_ATTEMPTS,
  CAPTCHA_TRIGGER_ATTEMPTS
} from "@/lib/rate-limit";
import { generateCaptcha, verifyCaptcha, CaptchaChallenge } from "@/lib/captcha";
export type { CaptchaChallenge };
import { createSession } from "@/lib/session";
import { headers } from "next/headers";

export interface LoginActionResult {
  success?: boolean;
  error?: string;
  blocked?: boolean;
  remainingSeconds?: number;
  remainingMinutes?: number;
  attempts?: number;
  remainingAttempts?: number;
  requireCaptcha?: boolean;
  captchaChallenge?: CaptchaChallenge | null;
}

/**
 * Server action to generate a fresh anti-bot challenge
 */
export async function getNewCaptchaAction(): Promise<CaptchaChallenge> {
  return generateCaptcha();
}

export async function loginAction(
  prevState: LoginActionResult | null, 
  formData: FormData
): Promise<LoginActionResult> {
  const headersList = await headers();
  
  // Extract client IP address reliably
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp?.trim() || "127.0.0.1");

  const rawEmail = (formData.get("email") as string || "").trim().toLowerCase();
  const rawPassword = (formData.get("password") as string || "");
  const captchaAnswer = formData.get("captchaAnswer") as string || "";
  const captchaToken = formData.get("captchaToken") as string || "";

  // 1. Initial Rate Limit Check (IP + Email)
  const currentLimit = checkRateLimit(ip, rawEmail);
  if (currentLimit.blocked) {
    return {
      error: `Xavfsizlik tizimi: Ko'p sonli muvaffaqiyatsiz urinishlar aniqlandi. Siz ${currentLimit.remainingMinutes} daqiqaga bloklandingiz.`,
      blocked: true,
      remainingSeconds: currentLimit.remainingSeconds,
      remainingMinutes: currentLimit.remainingMinutes,
      attempts: currentLimit.attempts,
      remainingAttempts: 0,
    };
  }

  // 2. Validate input fields
  const validationResult = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    captchaAnswer,
    captchaToken,
  });

  if (!validationResult.success) {
    const errorMsg = validationResult.error.issues?.[0]?.message || "Ma'lumotlar to'liq va to'g'ri kiritilishi shart.";
    return {
      error: errorMsg,
      attempts: currentLimit.attempts,
      remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - currentLimit.attempts),
      requireCaptcha: currentLimit.requireCaptcha,
      captchaChallenge: currentLimit.requireCaptcha ? generateCaptcha() : null,
    };
  }

  const { email, password } = validationResult.data;

  // 3. Progressive Delay Throttling (Anti-timing and anti-concurrency attack)
  const throttleMs = calculateBruteForceDelay(currentLimit.attempts);
  if (throttleMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, throttleMs));
  }

  // 4. Anti-Bot / Captcha Verification (Triggered after 3 failed attempts)
  if (currentLimit.requireCaptcha) {
    const isCaptchaValid = verifyCaptcha(captchaAnswer, captchaToken);
    if (!isCaptchaValid) {
      const freshCaptcha = generateCaptcha();
      return {
        error: "Botdan himoya: Hisoblash noto'g'ri yoki vaqti o'tgan. Iltimos, yangi misolni yeching.",
        requireCaptcha: true,
        captchaChallenge: freshCaptcha,
        attempts: currentLimit.attempts,
        remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - currentLimit.attempts),
      };
    }
  }

  // 5. Credential Verification
  const masterEmail = (process.env.ADMIN_EMAIL || "admin@ziyozukko.uz").trim().toLowerCase();
  const masterPassword = process.env.ADMIN_PASSWORD || "Admin123!@#";

  let isAuthenticated = false;
  let userId = "admin";
  let userEmail = email;

  // Check 5a: Master Administrator Account
  if (email === masterEmail && password === masterPassword) {
    isAuthenticated = true;
    userId = "master-admin";
  }

  // Check 5b: Firebase Auth Identity Toolkit (if not authenticated by master key)
  if (!isAuthenticated) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey) {
      try {
        const fbRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              returnSecureToken: true,
            }),
          }
        );

        if (fbRes.ok) {
          const fbData = await fbRes.json();
          isAuthenticated = true;
          userId = fbData.localId;
          userEmail = fbData.email || email;
        }
      } catch (fbErr) {
        console.error("Firebase auth verification error:", fbErr);
      }
    }
  }

  // 6. Handle Authentication Outcome
  if (isAuthenticated) {
    // Reset rate limiting counters on valid login
    resetRateLimit(ip, email);

    // Create secure HTTP-only JWT session
    await createSession(userId, userEmail);

    return { success: true };
  }

  // 7. Handle Authentication Failure (Increment penalty)
  const failureStatus = recordFailedAttempt(ip, email);

  if (failureStatus.blocked) {
    return {
      error: `Xavfsizlik tizimi: Ko'p sonli noto'g'ri urinishlar aniqlandi! Tizim 15 daqiqaga bloklandi.`,
      blocked: true,
      remainingSeconds: failureStatus.remainingSeconds,
      remainingMinutes: failureStatus.remainingMinutes,
      attempts: failureStatus.attempts,
      remainingAttempts: 0,
    };
  }

  const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - failureStatus.attempts);

  return {
    error: `Email yoki parol noto'g'ri kiritildi. Qolgan urinishlar: ${remainingAttempts} ta.`,
    blocked: false,
    attempts: failureStatus.attempts,
    remainingAttempts,
    requireCaptcha: failureStatus.requireCaptcha,
    captchaChallenge: failureStatus.requireCaptcha ? generateCaptcha() : null,
  };
}
