"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getLocalCache, setLocalCache } from "@/lib/cache";
import { useLanguage } from "@/context/LanguageContext";

export default function GallerySection() {
  const { t } = useLanguage();
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

  if (images.length === 0) {
    return null;
  }

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

      {/* Marquee Row */}
      <div className="relative w-full overflow-hidden py-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8fafc] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8fafc] to-transparent z-10"></div>

        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          className="flex gap-6 w-max"
        >
          {[...images, ...images].map((img, idx) => (
            <div 
              key={idx} 
              className="relative w-[180px] sm:w-[260px] md:w-[420px] aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg shadow-black/5 shrink-0 border border-black/5 group"
            >
              <Image 
                src={img} 
                alt={`${t("galleryTitle")} ${idx + 1}`} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
