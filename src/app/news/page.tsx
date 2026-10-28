"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Calendar, Tag, ChevronRight, Newspaper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useLanguage, Language } from "@/context/LanguageContext";

interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

interface NewsItem {
  id: string;
  title: LocalizedText | string;
  summary?: LocalizedText | string;
  text?: LocalizedText | string;
  date: string;
  tag?: LocalizedText | string;
  image?: string;
  images?: string[];
  instagramUrl?: string;
  youtubeUrl?: string;
  embedUrl?: string;
  social?: string;
}

export default function NewsPage() {
  const { lang, t } = useLanguage();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const mapNewsItem = (docSnap: any): NewsItem => {
      const data = docSnap.data();
      const rawSocial = data.social || (data.platform === "youtube" || data.youtubeUrl || data.url?.includes("youtube") ? "youtube" : data.platform === "instagram" || data.instagramUrl || data.url?.includes("instagram") ? "instagram" : undefined);
      return {
        id: docSnap.id,
        title: data.title || "Yangilik",
        summary: data.summary || data.content || "",
        text: data.text || data.content || "",
        date: data.date || (data.createdAt ? data.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
        tag: data.tag || (rawSocial === "youtube" ? "YOUTUBE" : rawSocial === "instagram" ? "INSTAGRAM" : "YANGILIK"),
        image: data.imageUrl || data.image || data.thumbnail || "/data/maktab_binosi.png",
        images: data.images,
        instagramUrl: data.instagramUrl || (data.platform === "instagram" ? data.url : undefined),
        youtubeUrl: data.youtubeUrl || (data.platform === "youtube" ? data.url : undefined),
        embedUrl: data.embedUrl,
        social: rawSocial,
      };
    };

    try {
      const newsRef = collection(db, "news");
      const q = query(newsRef, orderBy("date", "desc"));
      let unsub: (() => void) | undefined;

      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map(mapNewsItem);
            setNewsList(fetched);
          } else {
            setNewsList([]);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore ordered news fetch fallback:", err);
          const simpleUnsub = onSnapshot(newsRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched = simpleSnap.docs.map(mapNewsItem);
              fetched.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
              setNewsList(fetched);
            } else {
              setNewsList([]);
            }
            setLoading(false);
          });
          unsub = simpleUnsub;
        }
      );

      return () => {
        if (unsub) unsub();
      };
    } catch {
      setLoading(false);
    }
  }, []);

  const getText = (val: LocalizedText | string | undefined): string => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.uz || val.ru || val.en || "";
    }
    return val;
  };

  const tagOptions = [
    { id: "all", label: t("all") },
    { id: "YUTUQLAR", label: lang === "ru" ? "ДОСТИЖЕНИЯ" : lang === "en" ? "ACHIEVEMENTS" : "YUTUQLAR" },
    { id: "TA'LIM", label: lang === "ru" ? "ОБРАЗОВАНИЕ" : lang === "en" ? "EDUCATION" : "TA'LIM" },
    { id: "XALQARO HAMKORLIK", label: lang === "ru" ? "МЕЖДУНАРОДНЫЕ" : lang === "en" ? "GLOBAL" : "XALQARO HAMKORLIK" },
    { id: "QABUL 2026", label: lang === "ru" ? "ПРИЁМ 2026" : lang === "en" ? "ADMISSIONS 2026" : "QABUL 2026" },
    { id: "TADBIRLAR", label: lang === "ru" ? "МЕРОПРИЯТИ" : lang === "en" ? "EVENTS" : "TADBIRLAR" },
  ];

  const filteredNews = newsList.filter((item) => {
    const titleStr = getText(item.title);
    const summaryStr = getText(item.summary);
    const textStr = getText(item.text);
    const tagStr = getText(item.tag);

    const matchesSearch =
      titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summaryStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      textStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === "all" || tagStr.toUpperCase().includes(selectedTag.toUpperCase());

    return matchesSearch && matchesTag;
  });

  const headerBadge = lang === "ru" ? "Последние новости" : lang === "en" ? "Latest News" : "So'nggi yangiliklar";
  const headerTitle = lang === "ru" ? "Новости нашей школы" : lang === "en" ? "Our School News" : "Maktabimiz Yangiliklari";
  const headerSubtitle = lang === "ru" 
    ? "Познакомьтесь с актуальными событиями, достижениями и новостями ZIYO-ZUKKO." 
    : lang === "en" 
    ? "Explore events, student achievements, and academic news at ZIYO-ZUKKO." 
    : "ZIYO-ZUKKO ta'lim muassasasidagi barcha tadbirlar, erishilgan yutuqlar va ta'lim xabarlari bilan tanishing.";

  const searchPlaceholder = lang === "ru" ? "Поиск новостей..." : lang === "en" ? "Search news..." : "Yangilik izlash...";
  const loadingText = lang === "ru" ? "Новости загружаются..." : lang === "en" ? "Loading news..." : "Yangiliklar yuklanmoqda...";
  const emptyTitle = lang === "ru" ? "Новости не найдены" : lang === "en" ? "No news found" : "Hozircha yangilik topilmadi";
  const emptyDesc = lang === "ru" 
    ? "По вашему запросу новостей не найдено. Попробуйте другие ключевые слова." 
    : lang === "en" 
    ? "No news articles matched your search query. Try different keywords." 
    : "Izlash so'rovingizga mos yangiliklar topilmadi. Boshqa kalit so'zlardan foydalanib ko'ring.";
  const showAllBtn = lang === "ru" ? "Показать все новости" : lang === "en" ? "Show all news" : "Barcha yangiliklarni ko'rsatish";

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[url('/images/bg-ornament.png')] bg-repeat bg-[size:360px_auto] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#ff6b00]" />
            {t("backToHome")}
          </Link>
        </div>

        {/* Title & Header White Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200/80 shadow-xl shadow-slate-900/5 mb-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-bold uppercase tracking-wider mb-3">
                <Newspaper className="w-4 h-4" />
                {headerBadge}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                {headerTitle}
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-2 font-medium">
                {headerSubtitle}
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {tagOptions.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                selectedTag === tag.id
                  ? "bg-[#071a33] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-[#071a33]"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-[#ff6b00] rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-semibold">{loadingText}</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm my-8">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#071a33] mb-2">{emptyTitle}</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {emptyDesc}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
              className="px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm hover:bg-[#e05e00] transition-colors cursor-pointer"
            >
              {showAllBtn}
            </button>
          </div>
        ) : (
          /* News Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((news, index) => {
              const newsTitle = getText(news.title);
              const newsSummary = getText(news.summary || news.text);
              const newsTag = getText(news.tag);

              return (
                <motion.article
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                    <Image
                      src={news.image || (news.images && news.images[0]) || "/data/maktab_binosi.png"}
                      alt={newsTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    {newsTag && (
                      <div className="absolute top-4 left-4 bg-[#071a33]/80 backdrop-blur-md text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                        {newsTag}
                      </div>
                    )}
                    {(news.youtubeUrl || news.social === "youtube") ? (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        YouTube
                      </div>
                    ) : (news.instagramUrl || news.social === "instagram") ? (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        Instagram
                      </div>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-3">
                        <Calendar className="w-3.5 h-3.5 text-[#ff6b00]" />
                        <span>{news.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#071a33] group-hover:text-[#ff6b00] transition-colors line-clamp-2 leading-snug mb-3">
                        {newsTitle}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-6">
                        {newsSummary}
                      </p>
                    </div>

                    <Link
                      href={`/news/${news.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff6b00] uppercase tracking-wide group/btn hover:underline"
                    >
                      {t("readMore")}
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
