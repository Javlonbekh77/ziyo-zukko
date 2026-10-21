"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection } from "@/lib/scrollUtils";

export default function Footer() {
  const { lang, t } = useLanguage();

  const galleryLinkText = lang === "ru" ? "Галерея" : lang === "en" ? "Gallery" : "Galereya";
  const admissionsLinkText = lang === "ru" ? "Приём 2026–2027" : lang === "en" ? "Admissions 2026–2027" : "Qabul 2026–2027";

  return (
    <footer className="bg-[#071a33] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand info (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Image 
              src="/data/logo-removebg-preview.png" 
              alt="ZIYO-ZUKKO Logo" 
              width={160} 
              height={45} 
              className="object-contain brightness-0 invert"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              {t("footerSlogan")}
            </p>
          </div>

          {/* Links (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-base uppercase tracking-wider text-white mb-4">
              {t("footerLinksTitle")}
            </h3>
            <nav className="flex flex-col gap-2.5 text-sm text-white/70">
              <Link href="/" className="hover:text-[#ff6b00] transition-colors">{t("home")}</Link>
              <Link href="/about" className="hover:text-[#ff6b00] transition-colors">{t("about")}</Link>
              <Link
                href="/#qabul"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("qabul");
                }}
                className="hover:text-[#ff6b00] transition-colors font-medium text-[#ff8a32]"
              >
                {admissionsLinkText}
              </Link>
              <Link href="/olympiads" className="hover:text-[#ff6b00] transition-colors">{t("olympiads")}</Link>
              <Link href="/certificates" className="hover:text-[#ff6b00] transition-colors">{t("certificates")}</Link>
              <Link href="/gallery" className="hover:text-[#ff6b00] transition-colors">
                {galleryLinkText}
              </Link>
            </nav>
          </div>

          {/* Contact (4 cols) */}
          <div className="md:col-span-4">
            <h3 className="font-bold text-base uppercase tracking-wider text-white mb-4">
              {t("footerContactTitle")}
            </h3>
            <div className="flex flex-col gap-2.5 text-sm text-white/70">
              <Link
                href="/#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                className="text-[#ff6b00] font-semibold hover:underline"
              >
                {t("footerAskQuestion")}
              </Link>
              <span>+998 71 244 35 81</span>
              <span>info@ziyozukko.uz</span>
              <a
                href="https://www.google.com/maps?q=41.3237234294552,69.25740194417808"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff6b00] transition-colors"
              >
                {t("addressValue")}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} ZIYO-ZUKKO. {t("footerCopyright")}</p>
          <div className="flex items-center gap-1.5">
            <span>Designed & Developed for</span>
            <span className="text-white font-semibold">ZIYO-ZUKKO</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
