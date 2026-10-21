"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  ArrowLeft,
  Camera,
  Layers,
} from "lucide-react";

interface GalleryItem {
  id: string;
  imageUrl: string;
  description: string;
  category?: string;
  createdAt?: string;
}

// Maktabning saralangan real fotosuratlari (fallback va boshlang'ich ma'lumot sifatida)
const INITIAL_FALLBACK_IMAGES: GalleryItem[] = [
  {
    id: "f1",
    imageUrl: "/rasmlar/2026-10-02 17.56.31.jpg",
    description: "ZIYO-ZUKKO zamonaviy ta'lim muhiti va qulay sharoitlar",
    category: "campus",
  },
  {
    id: "f2",
    imageUrl: "/rasmlar/2026-10-02 17.57.37.jpg",
    description: "O'quvchilarning dars jarayonidagi faol ishtiroki",
    category: "education",
  },
  {
    id: "f3",
    imageUrl: "/rasmlar/2026-10-02 17.58.25.jpg",
    description: "Interaktiv mashg'ulotlar va innovatsion laboratoriyalar",
    category: "education",
  },
  {
    id: "f4",
    imageUrl: "/rasmlar/2026-10-02 17.58.46.jpg",
    description: "Maktab bayrami va tantanali tadbirlar",
    category: "events",
  },
  {
    id: "f5",
    imageUrl: "/rasmlar/2026-10-02 17.59.06.jpg",
    description: "O'quvchilarimizning xalqaro va respublika yutuqlari",
    category: "achievements",
  },
  {
    id: "f6",
    imageUrl: "/rasmlar/2026-10-02 17.59.21.jpg",
    description: "Shinam kutubxona va mustaqil mutolaa zali",
    category: "campus",
  },
  {
    id: "f7",
    imageUrl: "/rasmlar/2026-10-02 18.00.24.jpg",
    description: "Ilm-fan va amaliy to'garak mashg'ulotlari",
    category: "education",
  },
  {
    id: "f8",
    imageUrl: "/rasmlar/2026-10-02 18.01.23.jpg",
    description: "Madaniy-ma'rifiy dasturlar va ijodiy ko'rgazmalar",
    category: "events",
  },
  {
    id: "f9",
    imageUrl: "/rasmlar/2026-10-02 18.01.32.jpg",
    description: "Sport musobaqalari va sog'lom turmush tarzi",
    category: "achievements",
  },
  {
    id: "f10",
    imageUrl: "/rasmlar/2026-10-02 17.57.45.jpg",
    description: "Tajribali ustozlar va dars muhokamalari",
    category: "education",
  },
  {
    id: "f11",
    imageUrl: "/rasmlar/2026-10-02 17.58.36.jpg",
    description: "Keng, yorug' va zamonaviy jihozlangan sinfxonalar",
    category: "campus",
  },
  {
    id: "f12",
    imageUrl: "/rasmlar/2026-10-02 17.59.54.jpg",
    description: "Jamoaviy loyihalar va o'quvchilarning ijodiy ishlari",
    category: "events",
  },
];

