"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    grade: "",
    region: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        phone: "",
        grade: "",
        region: "",
        message: "",
      });
      alert("Arizangiz qabul qilindi! Operatorlarimiz tez orada bog'lanishadi.");
    }, 600);
  };

  return (
    <section id="contact" className="relative py-20 lg:py-28 bg-gradient-to-br from-[#06113c] via-[#0d1a4a] to-[#152259] text-white overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-24 -left-20 w-80 h-80 bg-[#ff8a32]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#4fc3f7]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Contact Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16 lg:mb-24">
          {/* Left Column: Info & Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                  Maslahat olish uchun raqamingizni qoldiring
                </h3>
                <p className="text-white/60 text-base">
                  Biz siz bilan 24 soat ichida bog'lanamiz.
                </p>
              </div>

              {/* Info Rows */}
              <div className="flex flex-col space-y-6 mb-8">
                {/* Location 1 */}
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffa055] via-[#ff8a32] to-[#ff7a1a] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold tracking-widest uppercase text-[#ff8a32]">Manzil</span>
                    <span className="block text-white font-semibold text-sm sm:text-base">Абдулла Кадыри, 11, Шайхантахурский район, Ташкент</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffa055] via-[#ff8a32] to-[#ff7a1a] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.94.36 1.86.7 2.74a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.34-1.34a2 2 0 012.11-.45c.88.34 1.8.57 2.74.7A2 2 0 0122 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold tracking-widest uppercase text-[#ff8a32]">Telefon</span>
                    <a href="tel:+998712443581" className="block text-white font-semibold text-sm sm:text-base hover:text-[#ff8a32] transition-colors">
                      +998 71 244 35 81
                    </a>
                  </div>
                </div>

                {/* Work hours */}
                <div className="flex items-center gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffa055] via-[#ff8a32] to-[#ff7a1a] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"></circle>
                      <path d="M12 7v5l3 2"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold tracking-widest uppercase text-[#ff8a32]">Ish vaqti</span>
                    <span className="block text-white font-semibold text-sm sm:text-base">Dushanba–Shanba · 9:00–18:00</span>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://t.me/sodiq_school"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 hover:bg-[#ff8a32] text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                  aria-label="Telegram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.5 4.5L2.5 12l5.5 2 2 6 3-3.5 5 4 3.5-16zm-4.7 4.2l-7.5 6.8-1.2-3.7 8.7-3.1z"></path>
                  </svg>
                </a>
                <a
                  href="https://instagram.com/sodiqschool.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 hover:bg-[#ff8a32] text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                    <circle cx="12" cy="12" r="5"></circle>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"></circle>
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@sodiq_school"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 hover:bg-[#ff8a32] text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 9.71s-.23-1.6-.93-2.3c-.89-.93-1.89-.94-2.35-.99C16.4 6.1 12 6.1 12 6.1s-4.4 0-7.72.32c-.46.05-1.46.06-2.35.99-.7.7-.93 2.3-.93 2.3S.77 11.54.77 13.37v1.71c0 1.83.23 3.66.23 3.66s.23 1.6.93 2.3c.89.93 2.06.9 2.58 1 1.87.18 7.49.23 7.49.23s4.4-.01 7.72-.33c.46-.05 1.46-.06 2.35-.99.7-.7.93-2.3.93-2.3s.23-1.83.23-3.66v-1.71c0-1.83-.23-3.66-.23-3.66zM9.55 15.72V9.5l6.36 3.12-6.36 3.1z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
              <div className="mb-2">
                <h3 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                  Bog'lanish
                </h3>
                <p className="text-white/60 text-sm">
                  Biz siz bilan 24 soat ichida bog'lanamiz.
                </p>
              </div>

              {/* Name input */}
              <input
                type="text"
                name="name"
                required
                placeholder="Ismingiz"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white text-[#06113c] px-5 py-4 rounded-xl border-2 border-[#ff8a32] focus:outline-none focus:ring-4 focus:ring-[#ff8a32]/20 font-medium text-sm placeholder:text-[#06113c]/50 transition-all"
              />

              {/* Phone input */}
              <input
                type="tel"
                name="phone"
                required
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white text-[#06113c] px-5 py-4 rounded-xl border-2 border-[#ff8a32] focus:outline-none focus:ring-4 focus:ring-[#ff8a32]/20 font-medium text-sm placeholder:text-[#06113c]/50 transition-all"
              />

              {/* Grade select */}
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full bg-white text-[#06113c] px-5 py-4 rounded-xl border-2 border-[#ff8a32] focus:outline-none focus:ring-4 focus:ring-[#ff8a32]/20 font-medium text-sm transition-all"
              >
                <option value="" disabled>Sinfni tanlang</option>
                <option value="1-sinf">1-sinf</option>
                <option value="2-sinf">2-sinf</option>
                <option value="3-sinf">3-sinf</option>
                <option value="4-sinf">4-sinf</option>
                <option value="5-sinf">5-sinf</option>
                <option value="6-sinf">6-sinf</option>
                <option value="7-sinf">7-sinf</option>
                <option value="8-sinf">8-sinf</option>
                <option value="9-sinf">9-sinf</option>
                <option value="10-sinf">10-sinf</option>
                <option value="11-sinf">11-sinf</option>
              </select>

              {/* Region select */}
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full bg-white text-[#06113c] px-5 py-4 rounded-xl border-2 border-[#ff8a32] focus:outline-none focus:ring-4 focus:ring-[#ff8a32]/20 font-medium text-sm transition-all"
              >
                <option value="" disabled>Viloyatni tanlang...</option>
                <option value="Toshkent shahri">Toshkent shahri</option>
                <option value="Toshkent viloyati">Toshkent viloyati</option>
                <option value="Andijon viloyati">Andijon viloyati</option>
                <option value="Buxoro viloyati">Buxoro viloyati</option>
                <option value="Farg'ona viloyati">Farg'ona viloyati</option>
                <option value="Jizzax viloyati">Jizzax viloyati</option>
                <option value="Xorazm viloyati">Xorazm viloyati</option>
                <option value="Namangan viloyati">Namangan viloyati</option>
                <option value="Navoiy viloyati">Navoiy viloyati</option>
                <option value="Qashqadaryo viloyati">Qashqadaryo viloyati</option>
                <option value="Qoraqalpog'iston Respublikasi">Qoraqalpog'iston Respublikasi</option>
                <option value="Samarqand viloyati">Samarqand viloyati</option>
                <option value="Sirdaryo viloyati">Sirdaryo viloyati</option>
                <option value="Surxondaryo viloyati">Surxondaryo viloyati</option>
              </select>

              {/* Message textarea */}
              <textarea
                name="message"
                rows={3}
                placeholder="Savolingizni yozing..."
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-white text-[#06113c] px-5 py-4 rounded-xl border-2 border-[#ff8a32] focus:outline-none focus:ring-4 focus:ring-[#ff8a32]/20 font-medium text-sm placeholder:text-[#06113c]/50 resize-none transition-all"
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitted}
                className="w-full bg-[#ff8a32] hover:bg-[#e07524] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 text-base mt-2 disabled:opacity-50"
              >
                {submitted ? "Yuborilmoqda..." : "Maslahat olaman"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Maps Grid Section (Single Location) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full h-[400px] lg:h-[500px]">
            <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col justify-center">
              <strong className="block text-white text-base font-bold">Toshkent filiali</strong>
              <span className="block text-white/60 text-sm mt-0.5">Абдулла Кадыри, 11, Шайхантахурский район, Ташкент</span>
            </div>
            <div className="w-full flex-1">
              <iframe
                src="https://www.google.com/maps?q=41.26229879714372%2C69.25543075582065&z=16&output=embed"
                title="Sodiq School manzili: Aeroport (Sirg'ali, Qumariq)"
                className="w-full h-full border-0 grayscale-[15%] contrast-[95%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
