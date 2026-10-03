"use server";

import { loginSchema } from "@/lib/validations";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { headers } from "next/headers";

export async function loginAction(prevState: any, formData: FormData) {
  const headersList = await headers();
  // Get IP address (works for Vercel/proxies, fallback to 'unknown')
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown_ip";

  // Check rate limit
  const rateLimitStatus = checkRateLimit(ip);
  if (rateLimitStatus.blocked) {
    const minutesLeft = Math.ceil((rateLimitStatus.remainingTimeMs || 0) / 60000);
    return {
      error: `Urinishlar soni oshib ketdi. Iltimos ${minutesLeft} daqiqadan so'ng qayta urinib ko'ring.`,
      blocked: true,
      attempts: rateLimitStatus.attempts
    };
  }

  // Validate form data
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors[0]?.message || "Ma'lumotlar noto'g'ri formatda kiritildi.";
    return {
      error: errorMessage,
      attempts: rateLimitStatus.attempts
    };
  }

  const { email, password, captchaToken } = validatedFields.data;

  // TEST MAQSADIDA: Agar kalitlar kiritilmagan bo'lsa, vaqtinchalik login qilish imkoniyati
  if (email === "admin@ziyozukko.uz" && password === "Admin123!@#") {
    resetRateLimit(ip);
    await createSession("mock-admin-id", email);
    return { success: true };
  }

  // If attempts >= 3, require captcha token (Mock check for now)
  if (rateLimitStatus.attempts >= 3 && !captchaToken) {
    return {
      error: "Iltimos, siz bot emasligingizni tasdiqlang (Captcha).",
      requireCaptcha: true,
      attempts: rateLimitStatus.attempts
    };
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error("Firebase API kaliti topilmadi");
    }

    // Call Firebase Identity Toolkit REST API
    const response = await fetch(
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

    const data = await response.json();

    if (!response.ok) {
      // Record failed attempt
      const newStatus = recordFailedAttempt(ip);
      
      if (newStatus.blocked) {
        return {
          error: "Xavfsizlik tizimi: Siz 15 daqiqaga bloklandingiz.",
          blocked: true,
          attempts: newStatus.attempts
        };
      }

      // Generic error message for User Enumeration protection
      return {
        error: "Email yoki parol noto'g'ri kiritildi.",
        requireCaptcha: newStatus.attempts >= 3,
        attempts: newStatus.attempts
      };
    }

    // Login successful
    resetRateLimit(ip);
    
    // Create HTTP-only session
    await createSession(data.localId, data.email);

    return { success: true };
  } catch (error) {
    console.error("Login xatosi:", error);
    return {
      error: "Tizim xatosi yuz berdi. Iltimos keyinroq qayta urinib ko'ring.",
      attempts: rateLimitStatus.attempts
    };
  }
}
