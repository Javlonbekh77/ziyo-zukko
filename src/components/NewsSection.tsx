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

const fallbackMultilingualNews: MultilingualNewsItem[] = [
  {
    id: "news-1",
    title: {
      uz: "Maktabimizda bayram shukuhi!",
      ru: "Праздничная атмосфера в нашей школе!",
      en: "Festive Atmosphere at Our School!",
    },
    summary: {
      uz: "O'quvchilar tomonidan tayyorlangan maxsus bayram dasturi ajoyib o'tdi. To'liq tafsilotlar va rasmlar galereyasi sahifada e'lon qilindi.",
      ru: "Специальная праздничная программа, подготовленная учащимися, прошла на высшем уровне. Подробности и фотогалерея опубликованы на сайте.",
      en: "A special celebratory event organized by our students was a great success. Full details and photo gallery are available on our website.",
    },
    tag: {
      uz: "TADBIRLAR",
      ru: "МЕРОПРИЯТИ",
      en: "EVENTS",
    },
    img: "/rasmlar/2026-10-02 17.59.48.jpg",
    date: "2026-10-02",
    social: "instagram",
  },
  {
    id: "news-2",
    title: {
      uz: "National AI Hackathon | Qarshi g'oliblari",
      ru: "National AI Hackathon | Победители в Карши",
      en: "National AI Hackathon | Karshi Winners",
    },
    summary: {
      uz: "Qarshi shahrida bo'lib o'tgan sun'iy intellekt xakatonida bizning jamoa g'olib bo'ldi. Ular o'z loyihalari bilan hakamlarni lol qoldirdilar.",
      ru: "Наша команда одержала победу на хакатоне по искусственному интеллекту в Карши, впечатлив судей инновационным проектом.",
      en: "Our student team triumphed at the artificial intelligence hackathon in Karshi, impressing the jury with their cutting-edge solutions.",
    },
    tag: {
      uz: "YUTUQLAR",
      ru: "ДОСТИЖЕНИЯ",
      en: "ACHIEVEMENTS",
    },
    img: "/rasmlar/2026-10-02 17.59.54.jpg",
    date: "2026-09-04",
    social: "youtube",
  },
  {
    id: "news-3",
    title: {
      uz: "🔴 Diqqat! Hurmatli ota-onalar!",
      ru: "🔴 Внимание! Уважаемые родители!",
      en: "🔴 Attention! Dear Parents!",
    },
    summary: {
      uz: "Yangi o'quv yili uchun qabul jarayonlari boshlandi. Barcha kerakli hujjatlar ro'yxati saytimizda e'lon qilindi. Shoshiling, o'rinlar soni cheklangan.",
      ru: "Стартовал приём документов на новый учебный год. Перечень документов опубликован на сайте. Спешите, количество мест ограничено.",
      en: "Admissions for the new academic year have officially begun. The required document checklist is published on our website. Hurry, spots are limited.",
    },
    tag: {
      uz: "QABUL 2026",
      ru: "ПРИЁМ 2026",
      en: "ADMISSION 2026",
    },
    img: "/rasmlar/2026-10-02 18.00.24.jpg",
    date: "2026-09-04",
    social: "instagram",
  },
  {
    id: "news-4",
    title: {
      uz: "DOLZARB 90 KUNNING 9-DARSI",
      ru: "АКТУАЛЬНЫЕ 90 ДНЕЙ: 9-Й УРОК",
      en: "URGENT 90 DAYS: LESSON 9",
    },
    summary: {
      uz: "ZIYO-ZUKKO tizimidagi natijalar va o'qituvchilar uchun maxsus seminar trening bo'lib o'tdi. Tajriba almashish va yangi metodikalarni o'rganish.",
      ru: "Для учителей системы ZIYO-ZUKKO прошёл интерактивный семинар-тренинг: обмен передовым опытом и освоение современных методик преподавания.",
      en: "A professional development seminar-workshop was held for teachers of ZIYO-ZUKKO: exchanging best practices and mastering modern teaching methodologies.",
    },
    tag: {
      uz: "SEMINAR",
      ru: "СЕМИНАР",
      en: "WORKSHOP",
    },
    img: "/rasmlar/2026-10-02 18.01.23.jpg",
    date: "2026-09-04",
    social: "both",
  },
];

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

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "news");
      const q = query(colRef, orderBy("date", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: RawNewsItem[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title,
                title_uz: data.title_uz,
                title_ru: data.title_ru,
                title_en: data.title_en,
                summary: data.summary || data.content,
                summary_uz: data.summary_uz || data.content_uz,
                summary_ru: data.summary_ru || data.content_ru,
                summary_en: data.summary_en || data.content_en,
                tag: data.tag || "YANGILIK",
                tag_uz: data.tag_uz,
                tag_ru: data.tag_ru,
                tag_en: data.tag_en,
                img: data.imageUrl || data.image || "/rasmlar/2026-10-02 17.59.48.jpg",
                date: data.date || new Date().toISOString().split("T")[0],
                social: "both",
              };
            });
            setRawDbNews(fetched);
            setLocalCache("news_home_cache", fetched);
          }
        },
        (error) => {
          console.warn("News ordered query fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: RawNewsItem[] = simpleSnap.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  title: data.title,
                  title_uz: data.title_uz,
                  title_ru: data.title_ru,
                  title_en: data.title_en,
                  summary: data.summary || data.content,
                  summary_uz: data.summary_uz || data.content_uz,
                  summary_ru: data.summary_ru || data.content_ru,
                  summary_en: data.summary_en || data.content_en,
                  tag: data.tag || "YANGILIK",
                  tag_uz: data.tag_uz,
                  tag_ru: data.tag_ru,
                  tag_en: data.tag_en,
                  img: data.imageUrl || data.image || "/rasmlar/2026-10-02 17.59.48.jpg",
                  date: data.date || new Date().toISOString().split("T")[0],
                  social: "both",
                };
              });
              setRawDbNews(fetched);
              setLocalCache("news_home_cache", fetched);
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
  const displayNewsItems = [
    ...rawDbNews.map((n) => ({
      id: n.id,
      title: getLocalizedField(n, "title", lang) || "Yangilik",
      summary: getLocalizedField(n, "summary", lang) || "",
      tag: getLocalizedField(n, "tag", lang) || (lang === "ru" ? "НОВОСТИ" : lang === "en" ? "NEWS" : "YANGILIKLAR"),
      img: n.img || "/rasmlar/2026-10-02 17.59.48.jpg",
      date: n.date,
      social: n.social || "both",
      embedUrl: n.embedUrl,
    })),
    ...fallbackMultilingualNews.map((fn) => ({
      id: fn.id,
      title: fn.title[lang],
      summary: fn.summary[lang],
      tag: fn.tag[lang],
      img: fn.img,
      date: fn.date,
      social: fn.social,
      embedUrl: fn.embedUrl,
    })),
  ].slice(0, 4);

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

  const defaultInstagramPosts = [
    { id: "insta-1", img: "/rasmlar/2026-10-02 17.56.31.jpg", caption: "Ziyo-Zukko", embedUrl: "https://www.instagram.com/reel/DcdjzZyIn4U/embed/" },
    { id: "insta-2", img: "/rasmlar/2026-10-02 17.57.37.jpg", caption: "Ziyo-Zukko", embedUrl: "https://www.instagram.com/reel/DdRVaynILqp/embed/" },
    { id: "insta-3", img: "/rasmlar/2026-10-02 17.57.45.jpg", caption: "Ziyo-Zukko", embedUrl: "https://www.instagram.com/reel/DcacjDUou03/embed/" },
    { id: "insta-4", img: "/rasmlar/2026-10-02 17.58.25.jpg", caption: "Ziyo-Zukko", embedUrl: "https://www.instagram.com/reel/Dd8zNhfohUj/embed/" },
    { id: "insta-5", img: "/rasmlar/2026-10-02 17.58.36.jpg", caption: "Ziyo-Zukko", embedUrl: "https://www.instagram.com/reel/Dd731klCfdu/embed/" },
    { id: "insta-6", img: "/rasmlar/2026-10-02 17.58.46.jpg", caption: "Ziyo-Zukko", embedUrl: "https://www.instagram.com/reel/Dd7y1wgoFbG/embed/" },
  ];

  const [instagramPosts, setInstagramPosts] = useState<any[]>(defaultInstagramPosts);

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
                img: data.thumbnail || "/rasmlar/2026-10-02 17.56.31.jpg",
                caption: data.title || "Ziyo-Zukko",
                embedUrl: data.embedUrl || (data.url?.includes("instagram.com") ? `${data.url.split("?")[0].replace(/\/embed\/?$/, "").replace(/\/$/, "")}/embed/` : undefined),
                platform: data.platform,
              };
            })
            .filter((v) => v.platform === "instagram" && v.embedUrl);

          if (instaVids.length > 0) {
            setInstagramPosts([...instaVids, ...defaultInstagramPosts].slice(0, 8));
          }
        }
      });

      return () => unsubVids();
    } catch (e) {
      console.error("Error setting up insta vids listener:", e);
    }
  }, []);

  const allReels = [
    ...instagramPosts.filter((p) => p.embedUrl).map((p) => p.embedUrl!),
    ...displayNewsItems.filter((n) => n.embedUrl).map((n) => n.embedUrl!),
  ];

  const openReel = (embedUrl: string) => {
    const index = allReels.indexOf(embedUrl);
    if (index !== -1) setActiveReelIndex(index);
  };

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
              <FeatureCarousel 
                items={instagramPosts.slice(0, 6)} 
              />
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
            
            <div className="flex flex-col gap-1.5 md:gap-2 h-full justify-between">
              {displayNewsItems.map((item) => (
                <div 
                  key={item.id} 
                  className="block h-full"
                  onClick={() => item.embedUrl ? openReel(item.embedUrl) : null}
                >
                  <Link href={`/news/${item.id}`} className="block h-full">
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl p-2 md:p-3 h-full shadow-sm hover:shadow-md transition-all flex gap-3 md:gap-4 items-center group cursor-pointer border border-gray-100">
                      {/* News Image */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
                      {item.embedUrl ? (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                          <iframe 
                            src={`${item.embedUrl}?hidecaption=1`} 
                            className="absolute w-[120%] left-[-10%] border-none" 
                            style={{ height: '160%', top: '-30%' }}
                            scrolling="no" 
                            tabIndex={-1}
                          />
                        </div>
                      ) : (
                        <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 unoptimized" unoptimized />
                      )}
                    </div>
                    
                    {/* News Content */}
                    <div className="flex flex-col flex-1 h-full py-0.5">
                      <h3 className="font-bold text-sm md:text-[15px] text-[#0b1b36] mb-1 leading-snug group-hover:text-[#8c1c3f] transition-colors line-clamp-2">{item.title}</h3>
                      <p className="text-[9px] md:text-[11px] text-[#8c1c3f] font-semibold mb-1">{item.tag}</p>
                      <p className="text-[11px] md:text-[12px] text-[#0b1b36]/60 mb-1.5 line-clamp-1 sm:line-clamp-2 hidden sm:block">{item.summary}</p>
                      
                      <div className="mt-auto flex items-center gap-2">
                        <div className="bg-[#8c1c3f] text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg">
                          {item.date}
                        </div>
                        {(item.social === 'youtube' || item.social === 'both') && (
                          <div className="text-[#FF0000]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"></polygon></svg>
                          </div>
                        )}
                        {(item.social === 'instagram' || item.social === 'both') && (
                          <div className="text-[#E1306C]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  </Link>
                </div>
              ))}
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
