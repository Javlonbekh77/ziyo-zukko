import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Login tizimi vaqtinchalik o'chirildi (Foydalanuvchi talabiga ko'ra)
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
