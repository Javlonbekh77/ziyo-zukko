"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Admin sahifalarida Lenis inersiyasini to'xtatish (formlar, modal va jadvallar erkin skroll bo'lishi uchun)
    if (pathname?.startsWith("/admin")) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete (window as any).lenis;
      }
      return;
    }

    if (!lenisRef.current) {
      const lenis = new Lenis({
        duration: 0.85, // Chaqqon, silliq va o'ta sezgir inersiya
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        infinite: false,
      });

      lenisRef.current = lenis;
      (window as any).lenis = lenis;

      let animationFrameId: number;
      function raf(time: number) {
        lenis.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }
      animationFrameId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(animationFrameId);
        lenis.destroy();
        lenisRef.current = null;
        delete (window as any).lenis;
      };
    }
  }, [pathname]);

  // Har safar sahifa marshruti (pathname) o'zgarganda lenis.start() va hash yoki scroll 0 ga o'tishi
  useEffect(() => {
    if (!lenisRef.current) return;

    const hash = window.location.hash;
    if (hash) {
      const cleanId = hash.replace(/^#/, "");
      lenisRef.current.start();
      window.dispatchEvent(new CustomEvent("unlock-scroll"));

      const tryScroll = (attempts = 0) => {
        const el = document.getElementById(cleanId);
        if (el && lenisRef.current) {
          lenisRef.current.scrollTo(el, { offset: -75, duration: 1.1 });
        } else if (attempts < 10) {
          setTimeout(() => tryScroll(attempts + 1), 100);
        }
      };

      setTimeout(() => tryScroll(), 120);
    } else {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.start();
    }
  }, [pathname]);

  return <>{children}</>;
}

