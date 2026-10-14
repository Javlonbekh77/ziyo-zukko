"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Globe, 
  MapPin, 
  GraduationCap,
  ExternalLink,
  Award
} from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

export interface UniversityItem {
  id: string;
  name: string;
  type: string;
  country: string;
  city?: string;
  website?: string;
  logoUrl?: string;
  r2Key?: string;
  description?: string;
  ranking?: string;
  createdAt?: string;
  updatedAt?: string;
}

const INSTITUTION_TYPES = [
  "Universitet",
  "Institut",
  "Akademiya",
  "Xalqaro Maktab",
  "Litsey / Kollej",
  "Boshqa"
];

const POPULAR_COUNTRIES = [
  "O'zbekiston",
  "AQSH (USA)",
  "Buyuk Britaniya (UK)",
  "Germaniya",
  "Janubiy Koreya",
  "Turkiya",
  "Kanada",
  "Rossiya",
  "Yaponiya",
  "Boshqa"
];

export default function AdminUniversitiesPage() {
  const [institutions, setInstitutions] = useState<UniversityItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("Universitet");
  const [country, setCountry] = useState("O'zbekiston");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [r2Key, setR2Key] = useState("");
  const [description, setDescription] = useState("");
  const [ranking, setRanking] = useState("");

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    try {
      const colRef = collection(db, "universities");
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: UniversityItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as UniversityItem[];
            // Sort by name or createdAt
            fetched.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            setInstitutions(fetched);
          } else {
            setInstitutions([]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Firestore universities listener error:", error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }, []);

  const filteredInstitutions = institutions.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.country || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesCountry = countryFilter === "all" || item.country === countryFilter;

    return matchesSearch && matchesType && matchesCountry;
  });

  const handleOpenEdit = (item: UniversityItem) => {
    setEditingId(item.id);
    setName(item.name || "");
    setType(item.type || "Universitet");
    setCountry(item.country || "O'zbekiston");
    setCity(item.city || "");
    setWebsite(item.website || "");
    setLogoUrl(item.logoUrl || "");
    setR2Key(item.r2Key || "");
    setDescription(item.description || "");
    setRanking(item.ranking || "");
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Iltimos, ta'lim muassasasi nomini kiriting!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const itemData = {
        name: name.trim(),
        type,
        country,
        city: city.trim(),
        website: website.trim(),
        logoUrl,
        r2Key: r2Key || "",
        description: description.trim(),
        ranking: ranking.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        const docRef = doc(db, "universities", editingId);
        await updateDoc(docRef, itemData);
      } else {
        const newDocData = {
          ...itemData,
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, "universities"), newDocData);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving university:", error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: UniversityItem) => {
    if (!confirm(`"${item.name}" ta'lim muassasasini o'chirishga ishonchingiz komilmi?`)) {
      return;
    }

    if (item.r2Key) {
      try {
        await deleteFileFromR2(item.r2Key);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "universities", item.id));
    } catch (error) {
      console.error("Error deleting university:", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setType("Universitet");
    setCountry("O'zbekiston");
    setCity("");
    setWebsite("");
    setLogoUrl("");
    setR2Key("");
    setDescription("");
    setRanking("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Ta&apos;lim Muassasalari
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bitiruvchilar va o&apos;quvchilarimiz kirgan barcha nufuzli universitetlar, institutlar va akademiyalar
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-semibold text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Yangi muassasa qo&apos;shish
        </button>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Nomi, davlati yoki shahri bo'yicha izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Barcha turlar ({institutions.length})</option>
            {INSTITUTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t} ({institutions.filter((i) => i.type === t).length})
              </option>
            ))}
          </select>

          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Barcha davlatlar</option>
            {Array.from(new Set(institutions.map((i) => i.country).filter(Boolean))).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Institutions */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="font-medium">Ta&apos;lim muassasalari yuklanmoqda...</p>
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Hech qanday ta&apos;lim muassasasi topilmadi</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto mb-6">
            Yangi universitet yoki institut qo&apos;shish uchun yuqoridagi tugmani bosing.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            Muassasa qo&apos;shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Header row: Logo / Icon & Badges */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 overflow-hidden">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.type || "Universitet"}
                    </span>
                    {item.ranking && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        {item.ranking}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {item.country}
                    {item.city ? `, ${item.city}` : ""}
                  </span>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Website Link */}
                {item.website && (
                  <a
                    href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline mt-3"
                  >
                    <Globe className="w-3 h-3" />
                    {item.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                  </a>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal with Pinned Footer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[88vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? "Ta'lim muassasasini tahrirlash" : "Yangi ta'lim muassasasi qo'shish"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddOrEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4">
                {/* Institution Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Muassasa nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Garvard Universiteti, Westminster, O'zMU..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* Type & Country Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Muassasa turi
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      {INSTITUTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Davlat
                    </label>
                    <input
                      type="text"
                      list="country-suggestions"
                      placeholder="Masalan: O'zbekiston, AQSH..."
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <datalist id="country-suggestions">
                      {POPULAR_COUNTRIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* City & Ranking Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Shahar (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Toshkent, London, Boston..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Reyting yoki belgi (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: TOP-50, QS 2026, Davlat granti..."
                      value={ranking}
                      onChange={(e) => setRanking(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rasmiy veb-sayt (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Qisqacha ma&apos;lumot yoki izoh
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Muassasa haqida qisqacha ma'lumot..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Logo Image Uploader */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Muassasa logotipi yoki binosi rasmi (ixtiyoriy)
                  </label>
                  <ImageUploader
                    value={logoUrl}
                    onChange={(url, key) => {
                      setLogoUrl(url);
                      if (key) setR2Key(key);
                    }}
                    folder="universities"
                    aspectRatio="square"
                  />
                </div>
              </div>

              {/* Pinned Footer with Action Buttons - Always Visible */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
