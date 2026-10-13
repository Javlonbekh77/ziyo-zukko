"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface FaqItem {
  q: { uz: string; ru: string; en: string };
  a: { uz: string; ru: string; en: string };
}

const faqs: FaqItem[] = [
  {
    q: {
      uz: "Qabul imtihoni qanday o'tadi?",
      ru: "Как проходит вступительный экзамен?",
      en: "How is the entrance exam conducted?",
    },
    a: {
      uz: "Matematika, ingliz tili va mantiqiy fikrlash bo'yicha yozma va test sinovlari — 2 soat davom etadi.",
      ru: "Письменные тесты по математике, английскому языку и логическому мышлению длятся 2 часа.",
      en: "Written and multiple-choice testing in mathematics, English, and logical reasoning lasts 2 hours.",
    },
  },
  {
    q: {
      uz: "Qaysi sinflar uchun qabul bor?",
      ru: "Для каких классов открыт приём?",
      en: "Which grades are eligible for admission?",
    },
    a: {
      uz: "Maktabimizda 1-sinfdan 11-sinfgacha o'quvchilar uchun qabul ochiq (joylar mavjudligiga qarab).",
      ru: "Приём открыт для учащихся с 1 по 11 классы (при наличии свободных мест).",
      en: "Admissions are open for students from Grade 1 through Grade 11 (subject to seat availability).",
    },
  },
  {
    q: {
      uz: "IELTS va SAT nima uchun kerak?",
      ru: "Зачем нужны экзамены IELTS и SAT?",
      en: "Why are IELTS and SAT required?",
    },
    a: {
      uz: "Dunyoning nufuzli universitetlariga to'liq grant asosida kirish uchun asosiy xalqaro talabdir. Maktabimizda tayyorgarlik dars jadvaliga kiritilgan.",
      ru: "Это ключевое международное требование для поступления в ведущие мировые вузы на грантовой основе. Подготовка интегрирована в учебный план.",
      en: "They are essential international requirements for winning full scholarships to prestigious universities worldwide. Preparation is built directly into our curriculum.",
    },
  },
  {
    q: {
      uz: "Hujjatlarni qanday topshiraman?",
      ru: "Как подать документы?",
      en: "How do I submit the application documents?",
    },
    a: {
      uz: "Saytimiz orqali onlayn ariza qoldirishingiz yoki maktabimizga bevosita tashrif buyurishingiz mumkin. Bu 1 daqiqa vaqt oladi.",
      ru: "Вы можете оставить онлайн-заявку через наш сайт или посетить школу лично. Это займёт всего 1 минуту.",
      en: "You can apply online via our website or visit our school in person. It only takes about a minute.",
    },
  },
  {
    q: {
      uz: "Farzandimning baholari va davomatini qanday kuzatib boraman?",
      ru: "Как отслеживать оценки и посещаемость ребёнка?",
      en: "How can I monitor my child's grades and attendance?",
    },
    a: {
      uz: "ZIYO-ZUKKO elektron ta'lim tizimi va mobil platformamiz orqali farzandingizning davomati, baholari va rivojlanishini real vaqtda kuzatib borishingiz mumkin.",
      ru: "Через электронную платформу ZIYO-ZUKKO вы можете в режиме реального времени отслеживать посещаемость, оценки и успеваемость вашего ребёнка.",
      en: "Through the ZIYO-ZUKKO digital school platform, you can monitor your child's daily attendance, academic scores, and progress in real time.",
    },
  },
];

export default function FaqSection() {
  const { lang, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            {t("faqBadge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-[#06113c] tracking-tight">
            {t("faqTitle")}
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
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-[#06113c] text-base md:text-lg hover:text-[#ff8a32] transition-colors cursor-pointer"
                >
                  <span>{faq.q[lang]}</span>
                  <span
                    className={`text-[#ff8a32] font-bold text-2xl w-6 h-6 flex items-center justify-center transition-transform duration-300 shrink-0 ${
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
                        {faq.a[lang]}
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
