"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, Edit2 } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface GalleryImage {
  id: string;
  imageUrl: string;
  description: string;
  r2Key?: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newR2Key, setNewR2Key] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        console.error("Firebase db is not initialized");
        return;
      }
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedImages: GalleryImage[] = [];
      querySnapshot.forEach((doc) => {
        fetchedImages.push({ id: doc.id, ...doc.data() } as GalleryImage);
      });
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching gallery: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (img: GalleryImage) => {
    setEditingId(img.id);
    setNewImageUrl(img.imageUrl);
    setNewR2Key(img.r2Key || "");
    setDescription(img.description || "");
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) {
      alert("Iltimos, avval rasm yuklang!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const imgData = {
        imageUrl: newImageUrl,
        r2Key: newR2Key || "",
        description: description || "Yangi rasm",
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        // Tahrirlash
        const docRef = doc(db, "gallery", editingId);
        await updateDoc(docRef, imgData);
        setImages(images.map(img => img.id === editingId ? { ...img, ...imgData } : img));
      } else {
        // Yangi qo'shish
        const newImgData = { ...imgData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "gallery"), newImgData);
        setImages([{ id: docRef.id, ...newImgData }, ...images]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (img: GalleryImage) => {
    if (!confirm("Ushbu rasmni galereyadan o'chirishni xohlaysizmi?")) return;

    if (img.r2Key || img.imageUrl.includes("cloudflarestorage.com") || img.imageUrl.includes("r2.dev")) {
      try {
        await deleteFileFromR2(img.r2Key || img.imageUrl);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "gallery", img.id));
      setImages(images.filter((item) => item.id !== img.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNewImageUrl("");
    setNewR2Key("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maktab Hayotidan Lavhalar</h1>
          <p className="text-slate-500 text-sm mt-1">Galereya va rasmlar to'plami</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Yangi Rasm qo'shish</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                <img 
                  src={img.imageUrl} 
                  alt={img.description} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => handleOpenEdit(img)}
                    className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors transform translate-y-4 group-hover:translate-y-0"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteImage(img)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors transform translate-y-4 group-hover:translate-y-0"
                    title="O'chirish"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-700 line-clamp-2">{img.description || "Izohsiz rasm"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
          Galereya bo'sh.
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh] my-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Rasmni tahrirlash" : "Galereyaga rasm qo'shish"}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrEdit} className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
              <ImageUploader
                label="Rasm fayli (Cloudflare R2 ga yuklanadi)"
                folder="gallery"
                value={newImageUrl}
                aspectRatio={4 / 3}
                onChange={(url, key) => {
                  setNewImageUrl(url);
                  if (key) setNewR2Key(key);
                }}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qisqacha izoh</label>
                <textarea 
                  rows={3} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none" 
                  placeholder="Rasm haqida..."
                ></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }} 
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !newImageUrl}
                  className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                    isSaving || !newImageUrl ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
