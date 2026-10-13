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

const fallbackNewsMap: Record<string, NewsDetailItem> = {
  "news-1": {
    id: "news-1",
    date: "2026-09-04",
    title: {
      uz: "🏆 IMC 2026: Yana bir faxrli yutuq!",
      ru: "🏆 IMC 2026: Еще одно почетное достижение!",
      en: "🏆 IMC 2026: Another Proud Triumph!",
    },
    summary: {
      uz: "Xalqaro matematika olimpiadasida o'quvchilarimiz navbatdagi rekord natijani qayd etishdi.",
      ru: "Наши ученики установили очередной рекорд на Международной олимпиаде по математике.",
      en: "Our students achieved a record-breaking result at the International Mathematics Competition.",
    },
    text: {
      uz: `#FAOLIYATIMIZ
🏛️ ZIYO-ZUKKO umumta'lim maktabi
🏆 IMC 2026: Yana bir faxrli yutuq!

🌍 22-27-iyul kunlari bo'lib o'tgan, 32 ta davlatdan 600 dan ortiq iqtidorli o'quvchilar qatnashgan Xalqaro matematika musobaqasi (IMC 2026)da O'zbekiston terma jamoasi tarkibida maktabimiz o'quvchilari ham munosib ishtirok etishdi.

O'quvchilarimiz 1 ta Bronza medali hamda faxriy yorliqlarni qo'lga kiritib, yurtimiz sharafini munosib himoya qilishdi.`,
      ru: `#ДЕЯТЕЛЬНОСТЬ
🏛️ Общеобразовательная школа ZIYO-ZUKKO
🏆 IMC 2026: Очередная гордая победа!

🌍 В Международном математическом соревновании (IMC 2026), где приняли участие более 600 талантливых школьников из 32 стран, учащиеся нашей школы в составе сборной Узбекистана показали блестящие результаты.

Наши ученики завоевали бронзовую медаль и почетные грамоты, достойно представив честь нашей страны.`,
      en: `#OUR_ACTIVITIES
🏛️ ZIYO-ZUKKO School
🏆 IMC 2026: Another Remarkable Achievement!

🌍 At the International Mathematics Competition (IMC 2026), featuring over 600 gifted students from 32 countries, our students competed as part of Uzbekistan's national team with distinction.

Our students earned a Bronze medal and honorary diplomas, representing our country with distinction.`,
    },
    image: "/rasmlar/2026-10-02 17.59.48.jpg",
  },
  "news-2": {
    id: "news-2",
    date: "2026-08-19",
    title: {
      uz: "🤝 British Council hamda Sarbon Universiteti hamkorligi",
      ru: "🤝 Сотрудничество с British Council и Университетом Сарбон",
      en: "🤝 Strategic Partnership with the British Council & Sarbon University",
    },
    summary: {
      uz: "Xalqaro ta'lim va IELTS markazlari bo'yicha muhim kelishuv imzolandi.",
      ru: "Подписано ключевое соглашение в сфере международного образования и центров IELTS.",
      en: "Key agreement signed regarding international education and official IELTS examination centers.",
    },
    text: {
      uz: `#HAMKORLIK
🇬🇧 British Council bilan hamkorlikda xalqaro Cambridge va IELTS test markazi yo'lga qo'yilmoqda.

Ushbu loyiha doirasida o'quvchilar bepul Mock IELTS sinovlaridan o'tishlari va xalqaro sertifikat olish uchun to'g'ridan-to'g'ri maktabda tayyorgarlik ko'rishlari mumkin.`,
      ru: `#СОТРУДНИЧЕСТВО
🇬🇧 В сотрудничестве с British Council открывается международный центр тестирования Cambridge и IELTS.

В рамках проекта школьники смогут сдавать бесплатные пробные тесты Mock IELTS и готовиться к получению сертификатов мирового уровня.`,
      en: `#PARTNERSHIP
🇬🇧 In collaboration with the British Council, an official Cambridge and IELTS testing hub is being established.

As part of this initiative, students can take complimentary Mock IELTS assessments and prepare for world-class certificates.`,
    },
    image: "/rasmlar/2026-10-02 17.59.54.jpg",
  }
};

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { lang, t } = useLanguage();
  const resolvedParams = use(params);
  const newsId = resolvedParams.id;

  const [news, setNews] = useState<NewsDetailItem | null>(fallbackNewsMap[newsId] || fallbackNewsMap["news-1"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      if (fallbackNewsMap[newsId]) {
        setNews(fallbackNewsMap[newsId]);
        setLoading(false);
        return;
      }

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
            image: data.imageUrl || data.image || "/rasmlar/2026-10-02 17.59.48.jpg",
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

  const displayNews = news || fallbackNewsMap["news-1"];
  const imageSrc = (displayNews.images && displayNews.images[0]) || displayNews.image || "/rasmlar/2026-10-02 17.59.48.jpg";
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
