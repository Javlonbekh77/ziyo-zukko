"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getLocalCache, setLocalCache } from "@/lib/cache";
import { useLanguage } from "@/context/LanguageContext";

function CountUp({ from = 0, to, duration = 2, suffix = "" }: { from?: number; to: number; duration?: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, to, duration, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

interface StatItem {
  id?: string;
  value: number;
  suffix: string;
  title: string;
  subtitle: string;
  order: number;
  statKey?: string;
}

interface CertCardItem {
  id: string | number;
  name: string;
  score: string;
  subject: string;
  category: string;
  image: string;
}

const allCertificatesList: CertCardItem[] = [];

export default function ResultsSection() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  // Default state matches SSR to prevent hydration mismatch
  const [siteStats, setSiteStats] = useState<StatItem[]>([]);
  const [adminCerts, setAdminCerts] = useState<CertCardItem[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const defaultCategories = [
    { id: "all", label: t("all") },
    { id: "Matematika", label: "Matematika" },
    { id: "IELTS", label: "IELTS" },
    { id: "CEFR", label: "CEFR" },
  ];

  useEffect(() => {
    // Read cache upon client mount
    const cachedStats = getLocalCache<StatItem[] | null>("stats_home_cache", null);
    if (cachedStats && Array.isArray(cachedStats) && cachedStats.length > 0) {
      setSiteStats(cachedStats);
    }
    const cachedCerts = getLocalCache<CertCardItem[] | null>("certs_home_cache", null);
    if (cachedCerts && Array.isArray(cachedCerts) && cachedCerts.length > 0) {
      setAdminCerts(cachedCerts);
    }

    if (!db) return;

    let statsUnsub: (() => void) | undefined;
    let certsUnsub: (() => void) | undefined;

    try {
      const statsRef = collection(db, "stats");
      const qStats = query(statsRef, orderBy("order", "asc"));
      statsUnsub = onSnapshot(
        qStats,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetchedStats: StatItem[] = [];
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              fetchedStats.push({
                id: doc.id,
                value: Number(data.value) || 0,
                suffix: data.suffix || "",
                title: data.title || "",
                subtitle: data.subtitle || "",
                order: Number(data.order) || 0,
              });
            });
            setSiteStats(fetchedStats);
            setLocalCache("stats_home_cache", fetchedStats);
          }
        },
        (error) => {
          console.warn("Stats ordered query fallback:", error);
          const simpleStatsUnsub = onSnapshot(statsRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetchedStats: StatItem[] = [];
              simpleSnap.docs.forEach((doc) => {
                const data = doc.data();
                fetchedStats.push({
                  id: doc.id,
                  value: Number(data.value) || 0,
                  suffix: data.suffix || "",
                  title: data.title || "",
                  subtitle: data.subtitle || "",
                  order: Number(data.order) || 0,
                });
              });
              setSiteStats(fetchedStats);
              setLocalCache("stats_home_cache", fetchedStats);
            }
          });
          statsUnsub = simpleStatsUnsub;
        }
      );

      const certsRef = collection(db, "certificates");
      const qCerts = query(certsRef, orderBy("createdAt", "desc"));
      certsUnsub = onSnapshot(
        qCerts,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetchedCerts: CertCardItem[] = [];
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              fetchedCerts.push({
                id: doc.id,
                name: data.studentName || data.name || "Sertifikat",
                score: data.score || "",
                subject: data.subject || data.category || "Fan",
                category: data.category || "Boshqa",
                image: data.imageUrl || "/data/maktab_binosi.png",
              });
            });
            setAdminCerts(fetchedCerts);
            setLocalCache("certs_home_cache", fetchedCerts);
          }
        },
        (error) => {
          console.warn("Certificates ordered query fallback:", error);
          const simpleCertsUnsub = onSnapshot(certsRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetchedCerts: CertCardItem[] = [];
              simpleSnap.docs.forEach((doc) => {
                const data = doc.data();
                fetchedCerts.push({
                  id: doc.id,
                  name: data.studentName || data.name || "Sertifikat",
                  score: data.score || "",
                  subject: data.subject || data.category || "Fan",
                  category: data.category || "Boshqa",
                  image: data.imageUrl || "/data/maktab_binosi.png",
                });
              });
              setAdminCerts(fetchedCerts);
              setLocalCache("certs_home_cache", fetchedCerts);
            }
          });
          certsUnsub = simpleCertsUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up results listeners:", e);
    }

      if (siteStats.length === 0 && adminCerts.length === 0) {
    return null;
  }

  return () => {
      if (statsUnsub) statsUnsub();
      if (certsUnsub) certsUnsub();
    };
  }, []);

  // Merge admin-uploaded certificates at the top
  const combinedList = [...adminCerts, ...allCertificatesList];

  const certificates = activeTab === "all"
    ? combinedList
    : combinedList.filter((cert) => cert.category === activeTab || cert.subject === activeTab);

  // Asosiy sahifada qat'iy 3 qator (4x3 = 12 ta) ko'rinadi
  const homeCertificates = certificates.slice(0, 12);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section id="natijalar" className="py-24 bg-white text-[#071a33]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tight text-[#071a33] mb-3"
            >
              {t("resultsTitle")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-black/60 font-medium text-sm md:text-base"
            >
              {t("resultsSubtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/certificates"
              className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
              {t("seeAll")}
            </Link>
          </motion.div>
        </div>

        {/* Stats Counters */}
        {siteStats.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(siteStats.length || 3, 4)} gap-8 py-10 border-y border-black/10 mb-12 min-h-[140px]`}>
            {siteStats.map((item, idx) => {
              const title = item.statKey ? t(`${item.statKey}Title`) : item.title;
              const subtitle = item.statKey ? t(`${item.statKey}Subtitle`) : item.subtitle;

              return (
                <div
                  key={item.id || idx}
                  className={`text-center md:text-left flex flex-col justify-center gap-1 ${
                    idx !== siteStats.length - 1 ? "md:border-r border-black/10 pr-6" : "pl-0 md:pl-6"
                  } ${idx > 0 && idx < siteStats.length - 1 ? "px-0 md:px-6" : ""}`}
                >
                  <span className="text-5xl md:text-6xl font-black text-[#ff6b00] tracking-tight">
                    <CountUp to={item.value} suffix={item.suffix} />
                  </span>
                  <h4 className="font-bold text-base text-[#071a33] mt-2">
                    {title}
                  </h4>
                  <p className="text-xs text-black/60">{subtitle}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Certificates Section */}
        {adminCerts.length > 0 && (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
              {defaultCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
                    activeTab === cat.id
                      ? "bg-[#ff6b00] text-white shadow-md shadow-orange-500/30 scale-105"
                      : "bg-[#f1f5f9] text-black/70 hover:bg-[#e2e8f0] hover:text-black"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Certificates Grid */}
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {homeCertificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={itemVariants}
                  className="relative rounded-2xl p-1 bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow group overflow-hidden"
                >
                  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                  <div className="relative z-10 p-3 bg-white rounded-xl flex flex-col h-full">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-50 mb-3 border border-slate-100 flex items-center justify-center">
                      <Image
                        src={cert.image}
                        alt={cert.name}
                        fill
                        unoptimized
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-[#071a33] truncate">{cert.name}</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-[#ff6b00]">{cert.score}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{cert.subject}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
