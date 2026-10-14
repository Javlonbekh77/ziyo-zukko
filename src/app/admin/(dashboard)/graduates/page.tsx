"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface Graduate {
  id: string;
  name: string;
  university: string;
  year: string;
  imageUrl: string;
  r2Key?: string;
  notes?: string;
}

export default function GraduatesPage() {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [imageUrl, setImageUrl] = useState("");
  const [r2Key, setR2Key] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchGraduates();
  }, []);

  const fetchGraduates = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        console.error("Firebase db is not initialized");
        return;
      }
      const q = query(collection(db, "graduates"), orderBy("year", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedGraduates: Graduate[] = [];
      querySnapshot.forEach((doc) => {
        fetchedGraduates.push({ id: doc.id, ...doc.data() } as Graduate);
      });
      setGraduates(fetchedGraduates);
    } catch (error) {
      console.error("Error fetching graduates: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGraduates = graduates.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (grad: Graduate) => {
    setEditingId(grad.id);
    setName(grad.name);
    setUniversity(grad.university);
    setYear(grad.year);
    setImageUrl(grad.imageUrl);
    setR2Key(grad.r2Key || "");
    setNotes(grad.notes || "");
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !university || !imageUrl) {
      alert("Iltimos, ism, OTM va rasmni to'liq kiriting!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const gradData = {
        name,
        university,
        year: year || "2024",
        imageUrl,
        r2Key: r2Key || "",
        notes,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        // Tahrirlash
        const docRef = doc(db, "graduates", editingId);
        await updateDoc(docRef, gradData);
        setGraduates(graduates.map(g => g.id === editingId ? { ...g, ...gradData } : g));
      } else {
        // Yangi qo'shish
        const newGradData = { ...gradData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "graduates"), newGradData);
        setGraduates([{ id: docRef.id, ...newGradData }, ...graduates]);
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

  const handleDelete = async (grad: Graduate) => {
    if (!confirm(`"${grad.name}" bitiruvchisini o'chirishga ishonchingiz komilmi?`)) return;

    if (grad.r2Key || grad.imageUrl.includes("cloudflarestorage.com") || grad.imageUrl.includes("r2.dev")) {
      try {
        await deleteFileFromR2(grad.r2Key || grad.imageUrl);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "graduates", grad.id));
      setGraduates(graduates.filter((g) => g.id !== grad.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setUniversity("");
    setYear(new Date().getFullYear().toString());
    setImageUrl("");
    setR2Key("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bitiruvchilar</h1>
          <p className="text-slate-500 text-sm mt-1">Maktabimiz faxrli bitiruvchilari ro'yxati</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Ism yoki OTM bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Rasm</th>
                <th className="p-4 font-medium">Ism Familiya</th>
                <th className="p-4 font-medium">Oliygoh (OTM)</th>
                <th className="p-4 font-medium">Yil</th>
                <th className="p-4 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredGraduates.length > 0 ? (
                filteredGraduates.map((grad) => (
                  <tr key={grad.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 relative bg-slate-100">
                        <img src={grad.imageUrl} alt={grad.name} className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{grad.name}</td>
                    <td className="p-4 text-slate-600">{grad.university}</td>
                    <td className="p-4 text-slate-600">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {grad.year}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => handleOpenEdit(grad)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(grad)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Ma'lumot topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] my-auto flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingId ? "Bitiruvchini tahrirlash" : "Yangi bitiruvchi qo'shish"}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleAddOrEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4">
                <ImageUploader
                  label="Bitiruvchi rasmi (Cloudflare R2 storage)"
                  folder="graduates"
                  value={imageUrl}
                  cropShape="round"
                  aspectRatio={1}
                  onChange={(url, key) => {
                    setImageUrl(url);
                    if (key) setR2Key(key);
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ism va Familiya</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                    placeholder="Masalan: Aliyev Vali" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Oliygoh nomi (OTM)</label>
                  <input 
                    type="text" 
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                    placeholder="Masalan: TATU" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">O'qishga kirgan yili</label>
                  <input 
                    type="text" 
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                    placeholder="Masalan: 2024" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qo'shimcha izoh (ixtiyoriy)</label>
                  <textarea 
                    rows={3} 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none" 
                    placeholder="Bitiruvchi haqida qisqacha..."
                  ></textarea>
                </div>
              </div>

              {/* Pinned Footer with Action Buttons - Always Visible */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm flex justify-end items-center gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }} 
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 text-white font-bold rounded-lg shadow-md transition-colors cursor-pointer ${
                    isSaving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
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
