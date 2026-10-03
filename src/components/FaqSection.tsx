"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Qabul imtihoni qanday o'tadi?",
      a: "Matematika, ingliz tili va tanqidiy fikrlash — 2 soat.",
    },
    {
      q: "Qaysi sinflar uchun qabul bor?",
      a: "5–11 sinf o'quvchilari uchun.",
    },
    {
      q: "IELTS va SAT nima uchun kerak?",
      a: "Harvard, NYU, Oxford kabi universitetlarga kirish uchun asosiy talab. Biz bu imtihonlarni fanlar bilan parallel ravishda o'tkazamiz.",
    },
    {
      q: "Hujjatlarni qanday topshiraman?",
      a: "Saytimiz orqali masofadan yoki maktabga kelib topshirishingiz mumkin. Bu 1 daqiqa oladi.",
    },
    {
      q: "Farzandimning baholarini qanday bilaman?",
      a: "Bizning Sodiq School mobil ilovamiz orqali farzandingizning davomati, baholari va o'zlashtirishini kuzatib borishingiz mumkin. O'zbek, rus va ingliz tillarida ishlaydi.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#ececec] text-[#06113c]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-block text-[#ff8a32] text-xs md:text-sm font-bold tracking-widest uppercase mb-2">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-[#06113c] tracking-tight">
            KO'P BERILADIGAN SAVOLLAR
          </h2>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col space-y-3"
        >
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-sm border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-[#06113c] text-base md:text-lg hover:text-[#ff8a32] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`text-[#ff8a32] font-bold text-2xl w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-[#06113c]/70 text-sm md:text-base leading-relaxed border-t border-slate-100 mt-1">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