export default function GalleryPage() {
  const { lang, t } = useLanguage();
  const [firestoreImages, setFirestoreImages] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoadedMap, setIsLoadedMap] = useState<Record<string, boolean>>({});

  // 1. Firebase Firestore'dan galereya rasmlarini real vaqtda olish
  useEffect(() => {
    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "gallery");
      const q = query(colRef, orderBy("createdAt", "desc"));

      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                imageUrl: (data.imageUrl as string) || "",
                description: (data.description as string) || "",
                category: (data.category as string) || "campus",
                createdAt: data.createdAt || "",
              };
            }).filter((item) => Boolean(item.imageUrl));
            setFirestoreImages(fetched);
          } else {
            setFirestoreImages([]);
          }
        },
        (error) => {
          console.warn("Firestore gallery query fallback:", error);
          // Fallback simple fetch without orderBy
          getDocs(colRef).then((snap) => {
            if (!snap.empty) {
              const fetched = snap.docs.map((d) => ({
                id: d.id,
                imageUrl: (d.data().imageUrl as string) || "",
                description: (d.data().description as string) || "",
                category: (d.data().category as string) || "campus",
              })).filter((item) => Boolean(item.imageUrl));
              setFirestoreImages(fetched);
            }
          }).catch((e) => console.error(e));
        }
      );
    } catch (e) {
      console.error("Gallery snapshot error:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // 2. Barcha rasmlarni birlashtirish va takrorlanishini oldini olish
  const allImages = useMemo(() => {
    const combined: GalleryItem[] = [];
    const seenUrls = new Set<string>();

    // Birinchi o'rinda admin qo'shgan rasmlar
    firestoreImages.forEach((img) => {
      if (!seenUrls.has(img.imageUrl)) {
        seenUrls.add(img.imageUrl);
        combined.push(img);
      }
    });

    // So'ngra fallback fotosuratlar
    INITIAL_FALLBACK_IMAGES.forEach((img) => {
      if (!seenUrls.has(img.imageUrl)) {
        seenUrls.add(img.imageUrl);
        combined.push(img);
      }
    });

    return combined;
  }, [firestoreImages]);

  // 3. Kategoriya bo'yicha filtrlash
  const filteredImages = useMemo(() => {
    if (activeCategory === "all") return allImages;
    return allImages.filter((img) => img.category === activeCategory);
  }, [allImages, activeCategory]);

  // 4. Modal navigatsiyasi
  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? filteredImages.length - 1 : prev - 1;
    });
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev === filteredImages.length - 1 ? 0 : prev + 1;
    });
  }, [filteredImages.length]);

  // Keyboard navigation (Escape, Left, Right)
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImageIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, handlePrev, handleNext]);

  // Kategoriyalar ro'yxati
  const categories = [
    { key: "all", uz: "Barchasi", ru: "Все", en: "All" },
    { key: "campus", uz: "Maktab & Muhit", ru: "Школа и кампус", en: "Campus & Life" },
    { key: "education", uz: "Dars jarayoni", ru: "Учебный процесс", en: "Education" },
    { key: "events", uz: "Tadbirlar", ru: "Мероприятия", en: "Events" },
    { key: "achievements", uz: "Yutuqlar & Sport", ru: "Достижения и спорт", en: "Achievements" },
  ];

  // Bento uslubidagi xilma-xil kadr shakllari (dinamik va nooddiy editorial ko'rinish)
  const getBentoSpan = (index: number) => {
    const cycle = index % 8;
    switch (cycle) {
      case 0:
        return "md:col-span-2 md:row-span-2 aspect-[4/3] sm:aspect-[16/10] md:aspect-auto md:min-h-[460px]";
      case 1:
        return "md:col-span-1 aspect-[4/5] sm:aspect-square md:aspect-[4/5]";
      case 2:
        return "md:col-span-1 aspect-[4/5] sm:aspect-square md:aspect-[4/5]";
      case 3:
        return "md:col-span-2 aspect-[16/9] sm:aspect-[16/10]";
      case 4:
        return "md:col-span-1 aspect-square";
      case 5:
        return "md:col-span-1 aspect-square";
      case 6:
        return "md:col-span-2 md:row-span-2 aspect-[4/3] sm:aspect-[16/10] md:aspect-auto md:min-h-[440px]";
      case 7:
        return "md:col-span-2 aspect-[16/9]";
      default:
        return "md:col-span-1 aspect-square";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] flex flex-col selection:bg-[#ff6b00] selection:text-white">
      {/* 1. Header */}
      <Navbar solidAtTop />

      {/* 2. Hero Header Section */}
      <section className="relative pt-32 pb-14 md:pt-40 md:pb-20 bg-gradient-to-b from-white via-[#f1f5f9] to-[#f8fafc] border-b border-slate-200/60 overflow-hidden">
        {/* Orqa fon dekoratsiyasi */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-0 w-80 h-80 bg-[#2168f2]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb / Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#ff6b00] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t("backToHome") || "Asosiy sahifaga qaytish"}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-bold uppercase tracking-widest mb-4 border border-[#ff6b00]/20">
                <Camera className="w-3.5 h-3.5" />
                <span>ZIYO-ZUKKO {lang === "ru" ? "ФОТОГАЛЕРЕЯ" : lang === "en" ? "PHOTO GALLERY" : "FOTOGALEREYASI"}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#071a33] leading-[1.1] uppercase">
                {lang === "ru"
                  ? "Школьная жизнь в кадрах"
                  : lang === "en"
                  ? "School Moments in Frames"
                  : "Maktabimiz hayoti suratlarda"}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                {lang === "ru"
                  ? "Фотографии уроков, достижений, праздников и современной атмосферы школы ZIYO-ZUKKO."
                  : lang === "en"
                  ? "Highlights of our classes, achievements, celebrations, and modern campus life at ZIYO-ZUKKO."
                  : "Dars jarayonlari, yutuqlar, bayramlar va maktabimizning zamonaviy muhitidan fotolavhalar to'plami."}
              </p>
            </div>

            {/* Jami fotosuratlar hisoblagichi */}
            <div className="flex items-center gap-3 shrink-0 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-sm self-start md:self-auto">
              <div className="w-10 h-10 rounded-xl bg-[#ff6b00] text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/25">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-extrabold text-[#071a33] leading-none">
                  {allImages.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {lang === "ru" ? "фотографий" : lang === "en" ? "curated photos" : "ta saralangan foto"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Kategoriyalar filtri */}
          <div className="mt-8 sm:mt-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count = cat.key === "all"
                ? allImages.length
                : allImages.filter((c) => c.category === cat.key).length;

              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "bg-[#ff6b00] text-white shadow-lg shadow-orange-500/25 scale-102"
                      : "bg-white text-slate-700 hover:text-[#071a33] hover:bg-slate-100 border border-slate-200/80 shadow-xs"
                  }`}
                >
                  <span>{cat[lang] || cat.uz}</span>
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
        </div>
      </section>

      {/* 4. Asosiy Bento-Masonry Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16 w-full flex-1">
        {filteredImages.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <Camera className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-700">
              {lang === "ru" ? "В этой категории пока нет фотографий" : "Ushbu toifada hozircha fotosuratlar mavjud emas"}
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#ff6b00] text-white text-sm font-bold shadow-md hover:bg-[#e05e00] transition-colors"
            >
              {lang === "ru" ? "Смотреть все фото" : "Barcha fotolarni ko'rish"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[220px] sm:auto-rows-[260px]">
            {filteredImages.map((img, idx) => {
              const bentoClasses = getBentoSpan(idx);
              const isLoaded = isLoadedMap[img.id || img.imageUrl];

              return (
                <motion.div
                  key={img.id || `${img.imageUrl}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.4) }}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-200/90 hover:border-[#ff6b00] shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 ${bentoClasses}`}
                >
                  {/* Skeleton Placeholder */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse z-10" />
                  )}

                  {/* Image */}
                  <Image
                    src={img.imageUrl}
                    alt={img.description || `ZIYO-ZUKKO foto ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    onLoad={() => {
                      setIsLoadedMap((prev) => ({ ...prev, [img.id || img.imageUrl]: true }));
                    }}
                    unoptimized
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-between p-5 sm:p-6" />

                  {/* Top Badge on Hover */}
                  <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Top Left Number Pill */}
                  <div className="absolute top-4 left-4 z-30">
                    <span className="px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-mono font-bold border border-white/10">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Bottom Caption on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-30 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-md">
                      {img.description || "ZIYO-ZUKKO umumta'lim maktabi fotolavhasi"}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#ffa055] font-semibold mt-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === "ru" ? "Нажмите для просмотра" : "Kattalashtirib ko'rish"}</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. Fullscreen Cinema Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && filteredImages[selectedImageIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 select-none"
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Modal Top Bar */}
            <div
              className="w-full flex items-center justify-between text-white z-20 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold border border-white/15">
                  {selectedImageIndex + 1} / {filteredImages.length}
                </span>
                <span className="hidden sm:inline text-xs font-semibold text-white/60">
                  ZIYO-ZUKKO Galereya
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedImageIndex(null)}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#ff6b00] text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
                title={lang === "ru" ? "Закрыть (Esc)" : "Yopish (Esc)"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div
              className="relative w-full flex-1 max-w-6xl flex items-center justify-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={filteredImages[selectedImageIndex].imageUrl}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full max-h-[75vh] flex items-center justify-center"
                >
                  <Image
                    src={filteredImages[selectedImageIndex].imageUrl}
                    alt={filteredImages[selectedImageIndex].description || "Galereya fotosurati"}
                    fill
                    className="object-contain drop-shadow-2xl rounded-xl"
                    priority
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>

              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#ff6b00] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer z-30 shadow-2xl"
                aria-label="Oldingi rasm"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-[#ff6b00] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer z-30 shadow-2xl"
                aria-label="Keyingi rasm"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Bottom Caption Bar */}
            <div
              className="w-full max-w-3xl text-center text-white pt-4 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm sm:text-base font-semibold text-white/90 leading-relaxed bg-white/5 border border-white/10 py-3 px-6 rounded-2xl backdrop-blur-md inline-block shadow-lg">
                {filteredImages[selectedImageIndex].description || "ZIYO-ZUKKO umumta'lim maktabi fotolavhasi"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
