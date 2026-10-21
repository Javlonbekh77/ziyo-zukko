"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

type Phase = "start" | "playing-forward" | "interactive" | "playing-backward";

// Global memory cache for instant zero-latency hero animation rendering across navigations
const globalFrameCache = new Map<string, HTMLImageElement[]>();

export default function KeyboardScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalFrames = isMobile ? 96 : 192;
  const interactiveStartFrame = 100;
  // Mobil versiyada birinchi scroll bo'lganda video oxirigacha (totalFrames - 1) o'ynaydi.
  // Katta ekranlarda esa avvalgi holatdek interactiveStartFrame (100) gacha o'ynaydi.
  const targetEndFrame = isMobile ? totalFrames - 1 : interactiveStartFrame;

  // SSR va client initial hydration bir xil bo'lishi uchun statik "start" bilan boshlanadi
  const [phase, setPhase] = useState<Phase>("start");

  // Mount bo'lganda ham sahifa joylashuvi yoki hashni tekshirish
  useEffect(() => {
    const unlock = () => {
      setPhase("interactive");
      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
    };

    if (typeof window !== "undefined" && (window.scrollY > 10 || window.location.hash)) {
      unlock();
    }

    const handleScrollCheck = () => {
      if (window.scrollY > 30) {
        unlock();
      }
    };

    window.addEventListener("unlock-scroll", unlock);
    window.addEventListener("hashchange", unlock);
    window.addEventListener("scroll", handleScrollCheck, { passive: true });
    return () => {
      window.removeEventListener("unlock-scroll", unlock);
      window.removeEventListener("hashchange", unlock);
      window.removeEventListener("scroll", handleScrollCheck);
    };
  }, []);

  const currentFrameRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Katta ekranlar uchun: qolgan scrollni interactiveStartFrame dan oxirigacha xaritalash
  const scrollFrameIndex = useTransform(scrollYProgress, [0, 1], [interactiveStartFrame, totalFrames - 1]);

  const dimensionsRef = useRef<{ width: number; height: number; dpi: number }>({ width: 0, height: 0, dpi: 1 });

  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;
    const dpi = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    dimensionsRef.current = { width, height, dpi };

    const targetWidth = Math.round(width * dpi);
    const targetHeight = Math.round(height * dpi);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
  }, []);

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const img = imagesRef.current[index];
    if (!img) return;

    let { width, height, dpi } = dimensionsRef.current;
    if (width === 0 || height === 0) {
      dpi = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      width = typeof window !== "undefined" ? window.innerWidth : 1920;
      height = typeof window !== "undefined" ? window.innerHeight : 1080;
      dimensionsRef.current = { width, height, dpi };

      const targetWidth = Math.round(width * dpi);
      const targetHeight = Math.round(height * dpi);
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
    }

    context.save();
    context.scale(dpi, dpi);

    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    }

    context.clearRect(0, 0, width, height);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();
  }, []);

  useEffect(() => {
    updateCanvasDimensions();
    const handleResize = () => {
      updateCanvasDimensions();
      renderFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCanvasDimensions, renderFrame]);

  // Kadrlar to'liq yuklanguncha kutish (katta va kichik ekranlar uchun ham)
  useEffect(() => {
    let isMounted = true;
    const isMobileDevice = typeof window !== "undefined" && window.innerWidth < 768;
    const basePath = isMobileDevice ? "/frames_mobile" : "/frames";
    const frameCount = isMobileDevice ? 96 : 192;

    // 0. Agar global xotirada kesh mavjud bo'lsa - DARHOL 0ms da yuklash
    if (globalFrameCache.has(basePath)) {
      const cached = globalFrameCache.get(basePath)!;
      imagesRef.current = cached;
      setLoadProgress(100);
      setLoaded(true);
      if (window.scrollY > 10) {
        setPhase("interactive");
        currentFrameRef.current = isMobileDevice ? frameCount - 1 : Math.round(scrollFrameIndex.get());
        renderFrame(currentFrameRef.current);
      } else {
        renderFrame(0);
      }
      return;
    }

    setLoaded(false);
    setLoadProgress(0);

    const loadedImgs: HTMLImageElement[] = new Array(frameCount);
    let loadedCount = 0;

    const handleFrameLoaded = () => {
      if (!isMounted) return;
      loadedCount++;
      const progress = Math.min(100, Math.round((loadedCount / frameCount) * 100));
      setLoadProgress(progress);

      // 1-kadr yuklanganda orqa fondagi canvasga chizib qo'yish
      if (loadedCount === 1 && loadedImgs[0]) {
        imagesRef.current = loadedImgs;
        renderFrame(0);
      }

      // Animatsiyaning barcha kadrlari to'liq yuklangandan keyingina loadingni tugatish
      if (loadedCount >= frameCount) {
        imagesRef.current = loadedImgs;
        globalFrameCache.set(basePath, loadedImgs);
        setLoaded(true);

        if (window.scrollY > 10) {
          setPhase("interactive");
          currentFrameRef.current = isMobileDevice ? frameCount - 1 : Math.round(scrollFrameIndex.get());
          renderFrame(currentFrameRef.current);
        } else {
          renderFrame(0);
        }
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `${basePath}/frame_${frameNum}.jpg`;
      img.onload = () => {
        loadedImgs[i - 1] = img;
        handleFrameLoaded();
      };
      img.onerror = () => {
        handleFrameLoaded();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [renderFrame, scrollFrameIndex, isMobile]);

  // Scrollni qulflash va Auto-playni boshqarish (oldinga va orqaga)
  useEffect(() => {
    if (phase === "interactive") {
      const handleTopWheel = (e: WheelEvent) => {
        if (window.scrollY <= 0 && e.deltaY < -20) {
          setPhase("playing-backward");
        }
      };
      window.addEventListener("wheel", handleTopWheel, { passive: true });
      return () => window.removeEventListener("wheel", handleTopWheel);
    }

    let touchStartY = 0;

    const handleScrollAttempt = (e: Event) => {
      // Animatsiya to'liq yuklanmaguncha har qanday scrollni bloklash
      if (!loadedRef.current) {
        e.preventDefault();
        return;
      }

      let isScrollingDown = false;

      if (e.type === "wheel") {
        const wheelEvent = e as WheelEvent;
        isScrollingDown = wheelEvent.deltaY > 0;
      } else if (e.type === "touchstart") {
        const touchEvent = e as TouchEvent;
        touchStartY = touchEvent.touches[0].clientY;
      } else if (e.type === "touchmove") {
        const touchEvent = e as TouchEvent;
        const currentY = touchEvent.touches[0].clientY;
        isScrollingDown = currentY < touchStartY - 10;
      }

      if (phase === "start") {
        if (window.scrollY > 10) {
          setPhase("interactive");
          return;
        }

        if (isScrollingDown) {
          e.preventDefault();
          setPhase("playing-forward");
        } else {
          e.preventDefault();
        }
      } else if (phase === "playing-forward" || phase === "playing-backward") {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleScrollAttempt, { passive: false });
    window.addEventListener("touchstart", handleScrollAttempt, { passive: true });
    window.addEventListener("touchmove", handleScrollAttempt, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScrollAttempt);
      window.removeEventListener("touchstart", handleScrollAttempt);
      window.removeEventListener("touchmove", handleScrollAttempt);
    };
  }, [phase]);

  // Auto-play videosi:
  // Mobil: frame 0 dan oxirigacha (totalFrames - 1)
  // Desktop: frame 0 dan interactiveStartFrame (100) gacha
  useEffect(() => {
    if (phase === "playing-forward" || phase === "playing-backward") {
      let lastTime = performance.now();
      const fps = 84; // Silliq original video tezligi
      const interval = 1000 / fps;
      let animationFrameId: number;

      const play = (currentTime: number) => {
        if (phase === "playing-forward" && currentFrameRef.current >= targetEndFrame) {
          setPhase("interactive");
          return;
        }
        if (phase === "playing-backward" && currentFrameRef.current <= 0) {
          setPhase("start");
          return;
        }

        const deltaTime = currentTime - lastTime;
        if (deltaTime >= interval) {
          if (phase === "playing-forward") {
            currentFrameRef.current = Math.min(
              targetEndFrame,
              currentFrameRef.current + 1
            );
          } else {
            currentFrameRef.current = Math.max(
              0,
              currentFrameRef.current - 1
            );
          }
          renderFrame(currentFrameRef.current);
          lastTime = currentTime - (deltaTime % interval);
        }
        animationFrameId = requestAnimationFrame(play);
      };

      animationFrameId = requestAnimationFrame(play);

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [phase, renderFrame, targetEndFrame]);

  // Auto-play tugagandan so'ng:
  // Desktopda: scroll orqali qolgan kadrlarni (100 - 191) boshqarish
  // Mobilda: video oxirigacha o'ynagan (frame 95), oxirgi kadrda turadi va sahifa tabiiy scroll bo'ladi
  useEffect(() => {
    if (phase === "interactive") {
      const handleRender = () => {
        if (isMobile) {
          currentFrameRef.current = totalFrames - 1;
          renderFrame(totalFrames - 1);
          return;
        }
        const idx = Math.min(
          totalFrames - 1,
          Math.max(interactiveStartFrame, Math.round(scrollFrameIndex.get()))
        );
        currentFrameRef.current = idx;
        renderFrame(idx);
      };

      const unsubscribe = scrollFrameIndex.on("change", handleRender);
      window.addEventListener("resize", handleRender);

      handleRender();

      return () => {
        unsubscribe();
        window.removeEventListener("resize", handleRender);
      };
    }
  }, [phase, scrollFrameIndex, renderFrame, totalFrames, interactiveStartFrame, isMobile]);

  // Lenis smooth scroll holatini boshqarish
  useEffect(() => {
    const checkAndToggleLenis = () => {
      const lenis = (window as any).lenis;
      if (!lenis) return;

      if (!loadedRef.current) {
        lenis.stop();
        return;
      }

      if (phase === "interactive") {
        lenis.start();
      } else {
        if (typeof window !== "undefined" && window.scrollY <= 10 && !window.location.hash) {
          lenis.stop();
        } else {
          lenis.start();
        }
      }
    };

    checkAndToggleLenis();

    const timer1 = setTimeout(checkAndToggleLenis, 50);
    const timer2 = setTimeout(checkAndToggleLenis, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.start();
      }
    };
  }, [phase, loaded]);

  const { t } = useLanguage();

  return (
    <div
      ref={containerRef}
      suppressHydrationWarning
      data-lenis-prevent={phase !== "interactive" ? "" : undefined}
      className="h-[100dvh] md:h-[250vh] relative bg-black"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300">
            <div className="flex flex-col items-center gap-4 px-6 text-center select-none">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-[#ff6b00]/20 border-t-[#ff6b00] rounded-full animate-spin" />
                <span className="absolute text-[11px] font-bold text-white/90">
                  {loadProgress}%
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-white/90 tracking-wide text-sm font-semibold">
                  {t("loading")}
                </p>
                <div className="w-44 sm:w-56 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff6b00] via-[#f59e0b] to-[#2168f2] transition-all duration-150 ease-out rounded-full"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
