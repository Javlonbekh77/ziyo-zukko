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

const defaultOlympiads: OlympiadCardItem[] = [
  {
    id: "yutuq-1",
    title: {
      uz: "Maktabdagi ta’lim katta natijalarga yo‘l! Bunyodbek — Matematika olimpiadasi g'olibi",
      ru: "Образование в школе — путь к успеху! Бунёдбек — победитель математической олимпиады",
      en: "Quality education opens doors to success! Bunyodbek — Math Olympiad Winner",
    },
    text: {
      uz: "🎓 Bunyodbek Ziyo Zukko maktabining o‘quvchisi. U 🇲🇾 Malayziyada o‘tkazilgan matematika olimpiadasida 🥇 1-o‘rin, mental arifmetika yo‘nalishida esa 🥉 3-o‘rinni egalladi. 📚 Bunyodbek to‘qqiz yildan buyon Ziyo Zukko maktabida tahsil oladi!",
      ru: "🎓 Бунёдбек — ученик школы Ziyo Zukko. На олимпиаде по математике в Малайзии он занял 🥇 1-е место, а по ментальной арифметике — 🥉 3-е место. 📚 Учится в Ziyo Zukko уже девять лет!",
      en: "🎓 Bunyodbek is a proud student of Ziyo Zukko. At the International Math Olympiad in Malaysia, he won 🥇 1st place in mathematics and 🥉 3rd place in mental arithmetic. 📚 He has studied at Ziyo Zukko for 9 years!",
    },
    image: "/rasmlar/yutuqlar/bunyodbek.jpg",
    badge: {
      uz: "🥇 1-o'rin (Malayziya)",
      ru: "🥇 1-е место (Малайзия)",
      en: "🥇 1st Place (Malaysia)",
    },
    showOnHome: true,
  },
  {
    id: "yutuq-2",
    title: {
      uz: "🏅 11-sinf bitiruvchisi Abdullayeva Lobar oltin medal bilan taqdirlandi!",
      ru: "🏅 Выпускница 11-класса Абдуллаева Лобар награждена золотой медалью!",
      en: "🏅 Grade 11 graduate Abdullayeva Lobar awarded Gold Medal!",
    },
    text: {
      uz: "“Ziyo-zukko umumta’lim maktabi” NTMning 11-“A” sinf bitiruvchisi Abdullayeva Lobar Nigmatullayevna a’lo baholari va erishgan yutuqlari uchun O‘zbekiston Respublikasi Maktabgacha va maktab ta’limi vazirligi tomonidan oltin medal bilan taqdirlandi.",
      ru: "Выпускница 11-«А» класса школы Ziyo-Zukko Абдуллаева Лобар Нигматуллаевна награждена золотой медалью Министерства дошкольного и школьного образования Республики Узбекистан.",
      en: "Grade 11-A graduate of Ziyo-Zukko school, Abdullayeva Lobar, was honored with the prestigious Gold Medal by the Ministry of Preschool and School Education of the Republic of Uzbekistan.",
    },
    image: "/rasmlar/yutuqlar/lobar.jpg",
    badge: {
      uz: "🏅 Oltin medal",
      ru: "🏅 Золотая медаль",
      en: "🏅 Gold Medal",
    },
    showOnHome: true,
  },
  {
    id: "yutuq-3",
    title: {
      uz: "Tulkinjonova Osiyo — Cambridge English Young Learners Flyers darajasi!",
      ru: "Тулкинжонова Осиё — уровень Cambridge English Young Learners Flyers!",
      en: "Tulkinjonova Osiyo — Cambridge English Young Learners Flyers achiever!",
    },
    text: {
      uz: "“Ziyo-zukko umumta’lim maktabi” NTMning 4-“E” sinf o‘quvchisi Tulkinjonova Osiyo xalqaro “Cambridge English Young Learners” imtihonida muvaffaqiyatli ishtirok etib, “Flyers” darajasini qo‘lga kiritdi.",
      ru: "Ученица 4-«Е» класса школы Ziyo-Zukko Тулкинжонова Осиё успешно сдала международный кембриджский экзамен, получив сертификат высшего уровня «Flyers».",
      en: "Grade 4-E student of Ziyo-Zukko school, Tulkinjonova Osiyo, successfully passed the international Cambridge English Young Learners exam and achieved the Flyers certificate.",
    },
    image: "/rasmlar/yutuqlar/osiyo.jpg",
    badge: {
      uz: "📜 Cambridge Flyers",
      ru: "📜 Cambridge Flyers",
      en: "📜 Cambridge Flyers",
    },
    showOnHome: true,
  },
];

export default function OlympiadsSection() {
  const { lang, t } = useLanguage();
  const [olympiads, setOlympiads] = useState<OlympiadCardItem[]>(defaultOlympiads.slice(0, 3));

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
        setOlympiads(defaultOlympiads.slice(0, 3));
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
                  text: data.text || data.description || "",
                  image: data.imageUrl || "/rasmlar/yutuqlar/bunyodbek.jpg",
                  badge: data.badge || data.result || "Yutuq",
                  showOnHome: true,
                });
              }
            });
            const merged = [...fetched, ...defaultOlympiads].slice(0, 3);
            setOlympiads(merged);
            setLocalCache("olympiads_home_cache", merged);
          } else {
            setOlympiads(defaultOlympiads.slice(0, 3));
            setLocalCache("olympiads_home_cache", defaultOlympiads.slice(0, 3));
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
                    text: data.text || data.description || "",
                    image: data.imageUrl || "/rasmlar/yutuqlar/bunyodbek.jpg",
                    badge: data.badge || data.result || "Yutuq",
                    showOnHome: true,
                  });
                }
              });
              const merged = [...fetched, ...defaultOlympiads].slice(0, 3);
              setOlympiads(merged);
              setLocalCache("olympiads_home_cache", merged);
            } else {
              setOlympiads(defaultOlympiads.slice(0, 3));
              setLocalCache("olympiads_home_cache", defaultOlympiads.slice(0, 3));
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
                      <p className="text-white/65 text-sm leading-relaxed mb-6 line-clamp-3">
                        {itemText}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="inline-block bg-[#ff6b00] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md shadow-orange-500/20">
                        {itemBadge}
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
