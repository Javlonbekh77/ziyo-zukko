"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const testimonials = [
    {
      id: 1,
      image: "https://picsum.photos/seed/parent1/400/600",
      quote: "bolalarimiz, ikkalasi ham...",
      platform: "youtube"
    },
    {
      id: 2,
      image: "https://picsum.photos/seed/parent2/400/600",
      quote: "Hotirjammiz shu yerda o'qiyotganidan.",
      platform: "instagram"
    },
    {
      id: 3,
      image: "https://picsum.photos/seed/parent3/400/600",
      quote: "Haqiqatdan ham har bir o'qituvchi",
      platform: "youtube"
    },
    {
      id: 4,
      image: "https://picsum.photos/seed/parent4/400/600",
      quote: "tenglashtirilgan",
      platform: "instagram"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white text-[#0b1b36] relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#ff6b00] font-bold text-sm tracking-widest uppercase mb-4"
          >
            ISHONCH
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tight"
          >
            OTA-ONALAR NIMA DEYDI?
          </motion.h2>
        </div>

        {/* Video Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
            >
              <Image
                src={item.image}
                alt="Parent Testimonial"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60"></div>

              {/* Header inside card */}
              <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0b1b36] flex items-center justify-center shrink-0 border border-white/10">
                  <span className="text-[#ff6b00] font-black text-xs">ZZ</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">Ota-onalar fikri</h3>
                  <p className="text-white/70 text-xs font-medium">ZIYO-ZUKKO</p>
                </div>
              </div>

              {/* Play Button Icon (Shorts / Reels style) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${item.platform === 'youtube' ? 'bg-[#ff0033]' : 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4L20 12L6 20V4Z" fill="white" />
                  </svg>
                </div>
              </div>

              {/* Caption */}
              <div className="absolute bottom-6 left-6 right-6 text-center">
                <p className="text-white font-medium text-sm leading-relaxed drop-shadow-md">
                  {item.quote}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>



      </div>
    </section>
  );
}
