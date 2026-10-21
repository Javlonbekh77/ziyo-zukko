"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import { useLanguage, Language } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import {
  GraduationCap,
  Award,
  BookOpen,
  Search,
  ArrowLeft,
  X,
  Users,
  Sparkles,
  ChevronRight,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

export interface TeacherItem {
  id: string;
  name: string;
  role: string;
  category: "leadership" | "primary" | "exact" | "languages" | "it" | string;
  highlight: string;
  imageUrl: string;
  r2Key?: string;
  bullets: string[];
  createdAt?: string;
}

// Boshlang'ich va zaxira ustozlar ro'yxati (baza bo'sh bo'lganda ham sahifa boy va chiroyli turishi uchun)
const INITIAL_TEACHERS: TeacherItem[] = [
  {
    id: "t1",
    name: "Rahimov Anvarbek",
    role: "Maktab Direktori",
    category: "leadership",
    highlight: "Strategik boshqaruv va ta'lim yetakchisi",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Oliy toifali rahbar va tajribali pedagog",
      "Ta'lim sohasida 20 yildan ortiq boshqaruv va strategik rivojlanish tajribasi",
      "Ziyo-Zukko zamonaviy ta'lim tizimi va rivojlanish dasturi asoschisi",
    ],
  },
  {
    id: "t2",
    name: "Karimova Dilfuza",
    role: "O'quv ishlari mudiri",
    category: "leadership",
    highlight: "Akademik mukammallik",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Nizomiy nomidagi TDPU magistri, metodist",
      "O'quv rejalari va xalqaro baholash standartlari koordinatori",
      "15 yillik uzluksiz o'quv-metodik boshqaruv tajribasi",
    ],
  },
  {
    id: "t3",
    name: "Yusupov Jamshid",
    role: "Ta'lim-tarbiya mudiri",
    category: "leadership",
    highlight: "Ma'naviyat va tarbiya",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "O'quvchilar ma'naviy-axloqiy tarbiyasi va ijtimoiy faollik yetakchisi",
      "Psixologik qo'llab-quvvatlash va sog'lom jamoaviy muhit koordinatori",
      "12 yillik yoshlar bilan ishlash va pedagogik tajriba",
    ],
  },
  {
    id: "t4",
    name: "Otajonova Yaqutxon",
    role: "Boshlang'ich ta'lim ustozi",
    category: "primary",
    highlight: "33 yillik pedagog",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Oliy toifali tajribali pedagog, xalq ta'limi a'lochisi",
      "Boshlang'ich sinflarda ilg'or mantiqiy metodika asoschisi",
      "350 dan ortiq iqtidorli boshlang'ich sinf bitiruvchilari",
    ],
  },
  {
    id: "t5",
    name: "Abdullayev Sardor",
    role: "Matematika fani ustozi",
    category: "exact",
    highlight: "Olimpiada murabbiyi",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "O'zMU matematika fakulteti bitiruvchisi, xalqaro olimpiadalar g'olibi",
      "Respublika va xalqaro fan olimpiadalariga tayyorlash bo'yicha 10 yillik tajriba",
      "O'quvchilari xalqaro matematik musobaqalarda 40+ medal sohiblari",
    ],
  },
  {
    id: "t6",
    name: "Xodjayeva Malika",
    role: "Ingliz tili fani ustozi",
    category: "languages",
    highlight: "IELTS 8.5 sohibi",
    imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "O'zDJTU magistri, CELTA xalqaro sertifikatiga ega",
      "O'quvchilarni xalqaro CEFR va IELTS imtihonlariga tayyorlash yetakchisi",
      "Ingliz tilida erkin muloqot va so'zlashuv klubi koordinatori",
    ],
  },
  {
    id: "t7",
    name: "Saidov Bobur",
    role: "IT va Dasturlash ustozi",
    category: "it",
    highlight: "Senior Software Engineer",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Toshkent shahridagi Inha universiteti bitiruvchisi",
      "Python, Web dasturlash va Robototexnika yo'nalishlari ustozi",
      "Xalqaro IT tanlovlar va xakatonlar ishtirokchisi",
    ],
  },
  {
    id: "t8",
    name: "Rasulova Nigora",
    role: "Ona tili va adabiyot ustozi",
    category: "languages",
    highlight: "Oliy toifali o'qituvchi",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Filologiya fanlari bo'yicha falsafa doktori (PhD)",
      "Milliy sertifikat va ijodiy tanlovlar bo'yicha ekspert",
      "14 yillik ilmiy va pedagogik faoliyat",
    ],
  },
  {
    id: "t9",
    name: "Qodirov Alisher",
    role: "Fizika fani ustozi",
    category: "exact",
    highlight: "Tajribali laboratoriya mutaxassisi",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Zamonaviy fizika laboratoriyasi va amaliy tadqiqotlar rahbari",
      "STEM ta'lim dasturi va robototexnika integratori",
      "11 yillik chuqurlashtirilgan fizika darslari tajribasi",
    ],
  },
];

