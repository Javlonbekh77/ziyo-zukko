"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, BarChart3, Save, RotateCcw } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc 
} from "firebase/firestore";
import { setLocalCache } from "@/lib/cache";

export interface StatItem {
  id: string;
  value: number;
  suffix: string;
  title: string;
  subtitle: string;
  order: number;
}

const defaultStatsList: Omit<StatItem, "id">[] = [
  {
    value: 120,
    suffix: "+",
    title: "Sertifikat olgan o'quvchilar",
    subtitle: "IELTS, SAT va fan sertifikatlari",
    order: 1,
  },
  {
    value: 185,
    suffix: "+",
    title: "DTM o'rtacha bali",
    subtitle: "Kirish imtihonlari uchun kuchli tayyorgarlik",
    order: 2,
  },
  {
    value: 96,
    suffix: "%",
    title: "Bitiruvchilar natijasi",
    subtitle: "Tanlagan yo'nalishiga muvaffaqiyatli o'tdi",
    order: 3,
  },
];

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit / Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState<number>(100);
  const [suffix, setSuffix] = useState<string>("+");
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");
  const [order, setOrder] = useState<number>(1);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      if (!db) return;
      const q = query(collection(db, "stats"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStats([]);
      } else {
        const fetched: StatItem[] = [];
        snapshot.forEach((d) => {
          fetched.push({ id: d.id, ...d.data() } as StatItem);
        });
        setStats(fetched);
        setLocalCache("site_stats", fetched);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setValue(100);
    setSuffix("+");
    setTitle("");
    setSubtitle("");
    setOrder(stats.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StatItem) => {
    setEditingId(item.id);
    setValue(item.value);
    setSuffix(item.suffix);
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setOrder(item.order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Iltimos, sarlavhani kiriting!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const statData = {
        value: Number(value) || 0,
        suffix: suffix || "",
        title: title.trim(),
        subtitle: subtitle.trim(),
        order: Number(order) || 1,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        const docRef = doc(db, "stats", editingId);
        await updateDoc(docRef, statData);
        const updated = stats.map((s) => (s.id === editingId ? { ...s, ...statData } : s));
        updated.sort((a, b) => a.order - b.order);
        setStats(updated);
        setLocalCache("site_stats", updated);
      } else {
        const docRef = await addDoc(collection(db, "stats"), {
          ...statData,
          createdAt: new Date().toISOString(),
        });
        const updated = [...stats, { id: docRef.id, ...statData }];
        updated.sort((a, b) => a.order - b.order);
        setStats(updated);
        setLocalCache("site_stats", updated);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving stat:", err);
      alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: StatItem) => {
    if (!confirm(`Haqiqatan ham "${item.title}" ko'rsatkichini o'chirmoqchimisiz?`)) return;
    try {
      if (!db) return;
      await deleteDoc(doc(db, "stats", item.id));
      const filtered = stats.filter((s) => s.id !== item.id);
      setStats(filtered);
      setLocalCache("site_stats", filtered);
    } catch (err) {
      console.error("Error deleting stat:", err);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Barcha ko'rsatkichlarni standart qiymatlarga qaytarmoqchimisiz?")) return;
    setIsLoading(true);
    try {
      if (!db) return;
      // Delete existing
      for (const s of stats) {
        await deleteDoc(doc(db, "stats", s.id));
      }
      // Re-seed defaults
      const seeded: StatItem[] = [];
      for (const item of defaultStatsList) {
        const docRef = await addDoc(collection(db, "stats"), item);
        seeded.push({ id: docRef.id, ...item });
      }
      setStats(seeded);
      setLocalCache("site_stats", seeded);
      alert("Standart ko'rsatkichlar qayta tiklandi!");
    } catch (err) {
      console.error("Error resetting defaults:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#ff6b00]" />
            "Natijalar o'zi gapiradi" — Statistika ko'rsatkichlari
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Asosiy sahifadagi sertifikatlar, kirish foizi va o'quvchilar yutuqlari sonlarini tahrirlang.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="Standart holatga qaytarish"
          >
            <RotateCcw className="w-4 h-4" />
            Standart
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Yangi ko'rsatkich qo'shish
          </button>
        </div>
      </div>

      {/* Live Preview Cards */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs uppercase font-bold text-[#ff6b00] tracking-wider">
              Jonli ko'rinish (Asosiy sahifa)
            </span>
            <h3 className="text-xl font-bold mt-1">Natijalar o'zlari gapiradi</h3>
          </div>
          <span className="text-xs px-3 py-1 bg-white/10 rounded-full text-slate-300">
            {stats.length} ta ko'rsatkich
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative group hover:border-[#ff6b00]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <span className="text-5xl font-black text-[#ff6b00] tracking-tight">
                  {item.value}
                  {item.suffix}
                </span>
                <span className="text-xs font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded-md">
                  #{item.order}
                </span>
              </div>
              <h4 className="font-bold text-base text-white mt-3">{item.title}</h4>
              <p className="text-xs text-white/60 mt-1">{item.subtitle}</p>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add Modal with smoothly scrollable body */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingId ? "Ko'rsatkichni tahrirlash" : "Yangi ko'rsatkich qo'shish"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Son qiymati (Raqam)
                    </label>
                    <input
                      type="number"
                      required
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff6b00] outline-none font-bold text-lg"
                      placeholder="Masalan: 120"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Belgisi (Suffix)
                    </label>
                    <input
                      type="text"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff6b00] outline-none font-bold text-lg"
                      placeholder="Masalan: +, % yoki ta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sarlavha (Nomi)
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff6b00] outline-none font-semibold text-sm"
                    placeholder="Masalan: Sertifikat olgan o'quvchilar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Izoh (Kichik matn)
                  </label>
                  <textarea
                    rows={2}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff6b00] outline-none text-sm resize-none"
                    placeholder="Masalan: IELTS, SAT va fan sertifikatlari"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tartib raqami (Ketma-ketlik)
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff6b00] outline-none text-sm"
                    placeholder="1, 2, 3..."
                  />
                </div>
              </div>

              {/* Pinned Footer with Action Buttons - Always Visible */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm disabled:opacity-50"
                >
                  {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
