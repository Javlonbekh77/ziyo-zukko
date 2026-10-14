"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trophy, Award, Calendar, Share2, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface OlympiadItem {
  id: string;
  title: string;
  text?: string;
  image?: string;
  images?: string[];
  badge?: string;
  stats?: string[];
}

export default function OlympiadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const olympiadId = resolvedParams.id;

  const [olympiad, setOlympiad] = useState<OlympiadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchOlympiad() {


      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "olympiads", olympiadId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOlympiad({
            id: docSnap.id,
            title: data.name ? `${data.name} — ${data.subject || "Fan"}` : data.title || "Olimpiada g'olibi",
            text: data.description || data.text || `${data.name || "O'quvchimiz"} ${data.subject ? `${data.subject} fanidan` : ""} ${data.result ? `"${data.result}" natijasini qo'lga kiritdi.` : ""}`,
            image: data.imageUrl || data.image || "/data/maktab_binosi.png",
            images: data.images,
            badge: data.result || data.badge || "G'olib",
            stats: data.stats || (data.result ? [data.result, data.subject].filter(Boolean) : undefined),
          } as OlympiadItem);
        } else {
          setOlympiad(null);
        }
      } catch (err) {
        console.error("Error fetching single olympiad:", err);
        setOlympiad(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOlympiad();
  }, [olympiadId]);

  const imagesList = olympiad?.images && olympiad.images.length > 0 ? olympiad.images : olympiad?.image ? [olympiad.image] : ["/data/maktab_binosi.png"];



return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16">
        <Link
          href="/olympiads"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all mb-8 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#ff6b00]" />
          Barcha yutuqlarga qaytish
        </Link>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-[#ff6b00] rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-semibold">Yutuq ma'lumotlari yuklanmoqda...</p>
          </div>
        ) : !olympiad ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-[#071a33] mb-4">Yutuq ma'lumoti topilmadi</h2>
            <Link
              href="/olympiads"
              className="inline-block px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm"
            >
              Yutuqlar ro'yxatiga qaytish
            </Link>
          </div>
        ) : (
          <article className="space-y-8">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-extrabold uppercase tracking-wider mb-4">
                <Trophy className="w-4 h-4" />
                Maktab Yutuqlari
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#071a33] leading-tight mb-4">
                {olympiad.title}
              </h1>

              {/* Stats Badges */}
              {olympiad.stats && (
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {olympiad.stats.map((st, idx) => (
                    <span
                      key={idx}
                      className="bg-[#071a33] text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-gray-700 flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-[#ff6b00]" />
                      {st}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Gallery Image Slider */}
            <div className="space-y-4">
              <div className="relative w-full h-[350px] md:h-[480px] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                <Image
                  src={imagesList[activeImageIndex]}
                  alt={olympiad.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {imagesList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx ? "border-[#ff6b00] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="thumbnail" fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content text */}
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm leading-relaxed text-gray-700 font-medium text-base md:text-lg whitespace-pre-line">
              {olympiad.text || "Ushbu olimpiada natijalari bo'yicha batafsil axborot tez orada to'ldiriladi."}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
