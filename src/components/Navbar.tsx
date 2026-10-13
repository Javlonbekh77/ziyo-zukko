"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useLanguage, Language } from "@/context/LanguageContext";

interface NavbarProps {
  solidAtTop?: boolean;
}

export default function Navbar({ solidAtTop }: NavbarProps = {}) {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= window.innerHeight * 2.5 - 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "home", href: "/" },
    { id: "about", href: "/about" },
    { id: "news", href: "/news" },
    { id: "testimonials", href: "/#testimonials" },
    { id: "olympiads", href: "/#yutuqlar" },
    { id: "gallery", href: "/#galereya" },
    { id: "contact", href: "/#contact" },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: "uz", label: "UZ" },
    { code: "ru", label: "RU" },
    { code: "en", label: "EN" },
  ];

  const isSolid = isScrolled || solidAtTop || isMobileMenuOpen;

  return (
    <>
      {/* Scroll Progress Bar - Appears after hero section */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-[#ff6b00] origin-left z-[60] transition-opacity duration-300"
        style={{ scaleX, opacity: isScrolled ? 1 : 0 }}
      />

      <header
        style={{ backgroundColor: isMobileMenuOpen ? "#ffffff" : undefined }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isMobileMenuOpen
            ? "bg-white border-b border-black/5 shadow-md"
            : isSolid
            ? "bg-white/95 backdrop-blur-2xl border-b border-black/5 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/data/logo-removebg-preview.png"
              alt="ZIYO-ZUKKO"
              width={160}
              height={45}
              className={`object-contain transition-all duration-500 ${!isSolid ? "brightness-0 invert" : ""
                }`}
              priority
            />
          </Link>

          {/* Desktop Nav with bottom line hover effect */}
          <nav
            className={`hidden lg:flex items-center gap-8 text-sm font-semibold transition-colors duration-500 ${isSolid ? "text-[#071a33]" : "text-white"
              }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="relative py-1 transition-colors hover:text-[#ff6b00] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#ff6b00] after:transition-all after:duration-300"
              >
                {t(link.id)}
              </Link>
            ))}
          </nav>

          {/* Right Action Button & Socials */}
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-3 mr-2 transition-colors duration-500 ${isSolid ? "text-[#071a33]" : "text-white"}`}>
              {/* Telegram */}
              <a href="https://t.me/ziyo_zukko" target="_blank" rel="noopener noreferrer" className="hover:text-[#0088cc] hover:scale-110 hover:-translate-y-1 transition-all duration-300" aria-label="Telegram">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.5 4.5L2.5 12l5.5 2 2 6 3-3.5 5 4 3.5-16zm-4.7 4.2l-7.5 6.8-1.2-3.7 8.7-3.1z"></path>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/ziyo_zukko.uz/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E1306C] hover:scale-110 hover:-translate-y-1 transition-all duration-300" aria-label="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/@ziyozukko_uz" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] hover:scale-110 hover:-translate-y-1 transition-all duration-300" aria-label="YouTube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>

            {/* Language Selector (Horizontal Expanding Pill with smooth animation) */}
            <div
              className={`hidden lg:flex items-center p-1 rounded-full backdrop-blur-md transition-all duration-500 overflow-hidden group cursor-pointer border ${
                isSolid
                  ? "bg-black/5 hover:bg-black/10 border-black/10 text-[#071a33]"
                  : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
              }`}
              title="Tilni tanlash / Выберите язык / Select language"
            >
              <div className="flex items-center">
                {/* Active Language Badge */}
                <div className="w-8 h-8 rounded-full bg-[#ff6b00] text-white flex items-center justify-center text-xs font-black shadow-md z-10 relative select-none shrink-0 tracking-wider">
                  {lang.toUpperCase()}
                </div>
                {/* Expandable Options on Hover */}
                <div className="flex items-center justify-start w-0 opacity-0 group-hover:w-[72px] group-hover:opacity-100 group-hover:ml-1.5 gap-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
                  {languages
                    .filter((l) => l.code !== lang)
                    .map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLang(l.code);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isSolid
                            ? "hover:bg-[#ff6b00] hover:text-white text-[#071a33]"
                            : "hover:bg-[#ff6b00] hover:text-white text-white"
                        }`}
                        title={l.label}
                      >
                        {l.label}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <Link
              href="#contact"
              className="hidden lg:inline-flex items-center justify-center bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold text-sm px-7 py-2.5 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {t("apply")}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 z-50 relative ${
                isMobileMenuOpen ? "text-[#071a33]" : (isSolid ? "text-[#071a33]" : "text-white")
              }`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            style={{ backgroundColor: "#ffffff" }}
            className="fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6 pb-6 lg:hidden shadow-2xl overflow-y-auto"
          >
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-center p-1.5 bg-gray-100 rounded-xl mb-6">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex-1 py-2 text-center rounded-lg font-bold text-sm transition-all cursor-pointer ${
                    lang === l.code
                      ? "bg-[#ff6b00] text-white shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <nav className="flex flex-col gap-4 text-base font-bold text-[#071a33]">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-slate-100 hover:text-[#ff6b00] transition-colors"
                >
                  {t(link.id)}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 flex flex-col gap-4">
              <Link
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center bg-[#ff6b00] text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                {t("apply")}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
