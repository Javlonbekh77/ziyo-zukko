"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Search, ChevronRight, Award, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

interface OlympiadItem {
  id: string;
  title: string;
  text?: string;
  image?: string;
  images?: string[];
  badge?: string;
  stats?: string[];
}

export default function OlympiadsPage() {
  const { t } = useLanguage();
  const [olympiadList, setOlympiadList] = useState<OlympiadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      const colRef = collection(db, "olympiads");
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs
              .map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  title: data.name ? `${data.name} — ${data.subject || "Fan"}` : data.title || "Olimpiada g'olibi",
                  text: data.description || data.text || `${data.name || "O'quvchimiz"} ${data.subject ? `${data.subject} fanidan` : ""} ${data.result ? `"${data.result}" natijasini qo'lga kiritdi.` : ""}`,
                  image: data.imageUrl || data.image || "/data/maktab_binosi.png",
                  images: data.images,
                  badge: data.result || data.badge || "G'olib",
                  stats: data.stats || (data.result ? [data.result, data.subject].filter(Boolean) : undefined),
                };
              })
              .filter((item) => {
                const img = item.image || "";
                const titleStr = item.title || "";
                return (
                  !img.includes("1791736997486") &&
                  !img.toLowerCase().includes("hasanov") &&
                  !titleStr.toLowerCase().includes("hasanov")
                );
              }) as OlympiadItem[];
            setOlympiadList(fetched);
          } else {
            setOlympiadList([]);
          }
          setLoading(false);
        },
        () => setLoading(false)
      );
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const filteredOlympiads = olympiadList.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.text && item.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[url('/images/bg-ornament.png')] bg-repeat bg-[size:360px_auto] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16">
        {/* Navigation */}
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
                <Trophy className="w-4 h-4" />
                Maktabimiz Faxri
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                Barcha <span className="text-[#ff6b00]">Yutuqlarimiz</span>
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-2 font-medium">
                O&apos;quvchilarimiz va bitiruvchilarimizning xalqaro hamda respublika tanlovlari, olimpiada va sinovlardagi zafarli odimlaridan baxramand bo&apos;ling.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Yutuqlardan izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Olympiad Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col animate-pulse"
              >
                {/* Qolip: Rasm o'rni */}
                <div className="relative w-full h-56 bg-slate-200 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-slate-300" />
                  <div className="absolute top-4 left-4 w-20 h-6 bg-slate-300 rounded-full" />
                </div>
                {/* Qolip: Matn o'rni */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                    <div className="h-3.5 bg-slate-100 rounded-lg w-full" />
                    <div className="h-3.5 bg-slate-100 rounded-lg w-5/6" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-4 w-4 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOlympiads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 my-8">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#071a33] mb-2">Ma'lumot topilmadi</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Izlash so'rovingiz bo'yicha hech qanday yutuq ma'lumoti topilmadi.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm"
            >
              Barcha yutuqlarni ko'rsatish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOlympiads.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Box with Skeleton Qolip */}
                <div className="relative w-full h-56 bg-slate-900 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-slate-700 animate-pulse" />
                  </div>
                  <Image
                    src={(item.images && item.images[0]) || item.image || "https://picsum.photos/seed/oly11/600/400"}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 z-10"
                    unoptimized
                  />
                  {item.badge && (
                    <div className="absolute top-4 left-4 z-20 bg-[#ff6b00] text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg border border-white/20">
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#071a33] group-hover:text-[#ff6b00] transition-colors leading-snug mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  <Link
                    href={`/olympiads/${item.id}`}
                    className="pt-4 border-t border-gray-100 inline-flex items-center justify-between text-xs font-bold text-[#ff6b00] group/btn hover:underline"
                  >
                    <span>Batafsil ma'lumot</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
