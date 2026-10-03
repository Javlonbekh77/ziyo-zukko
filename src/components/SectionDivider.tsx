"use client";

import React, { useState, useRef } from "react";

interface SectionDividerProps {
  darkTheme?: boolean;
  label?: string;
  className?: string;
}

export default function SectionDivider({
  darkTheme = false,
  label,
  className = "",
}: SectionDividerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mouseX, setMouseX] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = (x / rect.width) * 100;
    setMouseX(percent);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`relative w-full overflow-hidden py-6 md:py-8 flex flex-col items-center justify-center group cursor-pointer transition-colors duration-500 ${
        darkTheme ? "bg-[#071325]" : "bg-[#f8fafc]"
      } ${className}`}
    >
      <div className="w-full max-w-6xl px-4 md:px-8 relative">
        {/* Tesseract top curved arch line */}
        <div className="relative w-full h-8 md:h-10 flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 1000 40"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient
                id={`tesseractGlowHover-${darkTheme ? "dark" : "light"}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ff6b00" stopOpacity="0" />
                <stop offset="30%" stopColor="#ff6b00" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#ffaa00" stopOpacity="1" />
                <stop offset="70%" stopColor="#ff6b00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
              </linearGradient>

              <filter id="neonHoverGlow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base background arch line */}
            <path
              d="M 10 32 Q 500 2 990 32"
              stroke={
                isHovered
                  ? "rgba(255, 107, 0, 0.4)"
                  : darkTheme
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)"
              }
              strokeWidth={isHovered ? "2" : "1.5"}
              fill="none"
              className="transition-all duration-300"
            />

            {/* Glowing Orange Arch line (Ignites on Mouse Hover) */}
            <path
              d="M 10 32 Q 500 2 990 32"
              stroke="#ff6b00"
              strokeWidth={isHovered ? "3" : "1.5"}
              strokeOpacity={isHovered ? "0.9" : darkTheme ? "0.3" : "0.2"}
              fill="none"
              filter={isHovered ? "url(#neonHoverGlow)" : undefined}
              className="transition-all duration-300"
            />

            {/* Animated beam travelling stroke - speeds up & intensifies when cursor hovers */}
            <path
              d="M 10 32 Q 500 2 990 32"
              stroke={`url(#tesseractGlowHover-${darkTheme ? "dark" : "light"})`}
              strokeWidth={isHovered ? "4" : "2"}
              fill="none"
              strokeDasharray={isHovered ? "300 700" : "150 850"}
              className={`${
                isHovered ? "animate-tesseractBeamFast" : "animate-tesseractBeam"
              }`}
              filter="url(#neonHoverGlow)"
            />
          </svg>

          {/* HUD Corner Brackets (┌ ┐ └ ┘) - react to mouse hover */}
          <div
            className={`absolute top-1 left-2 md:left-4 flex gap-1 items-start pointer-events-none transition-all duration-300 ${
              isHovered ? "scale-125" : "scale-100"
            }`}
          >
            <div
              className={`w-3 h-3 border-t-2 border-l-2 transition-all duration-300 ${
                isHovered
                  ? "border-[#ff6b00] shadow-[0_0_12px_#ff6b00]"
                  : "border-[#ff6b00]/50"
              }`}
            />
          </div>
          <div
            className={`absolute top-1 right-2 md:right-4 flex gap-1 items-start pointer-events-none transition-all duration-300 ${
              isHovered ? "scale-125" : "scale-100"
            }`}
          >
            <div
              className={`w-3 h-3 border-t-2 border-r-2 transition-all duration-300 ${
                isHovered
                  ? "border-[#ff6b00] shadow-[0_0_12px_#ff6b00]"
                  : "border-[#ff6b00]/50"
              }`}
            />
          </div>
          <div
            className={`absolute bottom-1 left-2 md:left-4 flex gap-1 items-end pointer-events-none transition-all duration-300 ${
              isHovered ? "scale-125" : "scale-100"
            }`}
          >
            <div
              className={`w-3 h-3 border-b-2 border-l-2 transition-all duration-300 ${
                isHovered
                  ? "border-[#ff6b00] shadow-[0_0_12px_#ff6b00]"
                  : "border-[#ff6b00]/50"
              }`}
            />
          </div>
          <div
            className={`absolute bottom-1 right-2 md:right-4 flex gap-1 items-end pointer-events-none transition-all duration-300 ${
              isHovered ? "scale-125" : "scale-100"
            }`}
          >
            <div
              className={`w-3 h-3 border-b-2 border-r-2 transition-all duration-300 ${
                isHovered
                  ? "border-[#ff6b00] shadow-[0_0_12px_#ff6b00]"
                  : "border-[#ff6b00]/50"
              }`}
            />
          </div>
        </div>

        {/* Horizontal Divider Line with Mouse Cursor Follower Spotlight & Laser Beam */}
        <div className="relative w-full h-[3px] mt-1 flex items-center justify-center">
          {/* Base track line */}
          <div
            className={`absolute inset-0 w-full h-full rounded-full transition-colors duration-300 ${
              isHovered
                ? "bg-[#ff6b00]/30"
                : darkTheme
                ? "bg-white/10"
                : "bg-black/10"
            }`}
          />

          {/* Mouse Cursor Follower Spotlight (Tracks cursor X position in real-time) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-40 rounded-full bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent pointer-events-none transition-opacity duration-300 blur-sm"
            style={{
              left: `calc(${mouseX}% - 80px)`,
              opacity: isHovered ? 1 : 0,
            }}
          />

          {/* Animated beam translating left to right */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <div
              className={`w-full h-full bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent ${
                isHovered ? "animate-beamTravelFast opacity-100" : "animate-beamTravel opacity-60"
              }`}
            />
          </div>

          {/* Reverse subtle beam for depth */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <div
              className={`w-full h-full bg-gradient-to-r from-transparent via-[#ffaa00] to-transparent ${
                isHovered ? "animate-beamTravelReverseFast opacity-90" : "animate-beamTravelReverse opacity-40"
              }`}
            />
          </div>

          {/* Center Badge or Interactive Diamond Node */}
          {label ? (
            <div
              className={`relative z-10 px-4 py-1.5 rounded-full text-[11px] md:text-xs font-bold tracking-widest uppercase border transition-all duration-300 backdrop-blur-md flex items-center gap-2 ${
                isHovered
                  ? "border-[#ff6b00] bg-[#ff6b00] text-white shadow-[0_0_20px_rgba(255,107,0,0.8)] scale-105"
                  : "border-[#ff6b00]/40 bg-[#071325] text-[#ff6b00] shadow-[0_0_12px_rgba(255,107,0,0.3)]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isHovered ? "bg-white animate-ping" : "bg-[#ff6b00]"
                }`}
              />
              <span>{label}</span>
            </div>
          ) : (
            <div
              className={`relative z-10 w-4 h-4 rotate-45 border transition-all duration-300 bg-[#071325] flex items-center justify-center ${
                isHovered
                  ? "border-[#ff6b00] scale-125 shadow-[0_0_14px_rgba(255,107,0,0.9)]"
                  : "border-[#ff6b00]/50 shadow-[0_0_8px_rgba(255,107,0,0.4)]"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isHovered ? "bg-[#ffaa00]" : "bg-[#ff6b00]"
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
