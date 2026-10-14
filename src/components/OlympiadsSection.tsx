"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getLocalCache, setLocalCache } from "@/lib/cache";
import { useLanguage, Language } from "@/context/LanguageContext";

interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

interface OlympiadCardItem {
  id: string;
  title: LocalizedText | string;
  text: LocalizedText | string;
  image: string;
  badge: LocalizedText | string;
  showOnHome?: boolean;
}

export default function OlympiadsSection() {
  const { lang, t } = useLanguage();
  const [olympiads, setOlympiads] = useState<OlympiadCardItem[]>([]);

  useEffect(() => {
    // Read cache upon client mount
    const cached = getLocalCache<OlympiadCardItem[] | null>("olympiads_home_cache", null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      const sanitized = cached.filter((item) => {
        const img = item.image || "";
        const titleStr = typeof item.title === "object" ? JSON.stringify(item.title) : item.title || "";
        return (
          !img.includes("1791736997486") &&
          !img.toLowerCase().includes("hasanov") &&
          !titleStr.toLowerCase().includes("hasanov")
        );
      });
      if (sanitized.length > 0) {
        setOlympiads(sanitized.slice(0, 3));
      } else {
        setOlympiads([]);
      }
    }

    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "olympiads");
      const q = query(colRef, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: OlympiadCardItem[] = [];
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              const img = data.imageUrl || "";
              const nameStr = data.name || data.title || "";
              if (
                data.showOnHome !== false &&
                !img.includes("1791736997486") &&
                !img.toLowerCase().includes("hasanov") &&
                !nameStr.toLowerCase().includes("hasanov")
              ) {
                fetched.push({
                  id: doc.id,
                  title: data.title || (data.name ? `${data.name} — ${data.subject || "Fan"}` : "Yutuq"),
                  text: data.description || data.text || `${data.name || "O'quvchimiz"} ${data.subject ? `${data.subject} fanidan` : ""} ${data.result ? `"${data.result}" natijasini qo'lga kiritdi.` : ""}`,
                  image: data.imageUrl || "/data/maktab_binosi.png",
                  badge: data.badge || data.result || "Yutuq",
                  showOnHome: true,
                });
              }
            });
            setOlympiads(fetched.slice(0, 3));
            setLocalCache("olympiads_home_cache", fetched.slice(0, 3));
          } else {
            setOlympiads([]);
            setLocalCache("olympiads_home_cache", []);
          }
        },
        (error) => {
          console.warn("Olympiads ordered query fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: OlympiadCardItem[] = [];
              simpleSnap.docs.forEach((doc) => {
                const data = doc.data();
                const img = data.imageUrl || "";
                const nameStr = data.name || data.title || "";
                if (
                  data.showOnHome !== false &&
                  !img.includes("1791736997486") &&
                  !img.toLowerCase().includes("hasanov") &&
                  !nameStr.toLowerCase().includes("hasanov")
                ) {
                  fetched.push({
                    id: doc.id,
                    title: data.title || (data.name ? `${data.name} — ${data.subject || "Fan"}` : "Yutuq"),
                    text: data.description || data.text || `${data.name || "O'quvchimiz"} ${data.subject ? `${data.subject} fanidan` : ""} ${data.result ? `"${data.result}" natijasini qo'lga kiritdi.` : ""}`,
                    image: data.imageUrl || "/data/maktab_binosi.png",
                    badge: data.badge || data.result || "Yutuq",
                    showOnHome: true,
                  });
                }
              });
              setOlympiads(fetched.slice(0, 3));
              setLocalCache("olympiads_home_cache", fetched.slice(0, 3));
            } else {
              setOlympiads([]);
              setLocalCache("olympiads_home_cache", []);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up olympiads listener:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getText = (val: LocalizedText | string | undefined): string => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.uz || val.ru || val.en || "";
    }
    return val;
  };

  // Fixed 3 items guarantee
  const displayItems = olympiads.slice(0, 3);
  const seeAllText = lang === "ru" ? "Смотреть все достижения →" : lang === "en" ? "View all achievements →" : "Barcha yutuqlarni ko'rish →";

  if (olympiads.length === 0) {
    return null;
  }

  return (
    <section
      id="yutuqlar"
      className="py-24 bg-[#071a33] text-white overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase font-extrabold tracking-widest text-[#ff6b00] mb-3"
          >
            {t("olympiadsBadge")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tight"
          >
            {t("olympiadsTitle")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/60 font-medium text-sm md:text-base max-w-2xl mx-auto mt-4"
          >
            {t("olympiadsSubtitle")}
          </motion.p>
        </div>

        {/* Strictly 3 Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 min-h-[480px]"
        >
          {displayItems.map((item) => {
            const itemTitle = getText(item.title);
            const itemText = getText(item.text);
            const itemBadge = getText(item.badge);

            return (
              <Link
                key={item.id}
                href={`/olympiads/${item.id}`}
                className="block group"
              >
                <motion.div
                  variants={itemVariants}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    const angle = Math.atan2(y, x);
                    e.currentTarget.style.setProperty("--rotation", `${angle}rad`);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty("--rotation", "0deg");
                  }}
                  style={{
                    border: "3px solid transparent",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                  }}
                  className="relative rounded-3xl overflow-hidden bg-[#0a254a] border border-white/10 hover:border-[#ff6b00] transition-all duration-300 shadow-xl flex flex-col h-full"
                >
                  {/* Photo frame */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-800">
                    <Image
                      src={item.image}
                      alt={itemTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  <div className="p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#ff6b00] transition-colors">
                        {itemTitle}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-3 overflow-hidden text-ellipsis">
                        {itemText}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="inline-block bg-[#ff6b00] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md shadow-orange-500/20">
                        {itemBadge}
                      </span>
                      <span className="text-xs font-bold text-[#ff6b00] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Batafsil &rarr;
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* Footer Button */}
        <div className="text-center">
          <Link
            href="/olympiads"
            className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm md:text-base px-8 py-3 rounded-xl hover:bg-[#ff6b00] hover:text-white transition-all shadow-md cursor-pointer"
          >
            {seeAllText}
          </Link>
        </div>
      </div>
    </section>
  );
}
