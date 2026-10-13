"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Award, Search, X, Eye, ShieldCheck, FileCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface CertItem {
  id: number | string;
  name: string;
  score: string;
  subject: string;
  category: string;
  image: string;
  holder?: string;
}

const fallbackCertificates: CertItem[] = [];

export default function CertificatesPage() {
  const { t } = useLanguage();
  const [certificates, setCertificates] = useState<CertItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "certificates");
      const q = query(colRef, orderBy("date", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: CertItem[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              const subj = data.subject || "Matematika";
              let cat = subj;
              const lower = subj.toLowerCase();
              if (lower.includes("ielts") || lower.includes("ingliz") || lower.includes("english")) cat = "IELTS";
              else if (lower.includes("cefr")) cat = "CEFR";
              else if (lower.includes("matem")) cat = "Matematika";

              return {
                id: doc.id,
                name: data.title || "Sertifikat",
                score: data.subject || "Tasdiqlangan",
                subject: data.subject || "",
                category: cat,
                image: data.imageUrl || "",
                holder: data.title,
              };
            }).filter((item) => Boolean(item.image));
            setCertificates(fetched);
          } else {
            setCertificates([]);
          }
        },
        (error) => {
          console.warn("Certificates page ordered listener fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: CertItem[] = simpleSnap.docs.map((doc) => {
                const data = doc.data();
                const subj = data.subject || "Matematika";
                let cat = subj;
                const lower = subj.toLowerCase();
                if (lower.includes("ielts") || lower.includes("ingliz") || lower.includes("english")) cat = "IELTS";
                else if (lower.includes("cefr")) cat = "CEFR";
                else if (lower.includes("matem")) cat = "Matematika";

                return {
                  id: doc.id,
                  name: data.title || "Sertifikat",
                  score: data.subject || "Tasdiqlangan",
                  subject: data.subject || "",
                  category: cat,
                  image: data.imageUrl || "",
                  holder: data.title,
                };
              }).filter((item) => Boolean(item.image));
              setCertificates(fetched);
            } else {
              setCertificates([]);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up certificates listener:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const defaultCategories = ["Barchasi", "IELTS", "SAT", "CEFR", "Matematika"];
  const categories = Array.from(
    new Set([
      ...defaultCategories,
      ...certificates.map((c) => c.category).filter(Boolean),
    ])
  );

  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.holder && cert.holder.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "Barchasi" || cert.category === selectedCategory || cert.subject === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16">
        {/* Navigation Header */}
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
                <ShieldCheck className="w-4 h-4" />
                Sertifikat va Natijalar
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                O'quvchilar va Ustozlar <span className="text-[#ff6b00]">Sertifikatlari</span>
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl font-medium">
                IELTS, SAT, CEFR va Milliy fan sertifikatlari bo'yicha erishilgan barcha tasdiqlangan hujjatlar va natijalar galereyasi.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Sertifikat yoki ism izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#071a33] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-[#071a33]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Certificate Cards Grid */}
        {filteredCerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 my-8">
            <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#071a33] mb-2">Sertifikat topilmadi</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Izlash so'rovingiz bo'yicha sertifikatlar topilmadi.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Barchasi");
              }}
              className="px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm"
            >
              Barcha sertifikatlarni ko'rsatish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCerts.map((cert) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Hover Overlay */}
                <div
                  onClick={() => setActiveModalImage(cert.image)}
                  className="relative w-full h-64 bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <Image
                    src={cert.image}
                    alt={cert.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-[#071a33]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm">
                    <Eye className="w-5 h-5" />
                    Kattalashtirib ko'rish
                  </div>

                  <span className="absolute top-4 left-4 bg-[#ff6b00] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                    {cert.score}
                  </span>
                </div>

                {/* Info Footer */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#071a33] mb-1">{cert.name}</h3>
                    {cert.holder && (
                      <p className="text-xs font-semibold text-gray-500 mb-2">Egalik qiluvchi: <span className="text-[#071a33] font-bold">{cert.holder}</span></p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cert.subject}</span>
                    <button
                      onClick={() => setActiveModalImage(cert.image)}
                      className="text-xs font-bold text-[#ff6b00] hover:underline cursor-pointer"
                    >
                      Ko'rish &rarr;
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Image Modal Preview */}
      <AnimatePresence>
        {activeModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModalImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-2 flex items-center justify-center">
              <button
                onClick={() => setActiveModalImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative w-full h-[75vh]">
                <Image
                  src={activeModalImage}
                  alt="Certificate Full"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
