"use client";

import { motion } from "framer-motion";

export default function AdmissionsSection() {
  const scrollToContact = () => {
    const el = document.getElementById("contact") || document.getElementById("aloqa");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="qabul" className="py-16 md:py-24 bg-[#06113c] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block text-[#ff8a32] text-xs md:text-sm font-bold tracking-widest uppercase mb-3">
            QABUL 2026–2027
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase text-white tracking-tight leading-tight mb-4 max-w-3xl mx-auto">
            FARZANDINGIZNI <br className="hidden sm:inline" /> KELAJAK UCHUN HOZIRDAN TAYYORLANG
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Imtihon asosida saralangan bolalar qatorida farzandingiz tahsil oladi.
          </p>
        </motion.div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Column 1: Qabul jarayoni */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#ff8a32] mb-6">
                QABUL JARAYONI
              </h3>
              <div className="flex flex-col space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffa055] to-[#ff7a1a] text-white font-bold flex items-center justify-center text-base shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform duration-300">
                      1
                    </span>
                    <span className="w-0.5 flex-1 bg-gradient-to-b from-[#ff8a32]/60 to-transparent my-2"></span>
                  </div>
                  <div className="pb-4">
                    <span className="block font-semibold text-white text-base mb-1 group-hover:text-[#ff8a32] transition-colors duration-300">
                      Imtihon
                    </span>
                    <span className="block text-white/50 text-sm leading-relaxed">
                      Matematika, ingliz tili, tanqidiy fikrlash — 2 soat
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffa055] to-[#ff7a1a] text-white font-bold flex items-center justify-center text-base shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform duration-300">
                      2
                    </span>
                    <span className="w-0.5 flex-1 bg-gradient-to-b from-[#ff8a32]/60 to-transparent my-2"></span>
                  </div>
                  <div className="pb-4">
                    <span className="block font-semibold text-white text-base mb-1 group-hover:text-[#ff8a32] transition-colors duration-300">
                      Suhbat
                    </span>
                    <span className="block text-white/50 text-sm leading-relaxed">
                      Bola va ota-onalari bilan suhbat
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffa055] to-[#ff7a1a] text-white font-bold flex items-center justify-center text-base shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform duration-300">
                      3
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-white text-base mb-1">
                      Natija va qabul
                    </span>
                    <span className="block text-white/50 text-sm leading-relaxed">
                      Natijaga ko'ra qabul qilinadi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Imtihon fanlari */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#ff8a32] mb-6">
                IMTIHON FANLARI
              </h3>
              <div className="flex flex-col space-y-3.5">
                {/* Test 1 */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0a184a] border border-[#ff8a32]/30 shadow-[inset_0_0_15px_rgba(255,138,50,0.15)] hover:shadow-[inset_0_0_25px_rgba(255,138,50,0.3)] hover:-translate-y-1 hover:border-[#ff8a32]/60 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffa055] to-[#ff7a1a] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-500/40">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16v16H4z"></path>
                      <path d="M9 9h6M9 13h6M9 17h3"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="block font-semibold text-white text-sm md:text-base">Matematika</span>
                    <span className="block text-[#ff8a32]/80 text-xs md:text-sm mt-0.5">Mantiq va hisoblash</span>
                  </div>
                </div>

                {/* Test 2 */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0a184a] border border-[#ff8a32]/30 shadow-[inset_0_0_15px_rgba(255,138,50,0.15)] hover:shadow-[inset_0_0_25px_rgba(255,138,50,0.3)] hover:-translate-y-1 hover:border-[#ff8a32]/60 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffa055] to-[#ff7a1a] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-500/40">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9"></circle>
                      <path d="M12 3v18M3 12h18"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="block font-semibold text-white text-sm md:text-base">Mantiqiy fikrlash</span>
                    <span className="block text-[#ff8a32]/80 text-xs md:text-sm mt-0.5">Tahlil va mushohada</span>
                  </div>
                </div>

                {/* Test 3 */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0a184a] border border-[#ff8a32]/30 shadow-[inset_0_0_15px_rgba(255,138,50,0.15)] hover:shadow-[inset_0_0_25px_rgba(255,138,50,0.3)] hover:-translate-y-1 hover:border-[#ff8a32]/60 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffa055] to-[#ff7a1a] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-500/40">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 5h18M3 12h18M3 19h12"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="block font-semibold text-white text-sm md:text-base">Ingliz tili</span>
                    <span className="block text-[#ff8a32]/80 text-xs md:text-sm mt-0.5">Grammar va reading</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Ma'lumot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#ff8a32] mb-6">
                MA'LUMOT
              </h3>
              <div className="flex flex-col divide-y divide-white/10 mb-6">
                <div className="flex justify-between items-center py-3.5">
                  <span className="text-white/50 text-sm">Qabul qilinadigan sinflar</span>
                  <span className="font-bold text-white text-base">5–11 sinf</span>
                </div>
                <div className="flex justify-between items-center py-3.5">
                  <span className="text-white/50 text-sm">Imtihon davomiyligi</span>
                  <span className="font-bold text-white text-base">2 soat</span>
                </div>
                <div className="flex justify-between items-center py-3.5">
                  <span className="text-white/50 text-sm">Natija</span>
                  <span className="font-bold text-white text-base">Saralash asosida</span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={scrollToContact}
                className="w-full bg-gradient-to-r from-[#ffa055] via-[#ff8a32] to-[#ff7a1a] hover:from-[#ffb070] hover:to-[#e07524] text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(255,138,50,0.4)] hover:shadow-[0_0_30px_rgba(255,138,50,0.6)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] text-center text-base"
              >
                Ro'yxatdan o'tish
              </button>
              <p className="mt-4 text-center text-white/50 text-sm">
                Savollaringiz bormi?{" "}
                <a href="tel:+998788888080" className="text-white font-semibold hover:text-[#ff8a32] transition-colors">
                  +998 78 888 80 80
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
