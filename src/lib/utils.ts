export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

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
