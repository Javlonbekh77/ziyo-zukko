"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, GraduationCap, Award, DollarSign, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useLanguage } from "@/context/LanguageContext";

interface StudentItem {
  id: string;
  name: string;
  university?: string;
  universities?: string[];
  status?: string;
  grantAmount?: string;
  ielts?: string;
  sat?: string;
  image?: string;
  bio?: string;
}

const fallbackStudents: StudentItem[] = [];

export default function StudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Barchasi");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      const colRef = collection(db, "graduates");
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || "Bitiruvchi",
                university: data.university || "",
                universities: data.universities || (data.university ? [data.university] : []),
                status: data.notes || data.status || (data.year ? `${data.year}-yil bitiruvchisi` : "Grant"),
                grantAmount: data.grantAmount || (data.notes?.includes("$") ? data.notes : undefined),
                image: data.imageUrl || data.image || "/talaba_rasm.png",
                bio: data.notes || data.bio || "",
                ielts: data.ielts,
                sat: data.sat,
              } as StudentItem;
            });
            setStudents(fetched);
          } else {
            setStudents([]);
          }
          setLoading(false);
        },
        () => {
          setStudents([]);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const filterTabs = ["Barchasi", "Grant", "Kontrakt"];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.university && student.university.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedFilter === "Grant") {
      return matchesSearch && (student.status?.toLowerCase().includes("grant") || !!student.grantAmount);
    }
    if (selectedFilter === "Kontrakt") {
      return matchesSearch && (student.status?.toLowerCase().includes("kontrakt") || (!student.grantAmount && !student.status?.toLowerCase().includes("grant")));
    }

    return matchesSearch;
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
                <GraduationCap className="w-4 h-4" />
                Maktabimiz Faxri
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                Bizning <span className="text-[#ff6b00]">Bitiruvchilarimiz</span>
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-2 font-medium">
                ZIYO-ZUKKO maktabini tamomlab, respublika va nufuzli xalqaro universitetlarda tahsil olayotgan yoshlarimiz.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Bitiruvchi yoki universitet izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === tab
                  ? "bg-[#071a33] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-[#071a33]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-[#ff6b00] rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-semibold">Bitiruvchilar ro'yxati yuklanmoqda...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 my-8">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#071a33] mb-2">Bitiruvchi topilmadi</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Tanlangan filtr va izlash so'rovi bo'yicha hech qanday ma'lumot topilmadi.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("Barchasi");
              }}
              className="px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm"
            >
              Barcha bitiruvchilarni ko'rsatish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Info Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border-2 border-[#ff6b00]/30 shadow-md">
                      <Image
                        src={student.image || "/talaba_rasm.png"}
                        alt={student.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#071a33] group-hover:text-[#ff6b00] transition-colors leading-tight">
                        {student.name}
                      </h3>
                      {student.status && (
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-md mt-1 border border-emerald-200">
                          {student.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* University Accepted */}
                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4 text-[#ff6b00]" />
                      <span>Qabul qilingan oliygoh:</span>
                    </div>
                    <p className="text-sm font-bold text-[#071a33] leading-snug">
                      {student.university}
                    </p>
                  </div>

                  {/* Test Scores & Grants Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {student.grantAmount && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-amber-200">
                        <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                        Grant: {student.grantAmount}
                      </span>
                    )}
                    {student.ielts && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-blue-200">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        IELTS {student.ielts}
                      </span>
                    )}
                    {student.sat && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-purple-200">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        SAT {student.sat}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Link */}
                <Link
                  href={`/students/${student.id}`}
                  className="pt-4 border-t border-gray-100 inline-flex items-center justify-between text-xs font-bold text-[#071a33] group-hover:text-[#ff6b00] transition-colors"
                >
                  <span>Batafsil ma'lumot</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
