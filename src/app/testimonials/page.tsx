"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, X, ExternalLink, Search, Video as VideoIcon, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface TestimonialItem {
  id: string | number;
  title: string;
  quote: string;
  platform: "youtube" | "instagram";
  url: string;
  embedUrl: string;
  thumbnail: string;
}

export default function TestimonialsPage() {
  const [videoList, setVideoList] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<TestimonialItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "youtube" | "instagram">("all");

  useEffect(() => {
    if (!db) return;

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "videos");
      const q = query(colRef, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: TestimonialItem[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || "Ota-onalar fikri",
                quote: data.description || data.quote || "ZIYO-ZUKKO maktabi haqida",
                platform: (data.platform === "instagram" ? "instagram" : "youtube") as "youtube" | "instagram",
                url: data.url || "",
                embedUrl: data.embedUrl || "",
                thumbnail: data.thumbnail || (data.platform === "youtube" ? "/data/maktab_binosi.png" : "/data/maktab_binosi.png"),
              };
            });
            // Combine newly added admin videos with default ones
            setVideoList(fetched);
            setLoading(false);
          } else {
            setVideoList([]);
            setLoading(false);
          }
        },
        () => {
          // Fallback without ordering
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            if (!simpleSnap.empty) {
              const fetched: TestimonialItem[] = simpleSnap.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  title: data.title || "Ota-onalar fikri",
                  quote: data.description || data.quote || "ZIYO-ZUKKO maktabi haqida",
                  platform: (data.platform === "instagram" ? "instagram" : "youtube") as "youtube" | "instagram",
                  url: data.url || "",
                  embedUrl: data.embedUrl || "",
                  thumbnail: data.thumbnail || "/data/maktab_binosi.png",
                };
              });
              setVideoList(fetched);
              setLoading(false);
            } else {
              setVideoList([]);
              setLoading(false);
            }
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const filteredVideos = videoList.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.quote.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || v.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[url('/images/bg-ornament.png')] bg-repeat bg-[size:360px_auto] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 md:pt-32 pb-20">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#ff6b00]" />
            Bosh sahifaga qaytish
          </Link>
        </div>

        {/* Title & Header White Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200/80 shadow-xl shadow-slate-900/5 mb-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-bold uppercase tracking-wider mb-3">
                <Heart className="w-4 h-4 fill-current" />
                Ota-onalar fikri &amp; Videolar
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
                Barcha <span className="text-[#ff6b00]">Videolar va Fikrlar</span>
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-2 font-medium">
                ZIYO-ZUKKO maktabi haqidagi ota-onalar va o&apos;quvchilarning samimiy fikrlari, YouTube Shorts va Instagram videolari to&apos;plami.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Fikrlarni izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              platformFilter === "all"
                ? "bg-[#071a33] text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-[#071a33]"
            }`}
          >
            Barchasi ({videoList.length})
          </button>
          <button
            onClick={() => setPlatformFilter("youtube")}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              platformFilter === "youtube"
                ? "bg-red-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-red-500 hover:text-red-600"
            }`}
          >
            YouTube Shorts ({videoList.filter((v) => v.platform === "youtube").length})
          </button>
          <button
            onClick={() => setPlatformFilter("instagram")}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              platformFilter === "instagram"
                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-pink-500 hover:text-pink-600"
            }`}
          >
            Instagram Reels ({videoList.filter((v) => v.platform === "instagram").length})
          </button>
        </div>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm my-8">
            <VideoIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#071a33] mb-2">Video topilmadi</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Izlash so'rovingizga mos fikrlar topilmadi. Boshqa kalit so'zlardan foydalanib ko'ring.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setPlatformFilter("all");
              }}
              className="px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm hover:bg-[#e05e00] transition-colors cursor-pointer"
            >
              Barcha videolarni ko'rsatish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredVideos.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setActiveVideo(item)}
                className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-xl group cursor-pointer border border-slate-200 hover:-translate-y-1.5 transition-all duration-300"
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover brightness-105 contrast-105 transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40"></div>

                {/* Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md text-white shadow-md ${
                      item.platform === "youtube"
                        ? "bg-red-600"
                        : "bg-gradient-to-r from-purple-600 to-pink-600"
                    }`}
                  >
                    {item.platform}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#0b1b36]/80 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <span className="text-[#ff6b00] font-black text-[10px]">ZZ</span>
                  </div>
                </div>

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 ${
                      item.platform === "youtube"
                        ? "bg-[#ff0033] shadow-red-500/50"
                        : "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] shadow-pink-500/50"
                    }`}
                  >
                    <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Caption */}
                <div className="absolute bottom-4 left-3 right-3 z-10 bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center">
                  <h4 className="text-white font-bold text-xs line-clamp-1 mb-1">{item.title}</h4>
                  <p className="text-white/80 font-medium text-[11px] line-clamp-2 leading-tight">
                    {item.quote}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Video Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-[#0b1b36] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0b1b36]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-[#ff6b00] font-black text-xs">ZZ</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm leading-tight">{activeVideo.title}</h4>
                    <p className="text-white/60 text-xs">ZIYO-ZUKKO</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Frame */}
              <div className="relative w-full aspect-[9/16] bg-black">
                <iframe
                  src={activeVideo.embedUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#081427] flex items-center justify-between gap-3 border-t border-white/10">
                <p className="text-white/70 text-xs font-medium truncate max-w-[180px]">
                  {activeVideo.quote}
                </p>
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-transform active:scale-95 shrink-0 ${
                    activeVideo.platform === "youtube"
                      ? "bg-[#ff0033] hover:bg-[#cc0029]"
                      : "bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90"
                  }`}
                >
                  <span>{activeVideo.platform === "youtube" ? "YouTube'da ko'rish" : "Instagram'da ko'rish"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
