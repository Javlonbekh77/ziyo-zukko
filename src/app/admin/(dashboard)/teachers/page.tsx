"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Edit2, GraduationCap, Award, BookOpen, RotateCcw } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export interface TeacherItem {
  id: string;
  name: string;
  role: string;
  category: "leadership" | "primary" | "exact" | "languages" | "it";
  highlight: string;
  imageUrl: string;
  r2Key?: string;
  bullets: string[];
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  { id: "leadership", label: "Rahbariyat (Direktor, O'quv ishlari, Tarbiya va b.)" },
  { id: "primary", label: "Boshlang'ich ta'lim" },
  { id: "exact", label: "Aniq fanlar" },
  { id: "languages", label: "Chet tillari" },
  { id: "it", label: "IT va Robototexnika" },
];

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [category, setCategory] = useState<"leadership" | "primary" | "exact" | "languages" | "it">("leadership");
  const [highlight, setHighlight] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [r2Key, setR2Key] = useState("");
  const [bulletsText, setBulletsText] = useState("");

const defaultSeedStaff: Omit<TeacherItem, "id">[] = [
  {
    name: "Rahimov Anvarbek",
    role: "Maktab Direktori",
    category: "leadership",
    highlight: "Strategik boshqaruv",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Oliy toifali rahbar va tajribali pedagog",
      "Ta'lim sohasida 20 yildan ortiq boshqaruv va strategik tajriba",
      "Ziyo-Zukko zamonaviy ta'lim tizimi va rivojlanish dasturi asoschisi"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    name: "Karimova Dilfuza",
    role: "O'quv ishlari mudiri",
    category: "leadership",
    highlight: "Akademik mukammallik",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Nizomiy nomidagi TDPU magistri, metodist",
      "O'quv rejalari va xalqaro baholash standartlari koordinatori",
      "15 yillik uzluksiz o'quv-metodik boshqaruv tajribasi"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    name: "Yusupov Jamshid",
    role: "Ta'lim-tarbiya mudiri",
    category: "leadership",
    highlight: "Ma'naviyat va tarbiya",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "O'quvchilar ma'naviy-axloqiy tarbiyasi va ijtimoiy faollik yetakchisi",
      "Psixologik qo'llab-quvvatlash va sog'lom jamoaviy muhit koordinatori",
      "12 yillik yoshlar bilan ishlash va pedagogik tajriba"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    name: "Otajonova Yaqutxon",
    role: "Boshlang'ich rus sinf o'qituvchisi",
    category: "primary",
    highlight: "33 yillik pedagog",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "G'afur G'ulom nomidagi Toshkent davlat pedagogika instituti bitiruvchisi",
      "Oliy toifali tajribali pedagog",
      "350 dan ortiq boshlang'ich sinf o'quvchilarini bitirgan",
      "2023-2024 o'quv yilida 4 nafar o'quvchisi Prezident maktabiga kirdi"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    name: "Qo'chqarov Bahriddin",
    role: "Ingliz tili o'qituvchisi",
    category: "languages",
    highlight: "CELTA sertifikati",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Oliy ma'lumotli, Toshkent davlat sharqshunoslik universiteti bitiruvchisi",
      "Xalqaro CELTA sertifikat egasi",
      "Tajribasi: 11 yil pedagogik va metodik amaliyot",
      "Yaponiyaning Tokio davlat maktabida ham faoliyat yuritgan"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    name: "Shahnoza Mirzapo'latova",
    role: "Boshlang'ich o'zbek sinf rahbari",
    category: "primary",
    highlight: "27 yillik pedagog",
    imageUrl: "https://images.unsplash.com/photo-1580894732413-a75151636358?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "G'afur G'ulom nomidagi Toshkent davlat pedagogika universiteti",
      "Oliy toifali ustoz va metodist",
      "Xalq ta'limi a'lochisi ko'krak nishoni sohibi",
      "Yilning eng yaxshi fan o'qituvchisi Respublika bosqichi g'olibi"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    name: "Muzaffarbekov Shohruhbek",
    role: "Informatika va AI o'qituvchisi",
    category: "it",
    highlight: "O'zbekcha robot yaratgan",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Raspberry Pi Foundation xalqaro kurslarini muvaffaqiyatli yakunlagan",
      "'How computers work' va 'Functions and algorithms' sertifikat egasi",
      "Lego League (FLL) xalqaro robototexnika musobaqasi murabbiysi"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    name: "Karimov Sherzodbek",
    role: "Matematika va AI murabbiysi",
    category: "exact",
    highlight: "Olimpiada Murabbiysi",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "O'zbekiston Milliy Universiteti magistri",
      "Xalqaro matematika musobaqasi (IMC) medal egalari ustoz-murabbiysi",
      "12 yillik fizika-matematika o'qitish va tadqiqot tajribasi"
    ],
    createdAt: new Date().toISOString(),
  }
];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      if (!db) return;
      const q = query(collection(db, "teachers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setTeachers([]);
      } else {
        const fetched: TeacherItem[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as TeacherItem);
        });
        setTeachers(fetched);
      }
    } catch (error) {
      console.warn("Ordered fetch failed, trying basic collection:", error);
      if (db) {
        try {
          const snapshot = await getDocs(collection(db, "teachers"));
          if (snapshot.empty) {
            setTeachers([]);
          } else {
            const fetched: TeacherItem[] = [];
            snapshot.forEach((doc) => {
              fetched.push({ id: doc.id, ...doc.data() } as TeacherItem);
            });
            setTeachers(fetched);
          }
        } catch (e) {
          console.error("Error fetching teachers:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreDefaultStaff = async () => {
    if (!confirm("Barcha standart rahbariyat va o'qituvchilarni bazaga qayta yuklamoqchimisiz?")) return;
    setIsLoading(true);
    try {
      if (!db) return;
      for (const t of teachers) {
        await deleteDoc(doc(db, "teachers", t.id));
      }
      const seeded: TeacherItem[] = [];
      for (const staff of defaultSeedStaff) {
        const docRef = await addDoc(collection(db, "teachers"), staff);
        seeded.push({ id: docRef.id, ...staff });
      }
      setTeachers(seeded);
      alert("Rahbariyat va o'qituvchilar jamoasi qayta yuklandi!");
    } catch (err) {
      console.error("Error restoring staff:", err);
      alert("Xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (t: TeacherItem) => {
    setEditingId(t.id);
    setName(t.name);
    setRole(t.role);
    setCategory(t.category);
    setHighlight(t.highlight || "");
    setImageUrl(t.imageUrl || "");
    setR2Key(t.r2Key || "");
    setBulletsText((t.bullets || []).join("\n"));
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !imageUrl) {
      alert("Iltimos, ustozning ismi, fani/lavozimi va rasmini to'liq kiriting!");
      return;
    }

    const bullets = bulletsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const teacherData = {
        name,
        role,
        category,
        highlight: highlight || "Malakali pedagog",
        imageUrl,
        r2Key: r2Key || "",
        bullets,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        const docRef = doc(db, "teachers", editingId);
        await updateDoc(docRef, teacherData);
        setTeachers(teachers.map((t) => (t.id === editingId ? { ...t, ...teacherData } : t)));
      } else {
        const newTeacherData = { ...teacherData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "teachers"), newTeacherData);
        setTeachers([{ id: docRef.id, ...newTeacherData }, ...teachers]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (t: TeacherItem) => {
    if (!confirm(`"${t.name}" ma'lumotini o'chirishga ishonchingiz komilmi?`)) return;

    if (t.r2Key || t.imageUrl.includes("cloudflarestorage.com") || t.imageUrl.includes("r2.dev")) {
      try {
        await deleteFileFromR2(t.r2Key || t.imageUrl);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "teachers", t.id));
      setTeachers(teachers.filter((item) => item.id !== t.id));
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setCategory("leadership");
    setHighlight("");
    setImageUrl("");
    setR2Key("");
    setBulletsText("");
  };

  const filteredTeachers = teachers
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.highlight && t.highlight.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Leadership always comes first
      const aIsLead = a.category === "leadership";
      const bIsLead = b.category === "leadership";
      if (aIsLead && !bIsLead) return -1;
      if (!aIsLead && bIsLead) return 1;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-teal-600" />
            Ustozlar (Bizning Jamoa)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Saytdagi "Bizning Jamoa" bo'limida ko'rinadigan o'qituvchilar va ularning yutuqlarini boshqarish
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRestoreDefaultStaff}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="Standart jamoani qayta tiklash"
          >
            <RotateCcw className="w-4 h-4" />
            Standart jamoani tiklash
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-semibold text-sm cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Yangi ustoz qo'shish
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Ustoz ismi, fani yoki unvoni bo'yicha izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Barchasi ({teachers.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label} ({teachers.filter((t) => t.category === cat.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-3" />
          <p className="font-medium">Ustozlar ro'yxati yuklanmoqda...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Hech qanday ustoz topilmadi</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto mb-6">
            Yangi o'qituvchi ma'lumotlarini qo'shish uchun yuqoridagi tugmani bosing.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition shadow-sm cursor-pointer"
          >
            Ustoz qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={t.imageUrl}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-3 left-3 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm ${
                  t.category === "leadership" ? "bg-gradient-to-r from-amber-500 to-orange-600" : "bg-black/60"
                }`}>
                  {t.category === "leadership" ? "👑 Rahbariyat" : (CATEGORIES.find((c) => c.id === t.category)?.label || t.category)}
                </div>
                {t.highlight && (
                  <div className={`absolute bottom-3 left-3 right-3 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl text-center ${
                    t.category === "leadership" ? "bg-amber-600/90" : "bg-teal-700/90"
                  }`}>
                    {t.highlight}
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-teal-600 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 mt-1 uppercase tracking-wider">
                    {t.role}
                  </p>

                  {t.bullets && t.bullets.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                      {t.bullets.slice(0, 3).map((b, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-teal-500 font-bold shrink-0">•</span>
                          <span className="line-clamp-1">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-slate-400">
                  <span className="text-[11px]">
                    {t.bullets ? `${t.bullets.length} ta yutuq` : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal with Guaranteed Smooth Scrolling */}
      {isModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-y-auto">
          <div data-lenis-prevent className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] my-auto flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? "Ustoz ma'lumotlarini tahrirlash" : "Yangi ustoz qo'shish"}
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

            {/* Modal Form */}
            <form onSubmit={handleAddOrEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div data-lenis-prevent className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4 custom-scrollbar" style={{ maxHeight: "calc(90vh - 135px)" }}>
                {/* Teacher Image */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Ustoz rasmi *
                  </label>
                  <ImageUploader
                    folder="teachers"
                    value={imageUrl}
                    onChange={(url, key) => {
                      setImageUrl(url);
                      if (key) setR2Key(key);
                    }}
                    onRemove={() => {
                      setImageUrl("");
                      setR2Key("");
                    }}
                    aspectRatio={4 / 5}
                    label="Ustoz fotosuratini yuklang (Cloudflare R2)"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Ism va Familiya *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Otajonova Yaqutxon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Role / Subject */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Fani yoki Lavozimi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Maktab direktori, O'quv ishlari mudiri, Matematika o'qituvchisi..."
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Yo'nalish / Toifasi *
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Highlight badge */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Asosiy tajriba yoki unvoni (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: 33 yillik pedagog, CELTA sertifikati, Olimpiada murabbiysi..."
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Achievements / Bullets */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Yutuqlari va ma'lumotlari (Har bir qatorda bitta fakt)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={`Toshkent davlat pedagogika universiteti bitiruvchisi\nOliy toifali ustoz va metodist\nPrezident maktabiga o'quvchilari kirgan`}
                    value={bulletsText}
                    onChange={(e) => setBulletsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-sans"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Har bir qatorga alohida bitta yutuq yoki ma'lumot yozing.
                  </p>
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
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
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
