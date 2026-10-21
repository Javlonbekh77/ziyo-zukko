"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Award, GraduationCap } from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getLocalCache, setLocalCache } from "@/lib/cache";

interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

interface TeamMember {
  id: string | number;
  name: string;
  role: LocalizedText | string;
  category: "all" | "leadership" | "primary" | "exact" | "languages" | "it" | string;
  highlight: LocalizedText | string;
  image: string;
  bullets: (LocalizedText | string)[];
}

const defaultTeamMembers: TeamMember[] = [];

export default function TeamSection() {
  const { lang, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isGridMode, setIsGridMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [teamMembersList, setTeamMembersList] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Read cache upon client mount
    const cached = getLocalCache<TeamMember[] | null>("teachers_home_cache", null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setTeamMembersList(cached);
    }

    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "teachers");
      const q = query(colRef, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: TeamMember[] = [];
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              fetched.push({
                id: doc.id,
                name: data.name || "Ustoz",
                role: data.role || "O'qituvchi",
                category: data.category || "all",
                highlight: data.highlight || (data.experience ? `${data.experience} yillik pedagog` : "Tajribali ustoz"),
                image: data.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
                bullets: data.bio ? [data.bio] : (data.experience ? [`${data.experience} yil pedagogik tajriba`] : []),
              });
            });
            setTeamMembersList(fetched);
            setLocalCache("teachers_home_cache", fetched);
          } else {
            setTeamMembersList([]);
          }
        },
        (error) => {
          console.warn("Teachers ordered query fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: TeamMember[] = [];
              simpleSnap.docs.forEach((doc) => {
                const data = doc.data();
                fetched.push({
                  id: doc.id,
                  name: data.name || "Ustoz",
                  role: data.role || "O'qituvchi",
                  category: data.category || "all",
                  highlight: data.highlight || (data.experience ? `${data.experience} yillik pedagog` : "Tajribali ustoz"),
                  image: data.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
                  bullets: data.bio ? [data.bio] : (data.experience ? [`${data.experience} yil pedagogik tajriba`] : []),
                });
              });
              setTeamMembersList(fetched);
              setLocalCache("teachers_home_cache", fetched);
            } else {
              setTeamMembersList([]);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up teachers listener:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth > 640 ? 350 : 270;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const getText = (val: LocalizedText | string | undefined): string => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.uz || val.ru || val.en || "";
    }
    return val;
  };

  // Agar bazada o'qituvchilar hali kiritilmagan bo'lsa, bo'sh qoldiramiz (placeholder chiqarilmaydi)
  if (teamMembersList.length === 0) {
    return null;
  }

  // Leadership members ALWAYS come first in "Barchasi"!
  const filteredMembers = (activeCategory === "all"
    ? [...teamMembersList].sort((a, b) => {
        const aIsLeader = a.category === "leadership";
        const bIsLeader = b.category === "leadership";
        if (aIsLeader && !bIsLeader) return -1;
        if (!aIsLeader && bIsLeader) return 1;
        return 0;
      })
    : teamMembersList.filter((m) => m.category === activeCategory)
  );

  const categoryTabs = [
    { id: "all", label: t("all") },
    { id: "leadership", label: t("leadership") },
    { id: "primary", label: t("primary") },
    { id: "exact", label: t("exact") },
    { id: "languages", label: t("languages") },
    { id: "it", label: t("it") },
  ];

  return (
    <section id="team" className="py-14 sm:py-20 md:py-24 bg-white text-[#0b1b36] relative overflow-hidden">
      <div id="teachers" className="absolute -top-24 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Top Header & Navigation Controls */}
        <div className="flex flex-col gap-5 sm:gap-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[#ff6b00] font-bold text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-3 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-[#ff6b00]" />
                {t("teamBadge")}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0b1b36]"
              >
                {t("teamTitle")}
              </motion.h2>
            </div>

            {/* Action Controls: View mode and slider arrows */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <Link
                href="/teachers"
                className="border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <span>{lang === "ru" ? "Все педагоги →" : lang === "en" ? "All Teachers →" : "Barcha ustozlar →"}</span>
              </Link>

              {!isGridMode && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => scroll("left")}
                    aria-label="Previous"
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#ff6b00] hover:bg-[#e05e00] active:scale-90 text-white flex items-center justify-center shadow-md shadow-[#ff6b00]/25 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    aria-label="Next"
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#ff6b00] hover:bg-[#e05e00] active:scale-90 text-white flex items-center justify-center shadow-md shadow-[#ff6b00]/25 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Option Filters - Horizontal Scroll Left/Right on Phones */}
          <div className="w-full overflow-hidden">
            <div
              className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 touch-pan-x"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeCategory === tab.id
                      ? "bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/20"
                      : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards: Grid Mode or Slider Track */}
        {isGridMode ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-2 pb-8">
            {filteredMembers.map((member, index) => {
              const roleStr = getText(member.role);
              const highlightStr = getText(member.highlight);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`relative w-full h-[400px] xs:h-[430px] sm:h-[490px] md:h-[520px] rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl group transition-all duration-300 bg-slate-900 border-[2.5px] sm:border-[3.5px] ${
                    member.category === "leadership" ? "border-[#ff6b00] ring-4 ring-[#ff6b00]/20" : "border-[#ff6b00]"
                  }`}
                >
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${roleStr}`}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 330px"
                  />
                  <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-start justify-between gap-1.5 z-20">
                    <span className="bg-[#ff6b00] text-white font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md max-w-[48%] truncate border border-white/20 backdrop-blur-md">
                      {member.name}
                    </span>
                    <span className={`text-white font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md max-w-[48%] truncate text-right border border-white/20 backdrop-blur-md ${
                      member.category === "leadership" ? "bg-[#0b1b36]/90 border-[#ff6b00]" : "bg-[#ff6b00]"
                    }`}>
                      {roleStr}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-14 sm:pt-20 pb-4 sm:pb-6 px-3.5 sm:px-5 z-10 flex flex-col justify-end">
                    <h3 className="text-white text-base sm:text-xl md:text-2xl font-black mb-2 sm:mb-3 leading-snug drop-shadow-md flex items-center gap-1.5 sm:gap-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff6b00] shrink-0" />
                      {highlightStr}
                    </h3>
                    <ul className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs md:text-[12.5px] text-white/90 font-medium leading-relaxed">
                      {member.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-[#ff6b00] text-base leading-none select-none">•</span>
                          <span className="line-clamp-2">{getText(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 sm:pb-8 pt-2 px-1 touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {filteredMembers.map((member, index) => {
              const roleStr = getText(member.role);
              const highlightStr = getText(member.highlight);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`snap-start shrink-0 relative w-[245px] xs:w-[265px] sm:w-[320px] md:w-[330px] h-[390px] xs:h-[420px] sm:h-[490px] md:h-[520px] rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl group transition-all duration-300 bg-slate-900 border-[2.5px] sm:border-[3.5px] ${
                    member.category === "leadership" ? "border-[#ff6b00] ring-4 ring-[#ff6b00]/20" : "border-[#ff6b00]"
                  }`}
                >
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${roleStr}`}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 265px, 330px"
                  />
                  <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-start justify-between gap-1.5 z-20">
                    <span className="bg-[#ff6b00] text-white font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md max-w-[48%] truncate border border-white/20 backdrop-blur-md">
                      {member.name}
                    </span>
                    <span className={`text-white font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md max-w-[48%] truncate text-right border border-white/20 backdrop-blur-md ${
                      member.category === "leadership" ? "bg-[#0b1b36]/90 border-[#ff6b00]" : "bg-[#ff6b00]"
                    }`}>
                      {roleStr}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-14 sm:pt-20 pb-4 sm:pb-6 px-3.5 sm:px-5 z-10 flex flex-col justify-end">
                    <h3 className="text-white text-base sm:text-xl md:text-2xl font-black mb-2 sm:mb-3 leading-snug drop-shadow-md flex items-center gap-1.5 sm:gap-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff6b00] shrink-0" />
                      {highlightStr}
                    </h3>
                    <ul className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs md:text-[12.5px] text-white/90 font-medium leading-relaxed">
                      {member.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-[#ff6b00] text-base leading-none select-none">•</span>
                          <span className="line-clamp-2">{getText(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setIsGridMode(!isGridMode)}
            className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm md:text-base px-8 py-3 rounded-xl hover:bg-[#ff6b00] hover:text-white transition-all shadow-md cursor-pointer"
          >
            {isGridMode
              ? (lang === "ru" ? "← Свернуть в слайдер" : lang === "en" ? "← Back to slider view" : "← Slayder ko'rinishiga qaytish")
              : (lang === "ru" ? "Barcha ustozlarni ko'rish →" : lang === "en" ? "View all teachers →" : "Barcha ustozlarni ko'rish →")}
          </button>
        </div>

      </div>
    </section>
  );
}
