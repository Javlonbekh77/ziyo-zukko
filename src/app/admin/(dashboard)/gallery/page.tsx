"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

interface GalleryImage {
  id: string;
  imageUrl: string;
  description: string;
}

const MOCK_DATA: GalleryImage[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400",
    description: "Maktabimizning birinchi qo'ng'iroq tadbiri",
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400",
    description: "Ochiq dars jarayoni",
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400",
    description: "Laboratoriya mashg'ulotlari",
  },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(MOCK_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maktab Hayotidan Lavhalar</h1>
          <p className="text-slate-500 text-sm mt-1">Galereya va rasmlar to'plami</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Rasm qo'shish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img) => (
          <div key={img.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              <img 
                src={img.imageUrl} 
                alt={img.description} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors transform translate-y-4 group-hover:translate-y-0">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Galereyaga rasm qo'shish</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rasm (Supabase)</label>
                  <div className="mt-1 relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img 
                      src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400&h=300" 
                      alt="Sample preview" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <div className="text-center text-white">
                        <Plus className="mx-auto h-8 w-8 mb-1" />
                        <span className="text-sm font-medium">Rasmni o'zgartirish</span>
                      </div>
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qisqacha izoh</label>
                  <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" placeholder="Rasm haqida..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
                Bekor qilish
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors">
                Yuklash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
