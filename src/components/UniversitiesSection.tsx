"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduateInfoCard } from "@/components/ui/info-card";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getLocalCache, setLocalCache } from "@/lib/cache";
import { useLanguage } from "@/context/LanguageContext";

interface GraduateItem {
  id: string | number;
  name: string;
  university: string;
  status: string;
  image: string;
}

const defaultGraduates: GraduateItem[] = [];

const defaultUniversityPills = [
  "JAHON IQTISODIYOTI VA DIPLOMATIYA UNIVERSITETI",
  "TOSHKENT DAVLAT IQTISODIYOT UNIVERSITETI",
  "TOSHKENT AXBOROT TEXNOLOGIYALARI UNIVERSITETI",
  "O'ZBEKISTON MILLIY UNIVERSITETI",
  "TOSHKENT DAVLAT YURIDIK UNIVERSITETI",
  "TOSHKENT TIBBIYOT AKADEMIYASI",
  "XALQARO ISLOMSHUNOSLIK AKADEMIYASI",
  "WIUT (WESTMINSTER)",
  "MDIST (SINGAPUR UNIVERSITETI)",
  "INHA UNIVERSITETI",
];

export default function UniversitiesSection() {
  const { lang, t } = useLanguage();
  const [graduates, setGraduates] = useState<GraduateItem[]>([]);
  const [universityPills, setUniversityPills] = useState<string[]>(defaultUniversityPills);

  useEffect(() => {
    // Read cache upon client mount
    const cachedGrads = getLocalCache<GraduateItem[] | null>("graduates_home_cache", null);
    if (cachedGrads && Array.isArray(cachedGrads) && cachedGrads.length > 0) {
      setGraduates(cachedGrads);
    }
    const cachedUnis = getLocalCache<string[] | null>("unis_home_cache", null);
    if (cachedUnis && Array.isArray(cachedUnis) && cachedUnis.length > 0) {
      setUniversityPills(cachedUnis);
    }

    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "graduates");
      const q = query(colRef, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: GraduateItem[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || "Bitiruvchi",
                university: data.university || "Universitet",
                status: data.notes || (data.year ? `${data.year}-yil bitiruvchisi` : "Grant"),
                image: data.imageUrl || data.image || "/talaba_rasm.png",
              };
            });
            const merged = [...fetched, ...defaultGraduates];
            setGraduates(merged);
            setLocalCache("graduates_home_cache", merged);
            const dynamicUnis = Array.from(
              new Set([
                ...merged.map((g) => g.university).filter(Boolean),
                ...defaultUniversityPills,
              ])
            );
            setUniversityPills(dynamicUnis);
            setLocalCache("unis_home_cache", dynamicUnis);
          } else {
            setGraduates(defaultGraduates);
          }
        },
        (error) => {
          console.warn("Ordered query fallback for graduates:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: GraduateItem[] = simpleSnap.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  name: data.name || "Bitiruvchi",
                  university: data.university || "Universitet",
                  status: data.notes || (data.year ? `${data.year}-yil bitiruvchisi` : "Grant"),
                  image: data.imageUrl || data.image || "/talaba_rasm.png",
                };
              });
              const merged = [...fetched, ...defaultGraduates];
              setGraduates(merged);
              setLocalCache("graduates_home_cache", merged);
              const dynamicUnis = Array.from(
                new Set([
                  ...merged.map((g) => g.university).filter(Boolean),
                  ...defaultUniversityPills,
                ])
              );
              setUniversityPills(dynamicUnis);
              setLocalCache("unis_home_cache", dynamicUnis);
            } else {
              setGraduates(defaultGraduates);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up graduates listener:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const unisBadge = lang === "ru" ? "УНИВЕРСИТЕТЫ" : lang === "en" ? "UNIVERSITIES" : "UNIVERSITETLAR";
  const unisTitle = lang === "ru" ? "В какие университеты поступили наши выпускники?" : lang === "en" ? "Which universities did our students enter?" : "O'quvchilarimiz qaysi universitetlarga kirishdi?";
  const unisSub = lang === "ru" ? "Выпускники ZIYO-ZUKKO делают уверенный шаг к ТОП университетам" : lang === "en" ? "ZIYO-ZUKKO graduates step confidently towards TOP universities" : "ZIYO-ZUKKO bitiruvchilari TOP universitetlar sari dadil qadam tashlaydi";

  // Agar bazada bitiruvchilar hali kiritilmagan bo'lsa, placeholder chiqarilmaydi
  if (graduates.length === 0) {
    return null;
  }

  return (
    <section id="graduates" className="py-24 bg-[#f8fafc] text-[#071a33] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Part 1: Circular Graduate Cards */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-4">
          <div className="text-center sm:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3"
            >
              {t("graduatesBadge")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-[#071a33]"
            >
              {t("graduatesTitle1")} <br className="hidden sm:block" />
              {t("graduatesTitle2")}
            </motion.h2>
          </div>
          <Link
            href="/students"
            className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#ff6b00] hover:text-white transition-all shadow-sm shrink-0"
          >
            {t("seeAll")}
          </Link>
        </div>

        {/* Graduates Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-24"
        >
          {graduates.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <GraduateInfoCard
                id={item.id}
                name={item.name}
                university={item.university}
                status={item.status}
                image={item.image}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Part 2: University Pills Marquee */}
        <div className="pt-12 border-t border-black/10">
          <div className="text-center mb-10">
            <p className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3">
              {unisBadge}
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
              {unisTitle}
            </h2>
          </div>

          <div className="relative w-full overflow-hidden my-8 py-2">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8fafc] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8fafc] to-transparent z-10"></div>

            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex gap-4 w-max whitespace-nowrap"
            >
              {[...universityPills, ...universityPills].map((uni, idx) => (
                <div
                  key={idx}
                  className="bg-white px-7 py-4 rounded-2xl border border-black/5 shadow-sm text-sm md:text-base font-bold text-[#071a33] shrink-0"
                >
                  {uni}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="text-center mt-8 flex flex-col items-center gap-5">
            <p className="text-sm md:text-base text-black/60 font-medium">
              {unisSub}
            </p>
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#ff6b00] hover:text-white transition-all shadow-sm"
            >
              {t("seeAll")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
