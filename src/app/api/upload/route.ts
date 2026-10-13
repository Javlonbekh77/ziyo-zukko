import { NextRequest, NextResponse } from "next/server";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

// Maximum allowed size per file: 25 MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * POST /api/upload
 * Form-data orqali yuklangan fayllarni Cloudflare R2 ga joylaydi.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folder = (formData.get("folder") as string) || "images";
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      // Shuningdek "files" key bilan ham tekshiramiz
      const altFiles = formData.getAll("files") as File[];
      if (altFiles && altFiles.length > 0) {
        files.push(...altFiles);
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "Hech qanday fayl tanlanmagan." },
        { status: 400 }
      );
    }

    const uploadedResults = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `"${file.name}" faylining hajmi 25MB dan katta.`,
          },
          { status: 400 }
        );
      }

      // Safe filename generation
      const originalName = file.name || "file";
      const ext = originalName.includes(".") ? originalName.split(".").pop() : "bin";
      const sanitizedName = `${Date.now()}-${uuidv4()}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadToR2(
        buffer,
        sanitizedName,
        file.type || "application/octet-stream",
        folder
      );

      uploadedResults.push({
        url: result.url,
        key: result.key,
        originalName: originalName,
        size: file.size,
        type: file.type,
      });
    }

    // Bitta fayl bo'lsa bitta ob'yekt ham qaytaramiz
    return NextResponse.json({
      success: true,
      data: uploadedResults.length === 1 ? uploadedResults[0] : uploadedResults,
      files: uploadedResults,
      url: uploadedResults[0]?.url,
      key: uploadedResults[0]?.key,
    });
  } catch (error: any) {
    console.error("API /api/upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Fayl yuklashda server xatoligi yuz berdi.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * R2 dagi faylni key yoki URL orqali o'chiradi.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, url } = body || {};

    const targetKey = key || url;

    if (!targetKey) {
      return NextResponse.json(
        { success: false, error: "O'chirish uchun 'key' yoki 'url' kiritilmagan." },
        { status: 400 }
      );
    }

    await deleteFromR2(targetKey);

    return NextResponse.json({
      success: true,
      message: "Fayl muvaffaqiyatli o'chirildi.",
    });
  } catch (error: any) {
    console.error("API /api/upload DELETE error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Faylni o'chirishda xatolik yuz berdi.",
      },
      { status: 500 }
    );
  }
}
