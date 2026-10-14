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

export default function UniversitiesSection() {
  const { lang, t } = useLanguage();
  const [graduates, setGraduates] = useState<GraduateItem[]>([]);
  const [universityPills, setUniversityPills] = useState<string[]>([]);

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

    let unsubGrads: (() => void) | undefined;
    let unsubUnis: (() => void) | undefined;
    let currentGradUnis: string[] = [];
    let currentDbUnis: string[] = [];

    const updatePills = () => {
      const merged = Array.from(new Set([...currentDbUnis, ...currentGradUnis].filter(Boolean)));
      setUniversityPills(merged);
      setLocalCache("unis_home_cache", merged);
    };

    try {
      // 1. Graduates listener
      const gradCol = collection(db, "graduates");
      unsubGrads = onSnapshot(
        gradCol,
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
            setGraduates(fetched);
            setLocalCache("graduates_home_cache", fetched);
            currentGradUnis = fetched.map((g) => g.university).filter(Boolean);
          } else {
            setGraduates([]);
            currentGradUnis = [];
          }
          updatePills();
        },
        (err) => console.warn("Graduates listener warning:", err)
      );

      // 2. Universities (Ta'lim muassasalari) listener
      const uniCol = collection(db, "universities");
      unsubUnis = onSnapshot(
        uniCol,
        (snapshot) => {
          if (!snapshot.empty) {
            currentDbUnis = snapshot.docs
              .map((doc) => doc.data().name as string)
              .filter(Boolean);
          } else {
            currentDbUnis = [];
          }
          updatePills();
        },
        (err) => console.warn("Universities listener warning:", err)
      );
    } catch (e) {
      console.error("Error setting up universities listeners:", e);
    }

    return () => {
      if (unsubGrads) unsubGrads();
      if (unsubUnis) unsubUnis();
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

  const unisBadge = lang === "ru" ? "УЧЕБНЫЕ ЗАВЕДЕНИЯ" : lang === "en" ? "EDUCATIONAL INSTITUTIONS" : "TA'LIM MUASSASALARI";
  const unisTitle = lang === "ru" ? "В какие учебные заведения поступили наши ученики?" : lang === "en" ? "Which educational institutions did our students enter?" : "O'quvchilarimiz qaysi ta'lim muassasalariga kirishgan?";
  const unisSub = lang === "ru" ? "Выпускники ZIYO-ZUKKO делают уверенный шаг к ведущим учебным заведениям" : lang === "en" ? "ZIYO-ZUKKO students and graduates take confident steps towards leading educational institutions" : "ZIYO-ZUKKO o'quvchilari va bitiruvchilari nufuzli ta'lim muassasalari sari dadil qadam tashlaydi";

  // Agar bazada bitiruvchilar va ta'lim muassasalari kiritilmagan bo'lsa, chiqarmaydi
  if (graduates.length === 0 && universityPills.length === 0) {
    return null;
  }

  return (
    <section id="graduates" className="py-24 bg-[#f8fafc] text-[#071a33] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Part 1: Circular Graduate Cards (agar bazada mavjud bo'lsa) */}
        {graduates.length > 0 && (
          <>
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
          </>
        )}

        {/* Part 2: Educational Institutions Pills (Ta'lim muassasalari) */}
        {universityPills.length > 0 && (
          <div className={graduates.length > 0 ? "pt-12 border-t border-black/10" : ""}>
            <div className="text-center mb-10">
              <p className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3">
                {unisBadge}
              </p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                {unisTitle}
              </h2>
            </div>

            {universityPills.length <= 4 ? (
              <div className="flex flex-wrap justify-center gap-4 my-8">
                {universityPills.map((uni, idx) => (
                  <div
                    key={idx}
                    className="bg-white px-7 py-4 rounded-2xl border border-black/5 shadow-sm text-sm md:text-base font-bold text-[#071a33]"
                  >
                    {uni}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative w-full overflow-hidden my-8 py-2">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>

                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                  className="flex gap-4 w-max whitespace-nowrap hover:[animation-play-state:paused]"
                >
                  {[...universityPills, ...universityPills].map((uni, idx) => (
                    <div
                      key={`marquee-uni-${idx}`}
                      className="bg-white px-7 py-4 rounded-2xl border border-black/5 shadow-sm text-sm md:text-base font-bold text-[#071a33] shrink-0"
                    >
                      {uni}
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

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
        )}
      </div>
    </section>
  );
}
