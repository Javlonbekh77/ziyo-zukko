"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Search, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function UniversitiesPage() {
  const { t } = useLanguage();
  const [unis, setUnis] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!db) return;
    try {
      const colRef = collection(db, "universities");
      const gradRef = collection(db, "graduates");

      const unsubscribeUnis = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedNames = snapshot.docs.map((doc) => doc.data().name as string).filter(Boolean);
          setUnis((prev) => Array.from(new Set([...prev, ...fetchedNames])));
        }
      });

      const unsubscribeGrads = onSnapshot(gradRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedUnis = snapshot.docs.map((doc) => doc.data().university as string).filter(Boolean);
          setUnis((prev) => Array.from(new Set([...prev, ...fetchedUnis])));
        }
      });

      return () => {
        unsubscribeUnis();
        unsubscribeGrads();
      };
    } catch (e) {
      console.error(e);
    }
  }, []);

  const filteredUnis = unis.filter((uni) => uni.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16">
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
                <Building2 className="w-4 h-4" />
                Oliy ta'lim maskanlari
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                Bitiruvchilarimiz <span className="text-[#ff6b00]">Universitetlari</span>
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl font-medium">
                ZIYO-ZUKKO maktabi o'quvchilari va bitiruvchilari qabul qilingan barcha mahalliy va xalqaro universitetlar ro'yxati.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Universitet nomi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {filteredUnis.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto my-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#071a33] mb-2">Universitetlar topilmadi</h3>
            <p className="text-gray-500 text-sm">Hozircha ma'lumotlar bazasida universitetlar mavjud emas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredUnis.map((uni, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#ff6b00]/30 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#ff6b00] flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-[#071a33] leading-snug group-hover:text-[#ff6b00] transition-colors">
                  {uni}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
