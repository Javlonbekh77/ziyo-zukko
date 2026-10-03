"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function GallerySection() {
  const images = [
    "/rasmlar/2026-10-02 17.56.31.jpg",
    "/rasmlar/2026-10-02 17.57.37.jpg",
    "/rasmlar/2026-10-02 17.57.45.jpg",
    "/rasmlar/2026-10-02 17.58.25.jpg",
    "/rasmlar/2026-10-02 17.58.36.jpg",
    "/rasmlar/2026-10-02 17.58.46.jpg",
    "/rasmlar/2026-10-02 17.59.06.jpg",
    "/rasmlar/2026-10-02 17.59.16.jpg",
    "/rasmlar/2026-10-02 17.59.21.jpg",
    "/rasmlar/2026-10-02 17.59.48.jpg",
    "/rasmlar/2026-10-02 17.59.54.jpg",
    "/rasmlar/2026-10-02 18.00.24.jpg",
    "/rasmlar/2026-10-02 18.01.23.jpg",
    "/rasmlar/2026-10-02 18.01.32.jpg"
  ];

  return (
    <section id="galereya" className="py-24 bg-[#f8fafc] text-[#071a33] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3"
          >
            FOTO GALEREYA
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight uppercase text-[#071a33]"
          >
            ZIYO-ZUKKO hayotidan lavhalar
          </motion.h2>
        </div>
      </div>

      {/* Marquee Row */}
      <div className="relative w-full overflow-hidden py-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8fafc] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8fafc] to-transparent z-10"></div>

        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          className="flex gap-6 w-max"
        >
          {[...images, ...images].map((img, idx) => (
            <div 
              key={idx} 
              className="relative w-[340px] md:w-[420px] aspect-[16/10] rounded-3xl overflow-hidden shadow-lg shadow-black/5 shrink-0 border border-black/5 group"
            >
              <Image 
                src={img} 
                alt={`ZIYO-ZUKKO galereya ${idx + 1}`} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
