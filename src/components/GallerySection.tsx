"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getLocalCache, setLocalCache } from "@/lib/cache";
import { useLanguage } from "@/context/LanguageContext";

export default function GallerySection() {
  const { t, lang } = useLanguage();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Read cache upon client mount
    const cached = getLocalCache<string[] | null>("gallery_home_cache", null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setImages(cached);
    }

    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "gallery");
      const q = query(colRef, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs
              .map((doc) => doc.data().imageUrl as string)
              .filter(Boolean);
            setImages(fetched);
            setLocalCache("gallery_home_cache", fetched);
          } else {
            setImages([]);
          }
        },
        (error) => {
          console.warn("Gallery ordered query fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched = simpleSnap.docs
                .map((doc) => doc.data().imageUrl as string)
                .filter(Boolean);
              setImages(fetched);
              setLocalCache("gallery_home_cache", fetched);
            } else {
              setImages([]);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up gallery listener:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const uniqueImages = Array.from(new Set(images));

  if (uniqueImages.length === 0) {
    return null;
  }

  // 1 dan 4 tagacha bo'lsa - har bir rasm bittadan aniq ko'rsatiladigan chiroyli Grid
  const isSmallGallery = uniqueImages.length <= 4;

  return (
    <section id="galereya" className="py-24 bg-[#f8fafc] text-[#071a33] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3"
          >
            {t("galleryBadge")}
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight uppercase text-[#071a33]"
          >
            {t("galleryTitle")}
          </motion.h2>
        </div>
      </div>

      {isSmallGallery ? (
        // Grid display: Hech qachon 2 tadan bo'lib takrorlanmaydi!
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-6 md:gap-8 ${
            uniqueImages.length === 1 
              ? "max-w-3xl mx-auto grid-cols-1" 
              : uniqueImages.length === 2 
                ? "grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto" 
                : uniqueImages.length === 3 
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto" 
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}>
            {uniqueImages.map((img, idx) => (
              <motion.div 
                key={`${img}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg shadow-black/5 border border-black/5 group bg-slate-100"
              >
                <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                <Image 
                  src={img} 
                  alt={`${t("galleryTitle")} ${idx + 1}`} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 z-10" 
                  unoptimized
                />
                <div className="absolute inset-0 z-20 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        // Marquee Row: Katta va ko'rkam silliq lenta (telefonlarda ham yirik va aniq)
        <div className="relative w-full overflow-hidden py-4">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>

          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
            className="flex gap-6 md:gap-8 w-max hover:[animation-play-state:paused]"
          >
            {[...uniqueImages, ...uniqueImages].map((img, idx) => (
              <div 
                key={`marquee-${idx}`} 
                className="relative w-[280px] sm:w-[380px] md:w-[480px] lg:w-[560px] aspect-[4/3] sm:aspect-[16/11] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl shadow-black/5 shrink-0 border border-black/5 group bg-slate-100"
              >
                <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                <Image 
                  src={img} 
                  alt={`${t("galleryTitle")} ${idx + 1}`} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 z-10" 
                  unoptimized
                />
                <div className="absolute inset-0 z-20 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Button to full gallery page */}
      <div className="mt-10 md:mt-14 text-center px-6">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-[#071a33] hover:text-white hover:bg-[#ff6b00] font-extrabold text-sm sm:text-base shadow-lg shadow-black/5 hover:shadow-orange-500/25 transition-all duration-300 border border-slate-200/90 hover:border-[#ff6b00] group cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>
            {lang === "ru"
              ? "Смотреть все фотографии"
              : lang === "en"
              ? "View All Photos"
              : "Barcha fotosuratlarni ko'rish"}
          </span>
          <span className="group-hover:translate-x-1.5 transition-transform duration-300 text-[#ff6b00] group-hover:text-white">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
