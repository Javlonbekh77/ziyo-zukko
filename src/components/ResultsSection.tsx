"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useRef } from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

function CountUp({ from = 0, to, duration = 2, suffix = "" }: { from?: number; to: number; duration?: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, to, duration, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function ResultsSection() {
  const [activeTab, setActiveTab] = useState("Matematika");

  const categories = [
    "Matematika",
    "IELTS",
    "CEFR",
  ];

  const allCertificates = {
    Matematika: [
      { id: 1, name: "Raxmatullayev Ramziddin", score: "A+", subject: "Matematika", image: "/sertifikatlar/cert1.jpeg" },
      { id: 2, name: "Karolberdiyev Shoxrux", score: "A+", subject: "Matematika", image: "/sertifikatlar/cert1.jpeg" },
      { id: 3, name: "Qodirov Laziz", score: "A", subject: "Matematika", image: "/sertifikatlar/cert1.jpeg" },
      { id: 4, name: "Javlonbek Xoliqulov", score: "A", subject: "Matematika", image: "/sertifikatlar/cert1.jpeg" },
      { id: 5, name: "Maxmarayimov Abduhakim", score: "A", subject: "Matematika", image: "/sertifikatlar/cert1.jpeg" },
      { id: 6, name: "Ismoilov Behruz", score: "A", subject: "Matematika", image: "/sertifikatlar/cert1.jpeg" },
    ],
    IELTS: [
      { id: 7, name: "Toshmatov Eshmat", score: "7.5", subject: "IELTS", image: "/sertifikatlar/cert1.jpeg" },
      { id: 8, name: "Alimova Zarina", score: "8.0", subject: "IELTS", image: "/sertifikatlar/cert1.jpeg" },
      { id: 9, name: "Sobirov Jasur", score: "7.0", subject: "IELTS", image: "/sertifikatlar/cert1.jpeg" },
      { id: 10, name: "Rahmonov Asliddin", score: "7.5", subject: "IELTS", image: "/sertifikatlar/cert1.jpeg" },
    ],
    CEFR: [
      { id: 11, name: "Qosimova Sevara", score: "C1", subject: "CEFR", image: "/sertifikatlar/cert1.jpeg" },
      { id: 12, name: "Botirov Diyor", score: "B2", subject: "CEFR", image: "/sertifikatlar/cert1.jpeg" },
      { id: 13, name: "Nazarova Madina", score: "C1", subject: "CEFR", image: "/sertifikatlar/cert1.jpeg" },
      { id: 14, name: "Sodiqov Sardor", score: "B2", subject: "CEFR", image: "/sertifikatlar/cert1.jpeg" },
    ],
  };

  const certificates = allCertificates[activeTab as keyof typeof allCertificates] || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section id="natijalar" className="py-24 bg-white text-[#071a33]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tight text-[#071a33] mb-3"
            >
              Natijalar o'zlari gapiradi
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-black/60 font-medium text-sm md:text-base"
            >
              ZIYO-ZUKKO o'quvchilarining sertifikat, DTM va universitet natijalari
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="#all-results"
              className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Barchasini ko'rish &rarr;
            </Link>
          </motion.div>
        </div>

        {/* 3 Stats Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-black/10 mb-12">
          <div className="text-center md:text-left flex flex-col gap-1 md:border-r border-black/10 pr-6">
            <span className="text-5xl md:text-6xl font-black text-[#ff6b00]">
              <CountUp to={120} suffix="+" />
            </span>
            <h4 className="font-bold text-base text-[#071a33] mt-2">
              Sertifikat olgan o'quvchilar
            </h4>
            <p className="text-xs text-black/60">IELTS, SAT va fan sertifikatlari</p>
          </div>

          <div className="text-center md:text-left flex flex-col gap-1 md:border-r border-black/10 px-0 md:px-6">
            <span className="text-5xl md:text-6xl font-black text-[#ff6b00]">
              <CountUp to={185} suffix="+" />
            </span>
            <h4 className="font-bold text-base text-[#071a33] mt-2">
              DTM o'rtacha bali
            </h4>
            <p className="text-xs text-black/60">
              Kirish imtihonlari uchun kuchli tayyorgarlik
            </p>
          </div>

          <div className="text-center md:text-left flex flex-col gap-1 pl-0 md:pl-6">
            <span className="text-5xl md:text-6xl font-black text-[#ff6b00]">
              <CountUp to={96} suffix="%" />
            </span>
            <h4 className="font-bold text-base text-[#071a33] mt-2">
              Bitiruvchilar natijasi
            </h4>
            <p className="text-xs text-black/60">
              Tanlagan yo'nalishiga muvaffaqiyatli o'tdi
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                activeTab === cat
                  ? "bg-[#ff6b00] text-white shadow-md shadow-orange-500/30 scale-105"
                  : "bg-[#f1f5f9] text-black/70 hover:bg-[#e2e8f0] hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              variants={itemVariants}
              className="relative rounded-3xl border border-black/5 p-1 md:p-1.5 list-none group hover:-translate-y-2 transition-all duration-300 max-w-sm mx-auto w-full"
            >
              <GlowingEffect
                blur={0}
                spread={40}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
                glow={true}
                disabled={false}
              />
              <div className="relative bg-white rounded-[1.3rem] overflow-hidden shadow-lg shadow-black/5 flex flex-col h-full z-10">
                <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                  <Image
                    src={cert.image}
                    alt={cert.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>

                <div className="p-4 text-center flex flex-col justify-between flex-1 bg-white">
                  <h3 className="font-extrabold text-sm md:text-sm text-[#071a33] mb-1 group-hover:text-[#ff6b00] transition-colors">
                    {cert.name}
                  </h3>
                  <span className="text-xl font-black text-[#ff6b00]">
                    {cert.score}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
