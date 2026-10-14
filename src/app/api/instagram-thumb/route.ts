import { NextRequest, NextResponse } from "next/server";

export function extractInstagramShortcode(url: string): string | null {
  try {
    const cleanUrl = url.split("?")[0].replace(/\/$/, "");
    const match = cleanUrl.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function formatInstagramEmbed(url: string): string {
  const clean = url.split("?")[0].replace(/\/embed\/?$/, "").replace(/\/$/, "");
  return `${clean}/embed/`;
}

/**
 * GET /api/instagram-thumb?url=https://www.instagram.com/p/...
 * Instagram havolasidan avtomatik rasm (thumbnail) va embed URL olish
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl || !targetUrl.includes("instagram.com")) {
    return NextResponse.json(
      { success: false, error: "Yaroqli Instagram havolasi ko'rsatilmadi." },
      { status: 400 }
    );
  }

  const shortcode = extractInstagramShortcode(targetUrl);
  if (!shortcode) {
    return NextResponse.json(
      { success: false, error: "Instagram havolasidan post kodi topilmadi." },
      { status: 400 }
    );
  }

  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/`;
  
  // Rendered high-resolution embed cover image
  const autoThumbnailUrl = `https://image.thum.io/get/width/720/crop/850/${embedUrl}`;

  return NextResponse.json({
    success: true,
    shortcode,
    embedUrl,
    thumbnailUrl: autoThumbnailUrl,
  });
}
