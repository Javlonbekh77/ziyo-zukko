"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OlympiadsSection() {
  const olympiads = [
    {
      id: "oly-1",
      title: "Al-Xorazmiy nomidagi aniq va tabiiy fanlar olimpiadasi",
      text: "Al-Xorazmiy nomidagi aniq va tabiiy fanlar olimpiadasining IV (respublika) bosqichida tabiiy fanlar yo'nalishi bo'yicha 7-sinflar o'rtasida 7-A...",
      image: "https://picsum.photos/seed/oly11/600/400",
      badge: "3-o'rin",
    },
    {
      id: "oly-2",
      title: "MOLIYAVIY SAVODXONLIK OLIMPIADASI",
      text: '"Moliyaviy savodxonlik" olimpiadasining Qashqadaryo viloyat bosqichida maktabimiz o\'quvchilari munosib ishtirok etib, faxrli...',
      image: "https://picsum.photos/seed/oly22/600/400",
      badge: "1-o'rin va 2-o'rin",
    },
    {
      id: "oly-3",
      title: "🏆 IMC 2026",
      text: "Ushbu yutuqlar orasida ZIYO-ZUKKO maktabining 8-\"A\" sinf o'quvchisi Rahmatullayev Ramziddin ham bor. ...",
      image: "https://picsum.photos/seed/oly33/600/400",
      badge: "Bronza medali",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="olimpiadachilar"
      className="py-24 bg-[#071a33] text-white overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3"
          >
            YUTUQLAR
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4"
          >
            Olimpiadachilarimiz
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/70 max-w-xl mx-auto text-sm md:text-base font-medium"
          >
            O'quvchilarimiz fan olimpiadalari va xalqaro musobaqalarda erishgan natijalari
          </motion.p>
        </div>

        {/* Olympiad Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {olympiads.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const angle = Math.atan2(y, x);
                e.currentTarget.style.setProperty("--rotation", `${angle}rad`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty("--rotation", "0deg");
              }}
              style={{
                border: "3px solid transparent",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                backgroundImage: `linear-gradient(#0c2242, #0c2242), conic-gradient(from var(--rotation,0deg), #ff6b00 0deg, #ff6b00 90deg, rgba(255,255,255,0.1) 90deg, rgba(255,255,255,0.1) 360deg)`
              }}
              className="rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-800">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>

              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#ff6b00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/65 text-sm leading-relaxed mb-6 line-clamp-3">
                    {item.text}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-block bg-[#ff6b00] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md shadow-orange-500/20">
                    {item.badge}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Button */}
        <div className="text-center">
          <Link
            href="#all-olympiads"
            className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm md:text-base px-8 py-3 rounded-xl hover:bg-[#ff6b00] hover:text-white transition-all shadow-md"
          >
            Barcha olimpiada natijalarini ko'rish &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
