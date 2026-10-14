"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface TestimonialItem {
  id: string;
  title: string;
  quote: string;
  platform: "youtube" | "instagram";
  url: string;
  embedUrl: string;
  thumbnail: string;
}

export default function TestimonialsSection() {
  const { lang, t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<TestimonialItem | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  useEffect(() => {
    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "videos");
      const q = query(colRef, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: TestimonialItem[] = snapshot.docs
              .map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  title: data.title || "Ota-onalar fikri",
                  quote: data.description || data.quote || "",
                  platform: (data.platform === "instagram" ? "instagram" : "youtube") as "youtube" | "instagram",
                  url: data.url || "",
                  embedUrl: data.embedUrl || "",
                  thumbnail: data.thumbnail || "/data/maktab_binosi.png",
                  section: data.section || "both",
                };
              })
              .filter((v: any) => v.section === "testimonials" || v.section === "both" || !v.section)
              .slice(0, 4);

            setTestimonials(fetched);
          } else {
            setTestimonials([]);
          }
        },
        (error) => {
          console.warn("Videos ordered listener fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: TestimonialItem[] = simpleSnap.docs
                .map((doc) => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    title: data.title || "Ota-onalar fikri",
                    quote: data.description || data.quote || "",
                    platform: (data.platform === "instagram" ? "instagram" : "youtube") as "youtube" | "instagram",
                    url: data.url || "",
                    embedUrl: data.embedUrl || "",
                    thumbnail: data.thumbnail || "/data/maktab_binosi.png",
                    section: data.section || "both",
                  };
                })
                .filter((v: any) => v.section === "testimonials" || v.section === "both" || !v.section)
                .slice(0, 4);

              setTestimonials(fetched);
            } else {
              setTestimonials([]);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up testimonials listener:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (testimonials.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="testimonials" className="py-24 bg-white text-[#0b1b36] relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header with Barchasini ko'rish */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-4">
          <div className="text-center sm:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3"
            >
              {t("testimonialsBadge")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-[#0b1b36]"
            >
              {t("testimonialsTitle")}
            </motion.h2>
          </div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#ff6b00] hover:text-white transition-all shadow-sm shrink-0 cursor-pointer"
          >
            {t("seeAll")}
          </Link>
        </div>

        {/* Database Video Cards Grid on Home Page */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {testimonials.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              onClick={() => setActiveVideo(item)}
              className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-slate-100"
            >
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className="object-cover brightness-110 contrast-105 transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-300"></div>

              {/* Play / Pause Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-95 transition-all duration-300 ${
                    item.platform === "youtube"
                      ? "bg-[#ff0033] shadow-red-500/50"
                      : "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] shadow-pink-500/50"
                  }`}
                >
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* Video Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
