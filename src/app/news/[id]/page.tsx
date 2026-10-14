"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useLanguage, Language } from "@/context/LanguageContext";

interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

interface NewsDetailItem {
  id: string;
  title: LocalizedText | string;
  summary?: LocalizedText | string;
  text?: LocalizedText | string;
  date: string;
  tag?: LocalizedText | string;
  image?: string;
  images?: string[];
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { lang, t } = useLanguage();
  const resolvedParams = use(params);
  const newsId = resolvedParams.id;

  const [news, setNews] = useState<NewsDetailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {


      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "news", newsId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNews({
            id: docSnap.id,
            title: data.title || "Yangilik",
            summary: data.summary || data.content || "",
            text: data.text || data.content || data.summary || "",
            date: data.date || "",
            tag: data.tag || "YANGILIK",
            image: data.imageUrl || data.image || "/data/maktab_binosi.png",
            images: data.images,
          } as NewsDetailItem);
        }
      } catch (err) {
        console.error("Error fetching single news:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [newsId]);

  const getText = (val: LocalizedText | string | undefined): string => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.uz || val.ru || val.en || "";
    }
    return val;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#071a33] py-20 px-4 flex flex-col items-center justify-center font-sans">
        <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-[#ff6b00] rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-semibold">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#071a33] py-20 px-4 flex flex-col items-center justify-center font-sans">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-[#071a33] mb-4">Yangilik topilmadi</h2>
          <Link href="/news" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff6b00] text-white font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Barcha yangiliklar
          </Link>
        </div>
      </div>
    );
  }

  const displayNews = news;
  const imageSrc = (displayNews.images && displayNews.images[0]) || displayNews.image || "/data/maktab_binosi.png";
  const titleStr = getText(displayNews.title);
  const textStr = getText(displayNews.text || displayNews.summary);

return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] py-10 px-4 flex flex-col items-center font-sans">
      {/* Top Pill Back Button */}
      <div className="w-full max-w-[900px] mb-8 flex justify-center sm:justify-start">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white font-bold text-sm transition-all duration-300 shadow-sm border border-[#ff6b00]/20 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToNews")}
        </Link>
      </div>

      {/* Main Clean Card Container */}
      <article className="w-full max-w-[900px] bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl border border-gray-100 space-y-8">
        {/* Title & Date */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#071a33] leading-snug tracking-tight">
            {titleStr}
          </h1>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-lg w-max">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{displayNews.date}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative w-full h-[280px] sm:h-[400px] md:h-[480px] bg-slate-100 rounded-2xl overflow-hidden border border-gray-100 shadow-md">
          <Image
            src={imageSrc}
            alt={titleStr}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Article Text Content */}
        <div className="text-gray-700 font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
          {textStr}
        </div>
      </article>
    </div>
  );
}