export default function TeachersPage() {
  const { lang, t } = useLanguage();
  const [firestoreTeachers, setFirestoreTeachers] = useState<TeacherItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null);

  // 1. Firebase Firestore'dan ustozlarni real vaqtda olish
  useEffect(() => {
    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "teachers");
      const q = query(colRef, orderBy("createdAt", "desc"));

      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                name: data.name || "Ustoz",
                role: data.role || "O'qituvchi",
                category: data.category || "exact",
                highlight: data.highlight || (data.experience ? `${data.experience} yillik pedagog` : "Tajribali ustoz"),
                imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
                bullets: Array.isArray(data.bullets) && data.bullets.length > 0
                  ? data.bullets
                  : (data.bio ? [data.bio] : (data.experience ? [`${data.experience} yil pedagogik tajriba`] : [])),
                createdAt: data.createdAt || "",
              };
            });
            setFirestoreTeachers(fetched);
          } else {
            setFirestoreTeachers([]);
          }
        },
        (error) => {
          console.warn("Firestore teachers query fallback:", error);
          getDocs(colRef).then((snap) => {
            if (!snap.empty) {
              const fetched = snap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  name: data.name || "Ustoz",
                  role: data.role || "O'qituvchi",
                  category: data.category || "exact",
                  highlight: data.highlight || "Tajribali ustoz",
                  imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
                  bullets: Array.isArray(data.bullets) ? data.bullets : [],
                };
              });
              setFirestoreTeachers(fetched);
            }
          }).catch((e) => console.error(e));
        }
      );
    } catch (e) {
      console.error("Teachers snapshot error:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // 2. Barcha ustozlar (baza + zaxira seed ma'lumotlar)
  const allTeachers = useMemo(() => {
    if (firestoreTeachers.length > 0) {
      return firestoreTeachers;
    }
    return INITIAL_TEACHERS;
  }, [firestoreTeachers]);

  // 3. Qidiruv va toifa bo'yicha saralash
  const filteredTeachers = useMemo(() => {
    return allTeachers.filter((teacher) => {
      // Toifa filtri
      const matchesCategory = activeCategory === "all" || teacher.category === activeCategory;

      // Qidiruv filtri
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        teacher.name.toLowerCase().includes(q) ||
        teacher.role.toLowerCase().includes(q) ||
        teacher.highlight.toLowerCase().includes(q) ||
        teacher.bullets.some((b) => b.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allTeachers, activeCategory, searchQuery]);

  // Kategoriyalar ro'yxati
  const categories = [
    { key: "all", label: t("all") || "Barchasi" },
    { key: "leadership", label: t("leadership") || "Rahbariyat" },
    { key: "primary", label: t("primary") || "Boshlang'ich" },
    { key: "exact", label: t("exact") || "Aniq fanlar" },
    { key: "languages", label: t("languages") || "Chet tillari" },
    { key: "it", label: t("it") || "IT & AI" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] flex flex-col selection:bg-[#ff6b00] selection:text-white">
      {/* 1. Header */}
      <Navbar solidAtTop />

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-12 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-white via-slate-50 to-[#f8fafc] border-b border-slate-200/60 overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-0 w-80 h-80 bg-[#2168f2]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#ff6b00] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t("backToHome") || "Asosiy sahifaga qaytish"}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-bold uppercase tracking-widest mb-3 border border-[#ff6b00]/20">
                <GraduationCap className="w-4 h-4" />
                <span>{t("teamBadge") || "RAHBARIYAT VA PEDAGOGLAR"}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#071a33] uppercase leading-[1.1]">
                {lang === "ru"
                  ? "Педагогический состав"
                  : lang === "en"
                  ? "Faculty & Leadership"
                  : "Bizning Ustozlar va Rahbariyat"}
              </h1>
              <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed">
                {lang === "ru"
                  ? "Команда школы ZIYO-ZUKKO — опытные педагоги, методисты, кандидаты наук и международные эксперты, вдохновляющие учеников на высокие победы."
                  : lang === "en"
                  ? "The ZIYO-ZUKKO faculty — experienced educators, subject researchers, and certified international instructors dedicated to student excellence."
                  : "ZIYO-ZUKKO maktabi jamoasi — ta'lim va tarbiyani uyg'un olib boruvchi, o'z sohasining yetuk mutaxassislari, oliy toifali pedagoglar va xalqaro toifadagi ustozlar."}
              </p>
            </div>

            {/* Jami pedagoglar hisoblagichi */}
            <div className="flex items-center gap-3 shrink-0 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-sm self-start md:self-auto">
              <div className="w-11 h-11 rounded-xl bg-[#ff6b00] text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/25">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-extrabold text-[#071a33] leading-none">
                  {allTeachers.length}+
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {lang === "ru" ? "педагогов и наставников" : lang === "en" ? "educators & mentors" : "ustozlar va murabbiylar"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Qidiruv va Toifalar boshqaruvi */}
          <div className="mt-8 sm:mt-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.key;
                const count = cat.key === "all"
                  ? allTeachers.length
                  : allTeachers.filter((t) => t.category === cat.key).length;

                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 ${
                      isActive
                        ? "bg-[#ff6b00] text-white shadow-lg shadow-orange-500/25 scale-102"
                        : "bg-white text-slate-700 hover:text-[#071a33] hover:bg-slate-100 border border-slate-200/80 shadow-xs"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={lang === "ru" ? "Поиск по имени или предмету..." : lang === "en" ? "Search teacher or subject..." : "Ism yoki fan bo'yicha qidiruv..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-[#071a33] placeholder:text-slate-400 focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/15 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Asosiy Ustozlar Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16 w-full flex-1">
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-xl mx-auto">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-base sm:text-lg font-bold text-slate-700">
              {lang === "ru" ? "По вашему запросу ничего не найдено" : "Qidiruvingiz bo'yicha ustoz topilmadi"}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {lang === "ru" ? "Попробуйте изменить категорию или поисковый запрос" : "Iltimos, boshqa kalit so'z yoki toifani tanlab ko'ring"}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#ff6b00] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#e05e00] transition-colors cursor-pointer"
            >
              {lang === "ru" ? "Показать всех" : "Barchasini ko'rsatish"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredTeachers.map((teacher, idx) => (
              <motion.div
                key={teacher.id || idx}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
                className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-[#ff6b00] shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Rasm qismi */}
                <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={teacher.imageUrl}
                    alt={teacher.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-106 transition-transform duration-700 ease-out"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent z-10" />

                  {/* Kategoriya / Mutaxassislik chip */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white font-bold text-[11px] border border-white/20 uppercase tracking-wider">
                      {teacher.role}
                    </span>
                  </div>

                  {/* Highlight pastki badge */}
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6b00] text-white text-[11px] font-bold shadow-md shadow-orange-500/20">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span className="truncate">{teacher.highlight}</span>
                    </span>
                  </div>
                </div>

                {/* Kontent qismi */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#071a33] group-hover:text-[#ff6b00] transition-colors leading-snug">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {teacher.role}
                    </p>

                    {/* Qisqacha yutuqlari (bullets) */}
                    {teacher.bullets && teacher.bullets.length > 0 && (
                      <ul className="mt-3.5 space-y-2 border-t border-slate-100 pt-3">
                        {teacher.bullets.slice(0, 2).map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed"
                          >
                            <span className="text-[#ff6b00] mt-0.5 shrink-0 text-sm font-bold">✓</span>
                            <span className="line-clamp-2">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Batafsil tugmasi */}
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(teacher)}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#ff6b00] text-slate-700 hover:text-white font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/70 hover:border-[#ff6b00] active:scale-97"
                  >
                    <span>{lang === "ru" ? "Подробнее" : lang === "en" ? "View Profile" : "Batafsil ma'lumot"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* 5. Ustoz profili modal (Batafsil ko'rish) */}
      <AnimatePresence>
        {selectedTeacher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTeacher(null)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-auto max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Top Header with Photo */}
              <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-900 overflow-hidden shrink-0">
                <Image
                  src={selectedTeacher.imageUrl}
                  alt={selectedTeacher.name}
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#ff6b00] text-white text-[11px] sm:text-xs font-bold mb-1.5 sm:mb-2">
                    {selectedTeacher.highlight}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
                    {selectedTeacher.name}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm font-semibold mt-0.5 sm:mt-1">
                    {selectedTeacher.role}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#ff6b00]" />
                    <span>{lang === "ru" ? "Опыт и достижения" : "Pedagogik tajriba va yutuqlar"}</span>
                  </h4>

                  {selectedTeacher.bullets && selectedTeacher.bullets.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTeacher.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                          <CheckCircle2 className="w-5 h-5 text-[#ff6b00] shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{b}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      {lang === "ru"
                        ? "Опытный педагог с многолетним стажем работы в образовательной сфере."
                        : "Ko'p yillik tajribaga ega, o'z sohasining yetuk va malakali mutaxassisi."}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>ZIYO-ZUKKO xususiy maktabi</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    {lang === "ru" ? "Закрыть" : "Yopish"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
