import { NextRequest, NextResponse } from "next/server";
import { SCHOOL_DOCUMENTS } from "@/data/documentsData";
import { uploadToR2 } from "@/lib/r2";

/**
 * GET /api/documents
 * Barcha maktab hujjatlari ro'yxatini qaytaradi (kategoriya va format bo'yicha filter bilan).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const format = searchParams.get("format");
  const slug = searchParams.get("slug");

  let list = SCHOOL_DOCUMENTS;

  if (slug) {
    const doc = list.find((d) => d.slug === slug || d.id === slug);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Hujjat topilmadi" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, document: doc });
  }

  if (category && category !== "all") {
    list = list.filter((d) => d.category === category);
  }

  if (format && format !== "all") {
    list = list.filter((d) => d.format.toUpperCase() === format.toUpperCase());
  }

  return NextResponse.json({
    success: true,
    count: list.length,
    documents: list,
  });
}

/**
 * POST /api/documents
 * Yangi hujjat faylini Cloudflare R2 ga yuklash (pdf yoki docx)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentId = formData.get("documentId") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Fayl biriktirilmadi." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${documentId || "doc"}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const uploadResult = await uploadToR2(
      buffer,
      fileName,
      file.type || "application/pdf",
      "documents"
    );

    return NextResponse.json({
      success: true,
      message: "Fayl muvaffaqiyatli yuklandi.",
      url: uploadResult.url,
      key: uploadResult.key,
      bucket: uploadResult.bucket,
    });
  } catch (error: any) {
    console.error("Cloudflare R2 document upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Faylni yuklashda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
