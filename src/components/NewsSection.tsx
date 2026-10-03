"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { FeatureCarousel } from "./ui/feature-carousel";

export default function NewsSection() {
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const instagramPosts = [
    { id: 1, img: "/rasmlar/2026-10-02 17.56.31.jpg", caption: "School Sports Day! #AILab #NextGen", embedUrl: "https://www.instagram.com/p/C1ZlbZwNWXI/embed/" },
    { id: 2, img: "/rasmlar/2026-10-02 17.57.37.jpg", caption: "Students on a field trip!", embedUrl: "https://www.instagram.com/p/DeB27mSK8Cb/embed/" },
    { id: 3, img: "/rasmlar/2026-10-02 17.57.45.jpg", caption: "School Sports Day!", embedUrl: "https://www.instagram.com/p/C1ZlbZwNWXI/embed/" },
    { id: 4, img: "/rasmlar/2026-10-02 17.58.25.jpg", caption: "Students on a field trip!", embedUrl: "https://www.instagram.com/p/DeB27mSK8Cb/embed/" },
    { id: 5, img: "/rasmlar/2026-10-02 17.58.36.jpg", caption: "School Sports Day!", embedUrl: "https://www.instagram.com/p/C1ZlbZwNWXI/embed/" },
    { id: 6, img: "/rasmlar/2026-10-02 17.58.46.jpg", caption: "Robotics competition winners!", embedUrl: "https://www.instagram.com/p/DeB27mSK8Cb/embed/" },
    { id: 7, img: "/rasmlar/2026-10-02 17.59.06.jpg", caption: "Art exhibition 2026", embedUrl: "https://www.instagram.com/p/C1ZlbZwNWXI/embed/" },
    { id: 8, img: "/rasmlar/2026-10-02 17.59.16.jpg", caption: "Science fair projects", embedUrl: "https://www.instagram.com/p/DeB27mSK8Cb/embed/" },
    { id: 9, img: "/rasmlar/2026-10-02 17.59.21.jpg", caption: "Math olympiad prep", embedUrl: "https://www.instagram.com/p/C1ZlbZwNWXI/embed/" },
  ];

  const newsItems = [
    { id: 1, title: "Maktabimizda bayram!", summary: "O'quvchilar tomonidan tayyorlangan maxsus bayram dasturi ajoyib o'tdi. To'liq tafsilotlar va rasmlar galereyasi sahifada e'lon qilindi.", tag: "TADBIRLAR", img: "/rasmlar/2026-10-02 17.59.48.jpg", date: "2026-10-02", social: 'instagram' },
    { id: 2, title: "National AI Hackathon | Karshi Winners", summary: "Qarshi shahrida bo'lib o'tgan sun'iy intellekt xakatonida bizning jamoa g'olib bo'ldi. Ular o'z loyihalari bilan hakamlarni lol qoldirdilar.", tag: "@sabui_2026", img: "/rasmlar/2026-10-02 17.59.54.jpg", date: "2026-09-04", social: 'youtube' },
    { id: 3, title: "🔴 Diqqat! Hurmatli ota-onalar!", summary: "Yangi o'quv yili uchun qabul jarayonlari boshlandi. Barcha kerakli hujjatlar ro'yxati saytimizda e'lon qilindi. Shoshiling, o'rinlar soni cheklangan.", tag: "@sabui_2026", img: "/rasmlar/2026-10-02 18.00.24.jpg", date: "2026-09-04", social: 'instagram' },
    { id: 4, title: "DOLZARB 90 KUNNING 9-DARSI", summary: "ZIYO-ZUKKO tizimidagi natijalar va o'qituvchilar uchun maxsus seminar trening bo'lib o'tdi. Tajriba almashish va yangi metodikalarni o'rganish.", tag: "ZIYO-ZUKKO tizimidagi natijalar", img: "/rasmlar/2026-10-02 18.01.23.jpg", date: "2026-09-04", social: 'both' },
  ];

  const allReels = [
    ...instagramPosts.filter(p => p.embedUrl).map(p => p.embedUrl!),
    ...newsItems.filter(n => n.embedUrl).map(n => n.embedUrl!)
  ];

  const openReel = (embedUrl: string) => {
    const index = allReels.indexOf(embedUrl);
    if (index !== -1) setActiveReelIndex(index);
  };

  return (
    <section id="news" className="pt-12 pb-8 bg-[#f8fafc] text-[#0b1b36] flex flex-col min-h-[90vh] justify-center">
      <div className="max-w-[1400px] mx-auto px-6 w-full flex-1 flex flex-col justify-center">

        {/* Main Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-gray-200 pb-3">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
          >
            Maktab yangilik<span className="text-[#8c1c3f]">lari</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="#all-news" className="text-[#0b1b36] font-bold text-xs uppercase tracking-wide hover:opacity-70 transition-opacity flex items-center gap-2 mt-3 md:mt-0">
              Barchasini ko'rish &rarr;
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          
          {/* Left Column: Instagram Reels / Feed */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col lg:col-span-7 h-[500px] lg:h-[600px]"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4">Ziyo-Zukko <span className="text-[#E1306C]">Instagram</span></h3>
            
            <div className="w-full h-full flex items-center justify-center">
              <FeatureCarousel 
                items={instagramPosts.slice(0, 6)} 
              />
            </div>
          </motion.div>

          {/* Right Column: Classic News List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col lg:col-span-5"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4">Maktab Yangiliklari & <span className="text-[#8c1c3f]">Tadbirlar</span></h3>
            
            <div className="flex flex-col gap-1.5 md:gap-2 h-full justify-between">
              {newsItems.map((item) => (
                <div 
                  key={item.id} 
                  className="block h-full"
                  onClick={() => item.embedUrl ? openReel(item.embedUrl) : null}
                >
                  <motion.div variants={itemVariants} className="bg-white rounded-2xl p-2 md:p-3 h-full shadow-sm hover:shadow-md transition-all flex gap-3 md:gap-4 items-center group cursor-pointer border border-gray-100">
                    {/* News Image */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
                    {item.embedUrl ? (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                        <iframe 
                          src={`${item.embedUrl}?hidecaption=1`} 
                          className="absolute w-[120%] left-[-10%] border-none" 
                          style={{ height: '160%', top: '-30%' }}
                          scrolling="no" 
                          tabIndex={-1}
                        />
                      </div>
                    ) : (
                      <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 unoptimized" unoptimized />
                    )}
                  </div>
                  
                  {/* News Content */}
                  <div className="flex flex-col flex-1 h-full py-0.5">
                    <h3 className="font-bold text-sm md:text-[15px] text-[#0b1b36] mb-1 leading-snug group-hover:text-[#8c1c3f] transition-colors line-clamp-2">{item.title}</h3>
                    <p className="text-[9px] md:text-[11px] text-[#8c1c3f] font-semibold mb-1">{item.tag}</p>
                    <p className="text-[11px] md:text-[12px] text-[#0b1b36]/60 mb-1.5 line-clamp-1 sm:line-clamp-2 hidden sm:block">{item.summary}</p>
                    
                    <div className="mt-auto flex items-center gap-2">
                      <div className="bg-[#8c1c3f] text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg">
                        {item.date}
                      </div>
                      {(item.social === 'youtube' || item.social === 'both') && (
                        <div className="text-[#FF0000]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"></polygon></svg>
                        </div>
                      )}
                      {(item.social === 'instagram' || item.social === 'both') && (
                        <div className="text-[#E1306C]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                </div>
              ))}
            </div>
            
          </motion.div>

        </div>
      </div>

      {/* Video / Instagram Modal - Reels Clone */}
      {activeReelIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md" 
          onClick={() => setActiveReelIndex(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setActiveReelIndex(null)} 
            className="absolute top-4 left-4 md:left-auto md:right-8 z-50 bg-white/10 text-white rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* Navigation Controls Overlay */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveReelIndex(Math.max(0, activeReelIndex - 1)); }}
              className={`bg-black/40 backdrop-blur-sm text-white rounded-full p-4 border border-white/10 hover:bg-black/60 transition-all transform hover:scale-110 shadow-xl ${activeReelIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveReelIndex(Math.min(allReels.length - 1, activeReelIndex + 1)); }}
              className={`bg-black/40 backdrop-blur-sm text-white rounded-full p-4 border border-white/10 hover:bg-black/60 transition-all transform hover:scale-110 shadow-xl ${activeReelIndex === allReels.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeReelIndex} // Re-animate on change
            className="relative w-full h-full md:w-[450px] lg:w-[520px] md:h-[90vh] lg:h-[95vh] bg-[#0b1b36] md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-white/10" 
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
              <iframe 
                src={allReels[activeReelIndex]}
                className="w-full h-full border-none"
                scrolling="no"
                allow="encrypted-media"
              ></iframe>
            </div>
            
            {/* Overlay hint for mobile since touch is trapped */}
            <div className="md:hidden absolute bottom-6 left-0 right-0 pointer-events-none flex justify-center opacity-70">
              <span className="bg-black/60 text-white text-xs px-4 py-1.5 rounded-full backdrop-blur-md">
                Boshqarish uchun o'ngdagi tugmalarni bosing
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
