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
}

const fallbackNews: NewsItem[] = [
  {
    id: "news-1",
    date: "24.08.2026",
    title: {
      uz: "Woosong Universiteti huzuridagi iDegree rahbariyati bilan rasmiy uchrashuv bo'lib o'tdi",
      ru: "Официальная встреча с руководством iDegree при Университете Вусонг",
      en: "Official meeting with the leadership of iDegree at Woosong University",
    },
    summary: {
      uz: "Xalqaro qo'shma ta'lim dasturlari bo'yicha muhokamalar o'tkazilib, bitiruvchilarga 2 ta diplom olish imkoniyati yaratilishi kelishib olindi.",
      ru: "Обсуждены совместные международные образовательные программы и возможность получения двойного диплома для выпускников.",
      en: "Discussions were held on joint international academic programs and dual-degree opportunities for graduates.",
    },
    text: {
      uz: "Uchrashuv davomida qo'shma ta'lim dasturlari, talabalar almashinuvi hamda xalqaro grant dasturlari bo'yicha muhim bitimlar imzolandi. ZIYO-ZUKKO maktabi bitiruvchilari uchun Janubiy Koreyaning nufuzli oliygohlariga to'g'ridan-to'g'ri qabul qilinish imkoniyati taklif etildi.",
      ru: "В ходе встречи были подписаны важные соглашения о совместных программах обучения, обмене студентами и международных грантах. Выпускникам ZIYO-ZUKKO предложен прямой приём в престижные вузы Южной Кореи.",
      en: "During the meeting, key agreements were signed on joint curricula, student exchanges, and international scholarship grants. Direct admission to prestigious universities in South Korea was offered to ZIYO-ZUKKO graduates.",
    },
    tag: {
      uz: "XALQARO HAMKORLIK",
      ru: "МЕЖДУНАРОДНОЕ СОТРУДНИЧЕСТВО",
      en: "GLOBAL PARTNERSHIP",
    },
    image: "/rasmlar/2026-10-02 17.59.48.jpg",
  },
  {
    id: "news-2",
    date: "19.08.2026",
    title: {
      uz: "Sarbon Universiteti va British Council hamkorligi kengaymoqda",
      ru: "Расширение сотрудничества с Университетом Сарбон и British Council",
      en: "Expanding cooperation with Sarbon University and the British Council",
    },
    summary: {
      uz: "Xalqaro standartlarga mos ingliz tili darslarini tashkil qilish hamda IELTS imtihon markazi ochish bo'yicha bitim tuzildi.",
      ru: "Подписано соглашение об организации уроков английского по международным стандартам и открытии центра тестирования IELTS.",
      en: "An agreement was reached on organizing English classes to international standards and establishing an IELTS testing center.",
    },
    text: {
      uz: "Xalqaro standartlarga mos ingliz tili darslarini tashkil qilish to'g'risida kelishib olindi. Kelishuvga muvofiq maktabimizda doimiy ravishda mock IELTS testlari o'tkazib boriladi.",
      ru: "Достигнута договоренность об организации уроков английского языка по мировым стандартам. В нашей школе будут регулярно проводиться пробные тесты IELTS.",
      en: "Agreement was reached on implementing high-standard English curricula. In accordance with the partnership, mock IELTS tests will be conducted regularly at our school.",
    },
    tag: {
      uz: "TA'LIM",
      ru: "ОБРАЗОВАНИЕ",
      en: "EDUCATION",
    },
    image: "/rasmlar/2026-10-02 17.59.54.jpg",
  },
  {
    id: "news-3",
    date: "04.09.2026",
    title: {
      uz: "National AI Hackathon | Qarshi bosqichi g'oliblari aniqlandi",
      ru: "National AI Hackathon | Определены победители этапа в Карши",
      en: "National AI Hackathon | Karshi Winners Announced",
    },
    summary: {
      uz: "Qarshi shahrida bo'lib o'tgan sun'iy intellekt xakatonida bizning jamoa faxrli 1-o'rinni egalladi.",
      ru: "Наша команда заняла почетное 1-е место на хакатоне по искусственному интеллекту в Карши.",
      en: "Our team took 1st place at the artificial intelligence hackathon held in Karshi.",
    },
    text: {
      uz: "Qarshi shahrida bo'lib o'tgan sun'iy intellekt xakatonida ZIYO-ZUKKO o'quvchilari o'zlarining innovatsion AI loyihalari bilan hakamlar va ekspertlarni hayratda qoldirishdi.",
      ru: "Ученики ZIYO-ZUKKO поразили судей и экспертов своими инновационными проектами искусственного интеллекта на хакатоне в Карши.",
      en: "At the AI hackathon in Karshi, ZIYO-ZUKKO students astonished judges and industry experts with their cutting-edge AI project.",
    },
    tag: {
      uz: "YUTUQLAR",
      ru: "ДОСТИЖЕНИЯ",
      en: "ACHIEVEMENTS",
    },
    image: "/rasmlar/2026-10-02 18.00.24.jpg",
  },
  {
    id: "news-4",
    date: "15.07.2026",
    title: {
      uz: "Yangi o'quv yili uchun qabul jarayonlari va Sarbon University vakansiyalari",
      ru: "Приём документов на новый учебный год и вакансии",
      en: "Admissions for the new academic year & career vacancies",
    },
    summary: {
      uz: "Ziyo-Zukko tizimi jamoasiga qo'shilishni istaysizmi? Qabul tartibi va vakant o'rinlar e'lon qilindi.",
      ru: "Хотите присоединиться к коллективу Ziyo-Zukko? Опубликован порядок приёма и список вакансий.",
      en: "Interested in joining the Ziyo-Zukko academic community? Admission guidelines and open positions announced.",
    },
    text: {
      uz: "Yangi 2026-2027 o'quv yili uchun sinov imtihonlari hamda hujjatlar topshirish tartibi e'lon qilindi. Shuningdek, iqtidorli pedagoglar va metodistlar uchun bo'sh ish o'rinlari mavjud.",
      ru: "Опубликованы правила вступительных экзаменов и подачи документов на 2026-2027 учебный год, а также открыты вакансии для талантливых педагогов.",
      en: "Examination schedules and document submission procedures for the 2026-2027 academic year have been published, alongside openings for educators.",
    },
    tag: {
      uz: "QABUL 2026",
      ru: "ПРИЁМ 2026",
      en: "ADMISSIONS 2026",
    },
    image: "/rasmlar/2026-10-02 18.01.23.jpg",
  },
  {
    id: "news-5",
    date: "06.07.2026",
    title: {
      uz: "Maktabimizda sog'lom turmush tarzi va yoshlar profilaktikasi tadbiri",
      ru: "Мероприятие по здоровому образу жизни и молодежной профилактике",
      en: "Healthy Lifestyle & Youth Wellness Event at Our School",
    },
    summary: {
      uz: "O'quvchilar o'rtasida huquqiy savodxonlik va sog'lom turmush tarzini targ'ib qilishga bag'ishlangan uchrashuv.",
      ru: "Встреча, посвященная повышению правовой грамотности и здоровому образу жизни учащихся.",
      en: "An inspiring forum dedicated to healthy living, wellness, and youth development.",
    },
    text: {
      uz: "Ichki ishlar organlari vakillari va tibbiyot mutaxassislari ishtirokida davra suhbati o'tkazildi. O'quvchilar o'zlarini qiziqtirgan savollarga javob olishdi.",
      ru: "Состоялся открытый круглый стол с участием медицинских специалистов. Учащиеся получили ответы на актуальные вопросы.",
      en: "A roundtable discussion was held with healthcare experts, providing students with meaningful answers and guidance.",
    },
    tag: {
      uz: "TADBIRLAR",
      ru: "МЕРОПРИЯТИ",
      en: "EVENTS",
    },
    image: "/rasmlar/2026-10-02 17.58.25.jpg",
  },
  {
    id: "news-6",
    date: "01.07.2026",
    title: {
      uz: "DOLZARB 90 KUN: Pedagoglar uchun mahorat darsi o'tkazildi",
      ru: "АКТУАЛЬНЫЕ 90 ДНЕЙ: Мастер-класс для педагогов",
      en: "URGENT 90 DAYS: Masterclass for Educators",
    },
    summary: {
      uz: "ZIYO-ZUKKO tizimidagi natijalar va o'qituvchilar uchun maxsus interaktiv seminar-trening.",
      ru: "Интерактивный обучающий семинар-тренинг для преподавателей системы ZIYO-ZUKKO.",
      en: "Interactive professional development seminar for teachers across the ZIYO-ZUKKO network.",
    },
    text: {
      uz: "O'qituvchilarning kasbiy mahoratini oshirish, zamonaviy interaktiv metodikalarni ta'lim jarayoniga joriy etish masalalari ko'rib chiqildi.",
      ru: "Рассмотрены вопросы повышения квалификации учителей и интеграции передовых интерактивных методов в учебный процесс.",
      en: "Key strategies for instructional excellence and integrating innovative methods into classroom teaching were explored.",
    },
    tag: {
      uz: "SEMINAR",
      ru: "СЕМИНАР",
      en: "WORKSHOP",
    },
    image: "/rasmlar/2026-10-02 17.58.36.jpg",
  }
];

export default function NewsPage() {
  const { lang, t } = useLanguage();
  const [newsList, setNewsList] = useState<NewsItem[]>(fallbackNews);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      const newsRef = collection(db, "news");
      const q = query(newsRef, orderBy("date", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || "Yangilik",
                summary: data.summary || data.content || "",
                text: data.text || data.content || "",
                date: data.date || new Date().toISOString().split("T")[0],
                tag: data.tag || "YANGILIK",
                image: data.imageUrl || data.image || "/rasmlar/2026-10-02 17.59.48.jpg",
                images: data.images,
              };
            }) as NewsItem[];
            setNewsList([...fetched, ...fallbackNews]);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Firestore news fetch error:", err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
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
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16">
        {/* Back Link & Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all mb-6 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#ff6b00]" />
            {t("backToHome")}
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-bold uppercase tracking-wider mb-3">
                <Newspaper className="w-4 h-4" />
                {headerBadge}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                {headerTitle}
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl font-medium">
                {headerSubtitle}
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
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
                      src={news.image || (news.images && news.images[0]) || "/rasmlar/2026-10-02 17.59.48.jpg"}
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
