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
  const isMobileInitial = typeof window !== "undefined" && window.innerWidth < 768;
  const totalFrames = isMobileInitial ? 96 : 192;
  const interactiveStartFrame = isMobileInitial ? 50 : 100;

  // Boshlanishida sahifa pastda bo'lsa yoki hash mavjud bo'lsa darhol phase aniqlash
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window !== "undefined" && (window.scrollY > 10 || window.location.hash)) {
      return "interactive";
    }
    return "start";
  });

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

    window.addEventListener("unlock-scroll", unlock);
    window.addEventListener("hashchange", unlock);
    return () => {
      window.removeEventListener("unlock-scroll", unlock);
      window.removeEventListener("hashchange", unlock);
    };
  }, []);
  const currentFrameRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Qolgan 400vh scrollni interactiveStartFrame dan oxirigacha xaritalash
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

  useEffect(() => {
    let isMounted = true;
    const isMobileDevice = typeof window !== "undefined" && window.innerWidth < 768;
    const basePath = isMobileDevice ? "/frames_mobile" : "/frames";

    // 0. Agar global xotirada kesh mavjud bo'lsa - DARHOL 0ms da yuklash
    if (globalFrameCache.has(basePath)) {
      const cached = globalFrameCache.get(basePath)!;
      imagesRef.current = cached;
      setLoaded(true);
      if (window.scrollY > 10) {
        setPhase("interactive");
        currentFrameRef.current = Math.round(scrollFrameIndex.get());
        renderFrame(currentFrameRef.current);
      } else {
        renderFrame(0);
      }
      return;
    }

    const loadedImgs: HTMLImageElement[] = new Array(totalFrames);

    // 1-bosqich: Dastlabki kadr (Frame 1) darhol ko'rsatiladi
    const firstImg = new Image();
    firstImg.src = `${basePath}/frame_001.jpg`;
    firstImg.onload = () => {
      if (!isMounted) return;
      loadedImgs[0] = firstImg;
      imagesRef.current = loadedImgs;
      renderFrame(0);
      setLoaded(true);
    };

    // 2-bosqich: Dastlabki intro animatsiyasi uchun zarur kadrlar (1..interactiveStartFrame)
    // Yuqori ustuvorlikda yuklanadi va animatsiya darhol boshlanadi
    const priorityPromises = [];
    for (let i = 1; i <= interactiveStartFrame; i++) {
      priorityPromises.push(
        new Promise((resolve) => {
          const img = new Image();
          const frameNum = String(i).padStart(3, "0");
          img.src = `${basePath}/frame_${frameNum}.jpg`;
          img.onload = () => {
            loadedImgs[i - 1] = img;
            resolve(null);
          };
          img.onerror = () => resolve(null);
        })
      );
    }

    Promise.all(priorityPromises).then(() => {
      if (!isMounted) return;
      imagesRef.current = loadedImgs;
      setLoaded(true);

      // Agar foydalanuvchi sahifani yangilagan bo'lsa va pastda bo'lsa
      if (window.scrollY > 10) {
        setPhase("interactive");
        currentFrameRef.current = Math.round(scrollFrameIndex.get());
        renderFrame(currentFrameRef.current);
      } else {
        renderFrame(0);
      }

      // 3-bosqich: Qolgan kadrlar (interactiveStartFrame+1 .. totalFrames) fonda parallel yuklanadi
      const secondaryPromises = [];
      for (let i = interactiveStartFrame + 1; i <= totalFrames; i++) {
        secondaryPromises.push(
          new Promise((resolve) => {
            const img = new Image();
            const frameNum = String(i).padStart(3, "0");
            img.src = `${basePath}/frame_${frameNum}.jpg`;
            img.onload = () => {
              loadedImgs[i - 1] = img;
              resolve(null);
            };
            img.onerror = () => resolve(null);
          })
        );
      }

      Promise.all(secondaryPromises).then(() => {
        if (!isMounted) return;
        imagesRef.current = loadedImgs;
        globalFrameCache.set(basePath, loadedImgs);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [renderFrame, scrollFrameIndex, interactiveStartFrame, totalFrames]);

  // Scrollni qulflash va Auto-playni boshqarish (oldinga va orqaga)
  useEffect(() => {
    // "interactive" holatida hech qanday non-passive listener bo'lmasligi shart!
    // Bu butun sayt bo'ylab 120Hz/60Hz silliq aylanishini kafolatlaydi.
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

  // Auto-play videosi (oldinga va orqaga) oldingi original 84 fps tezlikda
  useEffect(() => {
    if (phase === "playing-forward" || phase === "playing-backward") {
      let lastTime = performance.now();
      const fps = 84; // Oldingi original video tezligi
      const interval = 1000 / fps;
      let animationFrameId: number;

      const play = (currentTime: number) => {
        if (phase === "playing-forward" && currentFrameRef.current >= interactiveStartFrame) {
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
              interactiveStartFrame,
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
  }, [phase, renderFrame, interactiveStartFrame]);

  // Auto-play tugagandan so'ng, scroll orqali qolgan kadrlarni boshqarish
  useEffect(() => {
    if (phase === "interactive") {
      const handleRender = () => {
        const idx = Math.min(
          totalFrames - 1,
          Math.max(interactiveStartFrame, Math.round(scrollFrameIndex.get()))
        );
        currentFrameRef.current = idx;
        renderFrame(idx);
      };

      const unsubscribe = scrollFrameIndex.on("change", handleRender);
      window.addEventListener("resize", handleRender);

      // Scroll bo'yicha darhol joylashuvni yangilash
      handleRender();

      return () => {
        unsubscribe();
        window.removeEventListener("resize", handleRender);
      };
    }
  }, [phase, scrollFrameIndex, renderFrame, totalFrames, interactiveStartFrame]);

  // Lenis smooth scrollni birinchi video/frame animatsiyalari vaqtida to'xtatish,
  // faqat interactive bosqichga o'tgach darhol faollashtirish
  useEffect(() => {
    const checkAndToggleLenis = () => {
      const lenis = (window as any).lenis;
      if (!lenis) return;

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
  }, [phase]);

  const { t } = useLanguage();

  return (
    <div
      ref={containerRef}
      data-lenis-prevent={phase !== "interactive" ? "" : undefined}
      className="h-[250vh] relative bg-black"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin" />
              <p className="text-white tracking-wide text-sm font-semibold">
                {t("loading")}
              </p>
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
