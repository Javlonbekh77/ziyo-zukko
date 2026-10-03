"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useTransform } from "framer-motion";

type Phase = "start" | "playing-forward" | "interactive" | "playing-backward";

export default function KeyboardScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const totalFrames = 192;

  const [phase, setPhase] = useState<Phase>("start");
  const currentFrameRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Qolgan 400vh scrollni 100-kadrdan oxirigacha (191) xaritalash
  const scrollFrameIndex = useTransform(scrollYProgress, [0, 1], [100, totalFrames - 1]);

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const img = imagesRef.current[index];
    if (!img) return;

    const dpi = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas.width !== width * dpi || canvas.height !== height * dpi) {
      canvas.width = width * dpi;
      canvas.height = height * dpi;
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
    let isMounted = true;
    const loadedImgs: HTMLImageElement[] = new Array(totalFrames);

    // 1. Load initial frame immediately
    const firstImg = new Image();
    firstImg.src = "/frames/frame_001.jpg";
    firstImg.onload = () => {
      if (!isMounted) return;
      loadedImgs[0] = firstImg;
      imagesRef.current = loadedImgs;
      renderFrame(0);
      setLoaded(true);
    };

    // 2. Load all other frames in parallel
    const promises = [];
    for (let i = 1; i <= totalFrames; i++) {
      const p = new Promise((resolve) => {
        const img = new Image();
        const frameNum = String(i).padStart(3, "0");
        img.src = `/frames/frame_${frameNum}.jpg`;
        img.onload = () => {
          loadedImgs[i - 1] = img;
          resolve(null);
        };
        img.onerror = () => {
          resolve(null);
        };
      });
      promises.push(p);
    }

    Promise.all(promises).then(() => {
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
    });

    return () => {
      isMounted = false;
    };
  }, [renderFrame, scrollFrameIndex]);

  // Scrollni qulflash va Auto-playni boshqarish (oldinga va orqaga)
  useEffect(() => {
    let touchStartY = 0;

    const handleScrollAttempt = (e: Event) => {
      let isScrollingUp = false;
      let isScrollingDown = false;

      if (e.type === "wheel") {
        const wheelEvent = e as WheelEvent;
        isScrollingUp = wheelEvent.deltaY < 0;
        isScrollingDown = wheelEvent.deltaY > 0;
      } else if (e.type === "touchstart") {
        const touchEvent = e as TouchEvent;
        touchStartY = touchEvent.touches[0].clientY;
      } else if (e.type === "touchmove") {
        const touchEvent = e as TouchEvent;
        const currentY = touchEvent.touches[0].clientY;
        isScrollingUp = currentY > touchStartY;
        isScrollingDown = currentY < touchStartY;
      }

      if (phase === "start") {
        // Agar sahifa eng tepada bo'lmasa, demak allaqachon scroll qilingan
        if (window.scrollY > 10) {
          setPhase("interactive");
          return;
        }

        if (isScrollingDown) {
          e.preventDefault();
          setPhase("playing-forward");
        } else {
          // Boshqa yo'nalishga ruxsat berish yoki lock qilish
          e.preventDefault();
        }
      } else if (phase === "interactive") {
        if (window.scrollY <= 0 && isScrollingUp) {
          e.preventDefault();
          setPhase("playing-backward");
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

  // Auto-play videosi (oldinga va orqaga) tezlashtirilgan 60 fps
  useEffect(() => {
    if (phase === "playing-forward" || phase === "playing-backward") {
      let lastTime = performance.now();
      const fps = 84; // Tezlashtirilgan video tezligi (40% ga oshirilgan)
      const interval = 1000 / fps;
      let animationFrameId: number;

      const play = (currentTime: number) => {
        if (phase === "playing-forward" && currentFrameRef.current >= 100) {
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
            currentFrameRef.current++;
          } else {
            currentFrameRef.current--;
          }
          renderFrame(currentFrameRef.current);
          lastTime = currentTime - (deltaTime % interval);
        }
        animationFrameId = requestAnimationFrame(play);
      };

      animationFrameId = requestAnimationFrame(play);

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [phase, renderFrame]);

  // Auto-play tugagandan so'ng, scroll orqali qolgan kadrlarni (100 - 191) boshqarish
  useEffect(() => {
    if (phase === "interactive") {
      const handleRender = () => {
        const idx = Math.min(
          totalFrames - 1,
          Math.max(100, Math.round(scrollFrameIndex.get()))
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
  }, [phase, scrollFrameIndex, renderFrame]);

  return (
    <div ref={containerRef} className="h-[250vh] relative bg-black">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin" />
              <p className="text-[#071a33] tracking-wide text-sm font-semibold">
                Yuklanmoqda...
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
