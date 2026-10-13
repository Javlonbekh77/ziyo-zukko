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

const fallbackOlympiadsMap: Record<string, OlympiadItem> = {
  "yutuq-1": {
    id: "yutuq-1",
    title: "Maktabdagi ta’lim katta natijalarga yo‘l! Bunyodbek — Matematika olimpiadasi g'olibi",
    text: `Maktabdagi ta’lim katta natijalarga yo‘l!

🎓 Bunyodbek Ziyo Zukko maktabining o‘quvchisi. U 🇲🇾 Malayziyada o‘tkazilgan matematika olimpiadasida 🥇 1-o‘rin, mental arifmetika yo‘nalishida esa 🥉 3-o‘rinni egalladi.

📚 Bunyodbek to‘qqiz yildan buyon Ziyo Zukko maktabida tahsil oladi! Ustozlarning mehnati besamar ketmadi.

Bunyodbekning buvilari o‘z fikrlarida maktabdagi ta’lim sifati, ustozlarning pedagogik mahorati va bolalarda bilimga bo‘lgan qiziqishni shakllantirishdagi yondashuvni alohida ta’kidladilar.

🌟 Bugun esa bu mehnatning natijasi xalqaro olimpiadadagi g‘olibliklar, 🏅 medallar va 📜 sertifikatlarda namoyon bo‘lmoqda.

💡 Ziyo Zukko bilim, qiziqish va mehnat natijaga aylanishi uchun yaratilgan muhit.

📢 Ziyo Zukko maktabida yangi o‘quv yili uchun qabul davom etmoqda!
📞 Bog‘lanish uchun:
▫️ +998 97 199-35-81
▫️ +998 71 244-35-82
▫️ +998 99 875-08-64`,
    image: "/rasmlar/yutuqlar/bunyodbek.jpg",
    badge: "🥇 1-o'rin (Malayziya)",
    stats: ["Malayziya Matematika Olimpiadasi 1-o'rin", "Mental arifmetika 3-o'rin"]
  },
  "yutuq-2": {
    id: "yutuq-2",
    title: "🏅 11-sinf bitiruvchisi Abdullayeva Lobar oltin medal bilan taqdirlandi!",
    text: `🏅 11-sinf bitiruvchisi oltin medal bilan taqdirlandi!
#bizning_faxrimiz

“Ziyo-zukko umumta’lim maktabi” NTMning 11-“A” sinf bitiruvchisi Abdullayeva Lobar Nigmatullayevna a’lo baholari, bilimga bo‘lgan yuksak intilishi, namunali xulqi hamda ta’lim davomida erishgan yuksak yutuqlari uchun O‘zbekiston Respublikasi Maktabgacha va maktab ta’limi vazirligi tomonidan oltin medal bilan taqdirlandi.

Lobarni ushbu yuksak e’tirof bilan samimiy muborakbod etamiz! Kelgusidagi ta’lim va hayot yo‘lida yanada ulkan zafarlar, omad va muvaffaqiyatlar tilaymiz!

“Ziyo-zukko umumta’lim maktabi” NTM - farzandingiz uchun munosibini tanlang !

📞 Bog’lanish uchun:
+998712443582
+998971993581

@ziyo_zukko 📚`,
    image: "/rasmlar/yutuqlar/lobar.jpg",
    badge: "🏅 Oltin medal",
    stats: ["Maktabgacha va maktab ta'limi vazirligi Oltin Medali", "11-'A' sinf bitiruvchisi"]
  },
  "yutuq-3": {
    id: "yutuq-3",
    title: "Tulkinjonova Osiyo — Cambridge English Young Learners Flyers darajasi!",
    text: `“Ziyo-zukko umumta’lim maktabi” NTMning 4-“E” sinf o‘quvchisi Tulkinjonova Osiyo xalqaro “Cambridge English Young Learners” imtihonida muvaffaqiyatli ishtirok etib, “Flyers” darajasini qo‘lga kiritdi.`,
    image: "/rasmlar/yutuqlar/osiyo.jpg",
    badge: "📜 Cambridge Flyers",
    stats: ["Cambridge English Young Learners", "Flyers darajasi", "4-'E' sinf o'quvchisi"]
  }
};

export default function OlympiadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const olympiadId = resolvedParams.id;

  const [olympiad, setOlympiad] = useState<OlympiadItem | null>(fallbackOlympiadsMap[olympiadId] || fallbackOlympiadsMap["yutuq-1"]);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchOlympiad() {
      if (fallbackOlympiadsMap[olympiadId]) {
        setOlympiad(fallbackOlympiadsMap[olympiadId]);
        setLoading(false);
        return;
      }

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
            text: data.text || `${data.name || "O'quvchimiz"} ${data.subject ? `${data.subject} fanidan` : ""} ${data.result ? `"${data.result}" natijasini qo'lga kiritdi.` : ""}`,
            image: data.imageUrl || data.image || "/rasmlar/yutuqlar/bunyodbek.jpg",
            images: data.images,
            badge: data.result || data.badge || "G'olib",
            stats: data.stats || (data.result ? [data.result, data.subject].filter(Boolean) : undefined),
          } as OlympiadItem);
        } else {
          setOlympiad(fallbackOlympiadsMap["yutuq-1"]);
        }
      } catch (err) {
        console.error("Error fetching single olympiad:", err);
        setOlympiad(fallbackOlympiadsMap["yutuq-1"]);
      } finally {
        setLoading(false);
      }
    }

    fetchOlympiad();
  }, [olympiadId]);

  const imagesList = olympiad?.images && olympiad.images.length > 0 ? olympiad.images : olympiad?.image ? [olympiad.image] : ["/rasmlar/yutuqlar/bunyodbek.jpg"];

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
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm leading-relaxed text-gray-700 font-medium text-base md:text-lg space-y-6">
              {olympiad.text ? (
                olympiad.text.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))
              ) : (
                <p>Ushbu olimpiada natijalari bo'yicha batafsil axborot tez orada to'ldiriladi.</p>
              )}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
