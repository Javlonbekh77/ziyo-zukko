"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FeatureCarousel } from "./ui/feature-carousel";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getLocalCache, setLocalCache } from "@/lib/cache";
import { useLanguage, Language } from "@/context/LanguageContext";

interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

interface MultilingualNewsItem {
  id: string | number;
  title: LocalizedText;
  summary: LocalizedText;
  tag: LocalizedText;
  img: string;
  date: string;
  social: string;
  embedUrl?: string;
}



interface RawNewsItem {
  id: string | number;
  title?: string | LocalizedText;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  summary?: string | LocalizedText;
  summary_uz?: string;
  summary_ru?: string;
  summary_en?: string;
  content?: string;
  content_uz?: string;
  content_ru?: string;
  content_en?: string;
  tag?: string | LocalizedText;
  tag_uz?: string;
  tag_ru?: string;
  tag_en?: string;
  img?: string;
  imageUrl?: string;
  image?: string;
  date: string;
  social?: string;
  embedUrl?: string;
}

export default function NewsSection() {
  const { lang, t } = useLanguage();
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [rawDbNews, setRawDbNews] = useState<RawNewsItem[]>([]);

  useEffect(() => {
    // Read cache after hydration to avoid SSR mismatch
    const cached = getLocalCache<RawNewsItem[] | null>("news_home_cache", null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setRawDbNews(cached);
    }

    if (!db) return;

    const mapNewsDoc = (docSnap: any): RawNewsItem => {
      const data = docSnap.data();
      const rawSocial = data.social || (data.platform === "youtube" || data.youtubeUrl || data.url?.includes("youtube") ? "youtube" : data.platform === "instagram" || data.instagramUrl || data.url?.includes("instagram") ? "instagram" : "both");
      return {
        id: docSnap.id,
        title: data.title,
        title_uz: data.title_uz,
        title_ru: data.title_ru,
        title_en: data.title_en,
        summary: data.summary || data.content,
        summary_uz: data.summary_uz || data.content_uz,
        summary_ru: data.summary_ru || data.content_ru,
        summary_en: data.summary_en || data.content_en,
        tag: data.tag || (rawSocial === "youtube" ? "YOUTUBE" : rawSocial === "instagram" ? "INSTAGRAM" : "YANGILIK"),
        tag_uz: data.tag_uz,
        tag_ru: data.tag_ru,
        tag_en: data.tag_en,
        img: data.imageUrl || data.image || data.thumbnail || "/data/maktab_binosi.png",
        date: data.date || (data.createdAt ? data.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
        social: rawSocial,
        platform: data.platform || (rawSocial === "youtube" ? "youtube" : rawSocial === "instagram" ? "instagram" : undefined),
        url: data.url,
        instagramUrl: data.instagramUrl,
        youtubeUrl: data.youtubeUrl || (data.platform === "youtube" ? data.url : undefined),
        embedUrl: data.embedUrl,
      };
    };

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "news");
      const q = query(colRef, orderBy("date", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: RawNewsItem[] = snapshot.docs.map(mapNewsDoc);
            setRawDbNews(fetched);
            setLocalCache("news_home_cache", fetched);
          } else {
            setRawDbNews([]);
            setLocalCache("news_home_cache", []);
          }
        },
        (error) => {
          console.warn("News ordered query fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: RawNewsItem[] = simpleSnap.docs.map(mapNewsDoc);
              fetched.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
              setRawDbNews(fetched);
              setLocalCache("news_home_cache", fetched);
            } else {
              setRawDbNews([]);
              setLocalCache("news_home_cache", []);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up news listener:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Helper to extract localized string
  const getLocalizedField = (
    item: any,
    field: "title" | "summary" | "tag",
    currentLang: Language
  ): string => {
    // 1. Direct language key like title_ru, title_en
    if (item[`${field}_${currentLang}`]) return item[`${field}_${currentLang}`];
    
    // 2. Object with language keys like item.title.ru
    if (item[field] && typeof item[field] === "object") {
      return item[field][currentLang] || item[field].uz || item[field].ru || item[field].en || "";
    }

    // 3. Simple string value
    if (typeof item[field] === "string" && item[field]) {
      return item[field];
    }

    return "";
  };

  // Build display news items according to current language
  const displayNewsItems = rawDbNews.map((n) => ({
    id: n.id,
    title: getLocalizedField(n, "title", lang) || "Yangilik",
    summary: getLocalizedField(n, "summary", lang) || "",
    tag: getLocalizedField(n, "tag", lang) || (lang === "ru" ? "НОВОСТИ" : lang === "en" ? "NEWS" : "YANGILIKLAR"),
    img: n.img || "/data/maktab_binosi.png",
    date: n.date,
    social: n.social || (n.instagramUrl ? "instagram" : n.youtubeUrl ? "youtube" : "both"),
    instagramUrl: n.instagramUrl,
    youtubeUrl: n.youtubeUrl,
    embedUrl: n.embedUrl,
  })).slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;

    try {
      const vidRef = collection(db, "videos");
      const unsubVids = onSnapshot(vidRef, (snap) => {
        if (!snap.empty) {
          const instaVids = snap.docs
            .map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                img: data.thumbnail || "/data/maktab_binosi.png",
                caption: data.title || "Ziyo-Zukko",
                embedUrl: data.embedUrl || (data.url?.includes("instagram.com") ? `${data.url.split("?")[0].replace(/\/embed\/?$/, "").replace(/\/$/, "")}/embed/` : undefined),
                platform: data.platform,
              };
            })
            .filter((v) => v.platform === "instagram" && v.embedUrl);

          setInstagramPosts(instaVids.slice(0, 8));
        } else {
          setInstagramPosts([]);
        }
      });

      return () => unsubVids();
    } catch (e) {
      console.error("Error setting up insta vids listener:", e);
    }
  }, []);

  const allReels = [
    ...instagramPosts.filter((p) => p.embedUrl).map((p) => p.embedUrl!),
  ];

  const openReel = (embedUrl: string) => {
    const index = allReels.indexOf(embedUrl);
    if (index !== -1) setActiveReelIndex(index);
  };

  if (displayNewsItems.length === 0 && instagramPosts.length === 0) {
    return null;
  }

  return (
    <section id="news" className="pt-12 pb-8 bg-[#f8fafc] text-[#0b1b36] flex flex-col min-h-[90vh] justify-center">
      <div className="max-w-[1400px] mx-auto px-6 w-full flex-1 flex flex-col justify-center">

        {/* Main Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-gray-200 pb-3">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
          >
            {t("newsTitleMain")}<span className="text-[#8c1c3f]">{t("newsTitleAccent")}</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/news" className="text-[#0b1b36] font-bold text-xs uppercase tracking-wide hover:opacity-70 transition-opacity flex items-center gap-2 mt-3 md:mt-0">
              {t("seeAll")}
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          
          {/* Left Column: Instagram Reels / Feed */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col lg:col-span-7 h-[500px] lg:h-[600px]"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4">
              {t("instagramTitle")}<span className="text-[#E1306C]">Instagram</span>
            </h3>
            
            <div className="w-full h-full flex items-center justify-center">
              {instagramPosts.length > 0 ? (
                <FeatureCarousel 
                  items={instagramPosts.slice(0, 6)} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400 font-medium">
                  Hozircha videolar kiritilmagan
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Classic News List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col lg:col-span-5"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4">
              {t("newsSubTitle")}<span className="text-[#8c1c3f]">{t("newsSubTitleAccent")}</span>
            </h3>
            
            <div className="flex flex-col gap-4 h-full justify-between">
              {displayNewsItems.length > 0 ? (
                displayNewsItems.slice(0, 3).map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/news/${item.id}`} 
                    className="block group"
                  >
                    <motion.div 
                      variants={itemVariants} 
                      className="bg-white rounded-2xl p-3 md:p-3.5 shadow-sm hover:shadow-md transition-all flex gap-3.5 md:gap-4 items-center cursor-pointer border border-gray-100 hover:border-gray-200 h-[125px] sm:h-[135px] md:h-[145px] overflow-hidden"
                    >
                      {/* News Image - Fixed dimensions */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
                        <Image 
                          src={item.img} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                          unoptimized 
                        />
                        {(item.social === 'youtube' || item.social === 'instagram' || item.embedUrl) && (
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-md">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* News Content - Uniform flex layout with strict text-ellipsis */}
                      <div className="flex flex-col flex-1 h-full justify-between min-w-0 py-0.5 overflow-hidden">
                        <div>
                          <h3 className="font-bold text-xs sm:text-sm md:text-[14px] text-[#0b1b36] leading-snug group-hover:text-[#8c1c3f] transition-colors line-clamp-1 overflow-hidden text-ellipsis">
                            {item.title}
                          </h3>
                          <p className="text-[9px] md:text-[10px] text-[#8c1c3f] font-bold uppercase tracking-wider mt-0.5">
                            {item.tag}
                          </p>
                        </div>

                        {/* Description / Summary strictly clamped with ellipsis so box size remains identical */}
                        <p className="text-[11px] md:text-[12px] text-[#0b1b36]/70 leading-relaxed line-clamp-2 overflow-hidden text-ellipsis my-auto">
                          {item.summary || "Maktabimiz hayotiga oid so'nggi yangilik va muhim ma'lumotlar bilan tanishing."}
                        </p>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="bg-[#8c1c3f] text-white text-[10px] md:text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                            {item.date}
                          </div>
                          {(item.social === 'youtube' || item.social === 'both') && (
                            <div className="text-[#FF0000]">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"></polygon></svg>
                            </div>
                          )}
                          {(item.social === 'instagram' || item.social === 'both') && (
                            <div className="text-[#E1306C]">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="w-full h-full min-h-[200px] flex items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400 font-medium">
                  Hozircha yangiliklar kiritilmagan
                </div>
              )}
            </div>
            
          </motion.div>

        </div>
      </div>

      {/* Video / Instagram Modal - Reels Clone */}
      {activeReelIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md" 
          onClick={() => setActiveReelIndex(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setActiveReelIndex(null)} 
            className="absolute top-4 left-4 md:left-auto md:right-8 z-50 bg-white/10 text-white rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* Navigation Controls Overlay */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveReelIndex(Math.max(0, activeReelIndex - 1)); }}
              className={`bg-black/40 backdrop-blur-sm text-white rounded-full p-4 border border-white/10 hover:bg-black/60 transition-all transform hover:scale-110 shadow-xl ${activeReelIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveReelIndex(Math.min(allReels.length - 1, activeReelIndex + 1)); }}
              className={`bg-black/40 backdrop-blur-sm text-white rounded-full p-4 border border-white/10 hover:bg-black/60 transition-all transform hover:scale-110 shadow-xl ${activeReelIndex === allReels.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeReelIndex} // Re-animate on change
            className="relative w-full h-full md:w-[450px] lg:w-[520px] md:h-[90vh] lg:h-[95vh] bg-[#0b1b36] md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-white/10" 
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
              <iframe 
                src={allReels[activeReelIndex]}
                className="w-full h-full border-none"
                scrolling="no"
                allow="encrypted-media"
              ></iframe>
            </div>
            
            {/* Overlay hint for mobile since touch is trapped */}
            <div className="md:hidden absolute bottom-6 left-0 right-0 pointer-events-none flex justify-center opacity-70">
              <span className="bg-black/60 text-white text-xs px-4 py-1.5 rounded-full backdrop-blur-md">
                {t("reelsControlHint")}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
