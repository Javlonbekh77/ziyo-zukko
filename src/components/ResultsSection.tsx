"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, useInView, AnimatePresence } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { X, ZoomIn } from "lucide-react";
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
  const [selectedCertForModal, setSelectedCertForModal] = useState<CertCardItem | null>(null);
  // Default state matches SSR to prevent hydration mismatch
  const [siteStats, setSiteStats] = useState<StatItem[]>([]);
  const [adminCerts, setAdminCerts] = useState<CertCardItem[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

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

    return () => {
      if (statsUnsub) statsUnsub();
      if (certsUnsub) certsUnsub();
    };
  }, []);

  if (siteStats.length === 0 && adminCerts.length === 0) {
    return null;
  }

  // Merge admin-uploaded certificates at the top
  const combinedList = [...adminCerts, ...allCertificatesList];

  const defaultCategoryTabs = [
    { id: "all", label: t("all") },
    { id: "Matematika", label: "Matematika" },
    { id: "IELTS", label: "IELTS" },
    { id: "CEFR", label: "CEFR" },
    { id: "Ona tili", label: "Ona tili" },
    { id: "Biologiya", label: "Biologiya" },
    { id: "Kimyo", label: "Kimyo" },
    { id: "Tarix", label: "Tarix" },
    { id: "Fizika", label: "Fizika" },
    { id: "DTM", label: "DTM" },
  ];

  const existingCategories = Array.from(
    new Set(combinedList.map((c) => c.category || c.subject).filter(Boolean))
  );

  const displayedCategories = [
    ...defaultCategoryTabs,
    ...existingCategories
      .filter((cat) => !defaultCategoryTabs.some((d) => d.id.toLowerCase() === cat.toLowerCase()))
      .map((cat) => ({ id: cat, label: cat })),
  ];

  const certificates = activeTab === "all"
    ? combinedList
    : combinedList.filter((cert) =>
        (cert.category && cert.category.toLowerCase() === activeTab.toLowerCase()) ||
        (cert.subject && cert.subject.toLowerCase() === activeTab.toLowerCase())
      );

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
              {displayedCategories.map((cat) => (
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
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-7"
            >
              {homeCertificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={itemVariants}
                  onClick={() => setSelectedCertForModal(cert)}
                  className="relative rounded-3xl p-1 bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 group overflow-hidden cursor-pointer flex flex-col"
                >
                  <GlowingEffect spread={45} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                  <div className="relative z-10 p-4 bg-white rounded-[22px] flex flex-col h-full">
                    {/* Enlarged Certificate Image Box (Aspect 3/4 Portrait) */}
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-amber-50/30 via-slate-50/50 to-white mb-3.5 border border-slate-100 flex items-center justify-center p-2 group-hover:border-orange-200 transition-colors shadow-inner">
                      <Image
                        src={cert.image}
                        alt={cert.name}
                        fill
                        unoptimized
                        className="object-contain p-1 group-hover:scale-[1.03] transition-transform duration-500 drop-shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-[1px] rounded-2xl">
                        <ZoomIn className="w-4 h-4 text-[#ff6b00]" />
                        <span>Kattalashtirish</span>
                      </div>
                    </div>

                    {/* Student Name */}
                    <h4 className="font-extrabold text-base md:text-lg text-[#071a33] text-center line-clamp-1 group-hover:text-[#ff6b00] transition-colors">
                      {cert.name}
                    </h4>

                    {/* Score Badge */}
                    <div className="text-center mt-1">
                      <span className="font-black text-2xl md:text-3xl text-[#ff6b00] tracking-tight">
                        {cert.score || "Tasdiqlangan"}
                      </span>
                    </div>

                    {/* Subject badge */}
                    {cert.subject && (
                      <div className="mt-2 text-center">
                        <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {cert.subject}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Certificate Zoom Lightbox Modal */}
            <AnimatePresence>
              {selectedCertForModal && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center overflow-y-auto"
                  onClick={() => setSelectedCertForModal(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                          {selectedCertForModal.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#ff6b00]">
                          {selectedCertForModal.subject} — Natija: <span className="font-black text-sm">{selectedCertForModal.score}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedCertForModal(null)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Certificate High-Res Viewer */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-slate-900/5 flex items-center justify-center">
                      <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200">
                        <Image
                          src={selectedCertForModal.image}
                          alt={selectedCertForModal.name}
                          fill
                          unoptimized
                          className="object-contain p-2"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                      <span className="text-xs text-slate-500 font-medium">
                        Rasmiy tasdiqlangan davlat sertifikati
                      </span>
                      <a
                        href={selectedCertForModal.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#ff6b00] text-white rounded-xl text-xs font-bold hover:bg-[#e05e00] transition flex items-center gap-1.5 shadow-sm"
                      >
                        Asl nusxasini ochish
                      </a>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
