"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle, Crop as CropIcon } from "lucide-react";
import { uploadFileToR2, deleteFileFromR2 } from "@/lib/r2-client";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import getCroppedImg from "@/lib/cropImage";

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string, key?: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
  label?: string;
  cropShape?: "rect" | "round";
  aspectRatio?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  folder = "gallery",
  className = "",
  label = "Rasm yuklash",
  cropShape = "rect",
  aspectRatio = 16 / 9,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(value || "");
  const [currentKey, setCurrentKey] = useState<string>("");

  // Crop states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllarini yuklashingiz mumkin.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      const initialCrop = centerAspectCrop(width, height, aspectRatio);
      setCrop(initialCrop);
    }
  };

  const handleCropAndUpload = async () => {
    if (!imageSrc || !completedCrop || !imgRef.current) return;

    setLoading(true);
    setError(null);
    const imgSrcToCrop = imageSrc;
    setImageSrc(null); // Close crop modal early for better UX

    try {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const croppedFile = await getCroppedImg(imgSrcToCrop, pixelCrop);
      if (!croppedFile) throw new Error("Rasmni kesishda xatolik yuz berdi.");

      const result = await uploadFileToR2(croppedFile, folder);
      setCurrentUrl(result.url);
      setCurrentKey(result.key);
      if (onChange) {
        onChange(result.url, result.key);
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err?.message || "Rasm yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUrl && !currentKey) return;

    if (!confirm("Rasm haqiqatan ham Cloudflare R2 dan o'chirilsinmi?")) {
      return;
    }

    setLoading(true);
    try {
      if (currentKey || currentUrl) {
        await deleteFileFromR2(currentKey || currentUrl);
      }
      setCurrentUrl("");
      setCurrentKey("");
      if (onRemove) {
        onRemove();
      } else if (onChange) {
        onChange("", "");
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError(err?.message || "O'chirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}

      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 transition-all hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 group">
        {currentUrl ? (
          <div className={`relative w-full rounded-lg overflow-hidden border border-slate-200 group-hover:shadow-md transition ${cropShape === "round" ? "aspect-square rounded-full max-w-[200px] mx-auto" : "aspect-video"}`}>
            <img
              src={currentUrl}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition transform hover:scale-105 shadow-lg"
                title="R2 dan o'chirish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-6 cursor-pointer text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <span className="text-xs font-medium text-slate-600">Yuklanmoqda...</span>
              </div>
            ) : (
              <>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Rasm faylini tanlang yoki shu yerga tashlang</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, GIF (Max 25MB)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
      {currentUrl && (
        <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono truncate">
          <CheckCircle className="w-3 h-3 shrink-0" />
          R2 URL: {currentUrl}
        </p>
      )}

      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/80 p-4 sm:p-8 items-center justify-center">
          <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 w-full max-w-2xl flex flex-col items-center justify-center shadow-2xl">
            <div className="text-slate-200 text-sm font-medium mb-4 text-center">
              Rasmni ixtiyoriy shaklda (vertikal yoki gorizontal) kesib olishingiz mumkin
            </div>
            <div className="relative min-h-[200px] max-h-[50vh] flex items-center justify-center bg-black/30 rounded-xl overflow-hidden mb-6 w-full">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                circularCrop={cropShape === "round"}
                className="max-h-[50vh] max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageSrc}
                  onLoad={onImageLoad}
                  className="max-h-[50vh] object-contain w-auto h-auto rounded"
                />
              </ReactCrop>
            </div>
            
            <div className="flex items-center justify-between w-full gap-3 sm:gap-4 flex-col sm:flex-row">
              <button
                onClick={() => setImageSrc(null)}
                className="w-full sm:w-auto px-6 py-2.5 text-slate-200 font-medium hover:bg-white/10 rounded-xl transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCropAndUpload}
                disabled={!completedCrop?.width || !completedCrop?.height}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-emerald-600 text-white font-medium hover:bg-emerald-500 rounded-xl transition shadow-lg disabled:opacity-50"
              >
                <CropIcon className="w-4 h-4" />
                Kesish va Yuklash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
