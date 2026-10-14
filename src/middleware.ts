import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET_KEY || "super-secret-ziyo-zukko-key-change-me";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Faqat /admin yo'llarini himoyalash
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("admin_session")?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });
      if (payload && payload.uid) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Agar foydalanuvchi /admin/login sahifasida bo'lsa
  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      // Agar tizimga kirgan bo'lsa, to'g'ridan-to'g'ri /admin ga yo'naltirish
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // 2. Agar foydalanuvchi boshqa /admin/* sahifalariga kirmoqchi bo'lsa
  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    // Eskirgan yoki yaroqsiz sessiyani tozalash
    if (sessionCookie) {
      response.cookies.delete("admin_session");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
