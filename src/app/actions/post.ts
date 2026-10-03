"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20 MB

export async function createPostAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const tagsStr = formData.get("tags") as string;
    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()) : [];
    
    const files = formData.getAll("files") as File[];
    const pdfs = formData.getAll("pdfs") as File[];
    
    // Validation
    if (!title || !content) {
      return { success: false, error: "Sarlavha va matn kiritilishi shart." };
    }
    
    const imageUrls: string[] = [];
    let pdfUrl: string | null = null;
    
    // Cloudflare R2 bucket name
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    
    if (!bucketName || !publicUrl) {
      throw new Error("R2_BUCKET_NAME yoki NEXT_PUBLIC_R2_PUBLIC_URL .env.local faylida sozlanmagan");
    }

    // Rasmlarni yuklash (max 100)
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      
      const ext = file.name.split(".").pop();
      const fileName = `images/${Date.now()}-${uuidv4()}.${ext}`;
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      });
      
      await r2Client.send(command);
      
      imageUrls.push(`${publicUrl}/${fileName}`);
    }
    
    // PDF faylini yuklash (max 20MB)
    if (pdfs.length > 0) {
      const pdf = pdfs[0];
      if (pdf.type === "application/pdf") {
        if (pdf.size > MAX_PDF_SIZE) {
          return { success: false, error: "PDF fayl hajmi 20MB dan oshmasligi kerak." };
        }
        
        const ext = pdf.name.split(".").pop();
        const fileName = `documents/${Date.now()}-${uuidv4()}.${ext}`;
        
        const arrayBuffer = await pdf.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: pdf.type,
        });
        
        await r2Client.send(command);
        
        pdfUrl = `${publicUrl}/${fileName}`;
      }
    }
    
    if (!db) {
      throw new Error("Firebase Firestore sozlanmagan.");
    }
    
    // Firestore'ga saqlash
    const postData = {
      title,
      content,
      tags,
      imageUrls,
      pdfUrl,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "posts"), postData);
    
    return { 
      success: true, 
      data: { id: docRef.id, ...postData, createdAt: new Date() } 
    };
  } catch (error: any) {
    console.error("Fayl yuklashda yoki saqlashda xatolik:", error);
    return { 
      success: false, 
      error: error?.message || "Noma'lum xatolik yuz berdi" 
    };
  }
}
