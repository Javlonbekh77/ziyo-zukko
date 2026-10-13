"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutSection() {
  const { lang, t } = useLanguage();

  return (
    <section id="about" className="py-16 bg-[#f8fafc] text-[#0b1b36] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
        >
          
          {/* Left: President Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/3 relative"
          >
            {/* Red border accent */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 border-t-4 border-l-4 border-[#8c1c3f] rounded-tl-3xl z-0 -translate-x-2 -translate-y-2"></div>
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl z-10 bg-gray-200">
              <Image 
                src="/data/pres.png" 
                alt="President" 
                fill 
                className="object-cover object-top"
                unoptimized
              />
            </div>
          </motion.div>

          {/* Middle: Text and Quote */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full lg:w-1/3 flex flex-col py-4"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight tracking-tight text-[#0b1b36]">
              {t("aboutTitle1")} <br />
              <span className="text-[#8c1c3f]">{t("aboutTitle2")}</span>
            </h2>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg shadow-black/5 border-l-4 border-[#0b1b36] mb-8">
              <p className="text-lg text-black/70 italic font-medium leading-relaxed">
                {t("aboutQuote")}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#0b1b36]">{t("presidentName")}</h3>
              <p className="text-[#0b1b36]/60 font-medium text-sm mt-1">{t("presidentTitle")}</p>
            </div>

            <div className="mt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1b36] hover:bg-[#ff6b00] text-white text-sm font-semibold transition-all duration-300 shadow-md group"
              >
                <span>{lang === "ru" ? "Подробнее о школе" : lang === "en" ? "Learn more about school" : "Maktab haqida batafsil"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Right: School Campus */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full lg:w-1/3 relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <Image 
                src="/data/maktab_binosi.png" 
                alt={t("campusTitle")} 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-xl font-bold">{t("campusTitle")}</h3>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
