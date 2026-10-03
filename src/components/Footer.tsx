"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#071a33] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand info (6 cols) */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Image 
              src="/data/logo-removebg-preview.png" 
              alt="ZIYO-ZUKKO Logo" 
              width={160} 
              height={45} 
              className="object-contain brightness-0 invert"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Kelajak shu yerdan qanot qoqadi. Ilm-fan, texnologiya va tarbiya uyg'unlashgan maskan.
            </p>
          </div>

          {/* Links (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-base uppercase tracking-wider text-white mb-4">
              Havolalar
            </h3>
            <nav className="flex flex-col gap-2.5 text-sm text-white/70">
              <Link href="#home" className="hover:text-[#ff6b00] transition-colors">Bosh sahifa</Link>
              <Link href="#about" className="hover:text-[#ff6b00] transition-colors">Maktab haqida</Link>
              <Link href="#graduates" className="hover:text-[#ff6b00] transition-colors">Natijalar</Link>
              <Link href="#galereya" className="hover:text-[#ff6b00] transition-colors">Galereya</Link>
            </nav>
          </div>

          {/* Contact (4 cols) */}
          <div className="md:col-span-4">
            <h3 className="font-bold text-base uppercase tracking-wider text-white mb-4">
              Aloqa
            </h3>
            <div className="flex flex-col gap-2.5 text-sm text-white/70">
              <Link href="#aloqa" className="text-[#ff6b00] font-semibold hover:underline">
                Savol yoki taklif qoldirish
              </Link>
              <span>+998 71 244 35 81</span>
              <span>info@ziyozukko.uz</span>
              <span>Абдулла Кадыри, 11, Шайхантахурский район, Ташкент</span>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} ZIYO-ZUKKO. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-1.5">
            <span>Designed & Developed by</span>
            <a 
              href="https://t.me/Javlonbekhs_Blog" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:text-[#ff6b00] font-semibold underline transition-colors"
            >
              Javlonbek Xoliqulov
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
