/**
 * Frontend uchun Cloudflare R2 bilan ishlash yordamchi funksiyalari (R2 Client Helpers)
 */

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    key: string;
    originalName?: string;
    size?: number;
    type?: string;
  };
  files?: Array<{
    url: string;
    key: string;
    originalName?: string;
    size?: number;
    type?: string;
  }>;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Faylni Cloudflare R2'ga yuklash (API route orqali)
 * @param file Yuklanadigan fayl
 * @param folder Papka nomi (masalan: 'gallery', 'certificates', 'students')
 */
export async function uploadFileToR2(
  file: File,
  folder: string = "uploads"
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data: UploadResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Fayl yuklashda xatolik yuz berdi.");
  }

  const resultUrl = data.data?.url || data.url;
  const resultKey = data.data?.key || data.key;

  if (!resultUrl || !resultKey) {
    throw new Error("Serverdan to'g'ri fayl manzili olinmadi.");
  }

  return {
    url: resultUrl,
    key: resultKey,
  };
}

/**
 * Bir nechta fayllarni R2'ga yuklash
 */
export async function uploadMultipleFilesToR2(
  files: File[],
  folder: string = "uploads"
): Promise<Array<{ url: string; key: string }>> {
  const formData = new FormData();
  files.forEach((file) => formData.append("file", file));
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data: UploadResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Fayllarni yuklashda xatolik yuz berdi.");
  }

  const items = data.files || (Array.isArray(data.data) ? data.data : [data.data]);
  return items.map((item: any) => ({
    url: item.url,
    key: item.key,
  }));
}

/**
 * R2'dagi faylni o'chirish
 * @param keyOrUrl Faylning kaliti (key) yoki to'liq manzili (url)
 */
export async function deleteFileFromR2(keyOrUrl: string): Promise<boolean> {
  const res = await fetch("/api/upload", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: keyOrUrl }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Faylni o'chirishda xatolik yuz berdi.");
  }

  return true;
}
