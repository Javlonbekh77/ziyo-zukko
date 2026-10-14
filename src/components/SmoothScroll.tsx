"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85, // Chaqqon, silliq va o'ta sezgir inersiya (ortiqcha kechikishsiz)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenisRef.current = lenis;

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    // Global ravishda navigation/anchor scroll uchun lenis obyektini ulash
    (window as any).lenis = lenis;

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).lenis;
    };
  }, []);

  // Har safar sahifa marshruti (pathname) o'zgarganda lenis.start() bajarilishini kafolatlash
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  }, [pathname]);

  return <>{children}</>;
}

