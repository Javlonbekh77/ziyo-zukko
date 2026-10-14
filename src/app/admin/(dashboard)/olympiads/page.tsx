"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Edit2, Eye, EyeOff } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { setLocalCache } from "@/lib/cache";

interface OlympiadWinner {
  id: string;
  name: string;
  subject: string;
  result: string;
  imageUrl: string;
  r2Key?: string;
  showOnHome?: boolean;
}

export default function OlympiadsPage() {
  const [winners, setWinners] = useState<OlympiadWinner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [result, setResult] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [r2Key, setR2Key] = useState("");
  const [showOnHome, setShowOnHome] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        console.error("Firebase db is not initialized");
        return;
      }
      const q = query(collection(db, "olympiads"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedWinners: OlympiadWinner[] = [];
      querySnapshot.forEach((doc) => {
        fetchedWinners.push({ id: doc.id, ...doc.data() } as OlympiadWinner);
      });
      setWinners(fetchedWinners);
      setLocalCache("olympiads_cache", fetchedWinners);
    } catch (error) {
      console.error("Error fetching olympiads: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWinners = winners.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (winner: OlympiadWinner) => {
    setEditingId(winner.id);
    setName(winner.name);
    setSubject(winner.subject);
    setResult(winner.result);
    setImageUrl(winner.imageUrl);
    setR2Key(winner.r2Key || "");
    setShowOnHome(winner.showOnHome !== false);
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !imageUrl) {
      alert("Iltimos, o'quvchi ismi, fan nomi va rasmni to'liq kiriting!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const winnerData = {
        name,
        subject,
        result: result || "Ishtirokchi",
        imageUrl,
        r2Key: r2Key || "",
        showOnHome: Boolean(showOnHome),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        // Tahrirlash
        const docRef = doc(db, "olympiads", editingId);
        await updateDoc(docRef, winnerData);
        const updated = winners.map(w => w.id === editingId ? { ...w, ...winnerData } : w);
        setWinners(updated);
        setLocalCache("olympiads_cache", updated);
      } else {
        // Yangi qo'shish
        const newWinnerData = { ...winnerData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "olympiads"), newWinnerData);
        const updated = [{ id: docRef.id, ...newWinnerData }, ...winners];
        setWinners(updated);
        setLocalCache("olympiads_cache", updated);
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

  const handleDelete = async (winner: OlympiadWinner) => {
    if (!confirm(`"${winner.name}" ma'lumotini o'chirishga ishonchingiz komilmi?`)) return;

    if (winner.r2Key || winner.imageUrl.includes("cloudflarestorage.com") || winner.imageUrl.includes("r2.dev")) {
      try {
        await deleteFileFromR2(winner.r2Key || winner.imageUrl);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "olympiads", winner.id));
      const updated = winners.filter((w) => w.id !== winner.id);
      setWinners(updated);
      setLocalCache("olympiads_cache", updated);
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSubject("");
    setResult("");
    setImageUrl("");
    setR2Key("");
    setShowOnHome(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olimpiadachilar</h1>
          <p className="text-slate-500 text-sm mt-1">
            Olimpiada g'oliblari va qatnashchilari boshqaruvi
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
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
              placeholder="Ism yoki Fan bo'yicha qidirish..."
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
                <th className="p-4 font-medium w-24">Rasm</th>
                <th className="p-4 font-medium">O'quvchi</th>
                <th className="p-4 font-medium">Fan</th>
                <th className="p-4 font-medium">Natija</th>
                <th className="p-4 font-medium">Asosiy sahifada</th>
                <th className="p-4 font-medium text-right w-32">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredWinners.length > 0 ? (
                filteredWinners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 relative bg-slate-100">
                        <img src={winner.imageUrl} alt={winner.name} className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{winner.name}</td>
                    <td className="p-4 text-slate-600">{winner.subject}</td>
                    <td className="p-4 text-slate-600">
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                        {winner.result}
                      </span>
                    </td>
                    <td className="p-4">
                      {winner.showOnHome !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Eye className="w-3 h-3" /> Ha (Bosh sahifa)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          <EyeOff className="w-3 h-3" /> Faqat to'liq ro'yxatda
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => handleOpenEdit(winner)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(winner)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Ma'lumot topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smoothly Scrollable Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingId ? "Olimpiadachini tahrirlash" : "Yangi olimpiadachi qo'shish"}
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
              <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4">
                <ImageUploader
                  label="O'quvchi rasmi (Cloudflare R2 storage)"
                  folder="olympiads"
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
                    placeholder="Masalan: Toshmatov Eshmat" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fan</label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                    placeholder="Masalan: Matematika" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Natija (O'rin)</label>
                  <input 
                    type="text" 
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                    placeholder="Masalan: Viloyat bosqichi 1-o'rin" 
                  />
                </div>

                {/* Home page visibility toggle */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <input 
                    type="checkbox"
                    id="showOnHomeCheckbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
                  />
                  <label htmlFor="showOnHomeCheckbox" className="text-sm cursor-pointer select-none">
                    <span className="font-bold text-slate-900 block">
                      Asosiy sahifada ko'rinsinmi?
                    </span>
                    <span className="text-slate-600 text-xs block mt-0.5">
                      Agar belgilansa, bosh sahifada (maksimum 3 ta tanlangan) ko'rinadi. Belgilanmasa — faqat "Barchasini ko'rish" sahifasida turadi.
                    </span>
                  </label>
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
