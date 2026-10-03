"use client";

import React, { useState, useRef } from "react";

interface TesseractBoxProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  highlightText?: string;
  darkTheme?: boolean;
  className?: string;
}

export default function TesseractBox({
  children,
  title,
  subtitle,
  badgeText,
  highlightText,
  darkTheme = true,
  className = "",
}: TesseractBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={boxRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`relative w-full rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden transition-all duration-500 group ${
        darkTheme
          ? "bg-[#060b14]/90 text-white border border-[#ff6b00]/25 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
          : "bg-white text-[#06113c] border border-[#ff6b00]/30 shadow-xl"
      } ${
        isHovered
          ? "border-[#ff6b00]/70 shadow-[0_15px_50px_rgba(255,107,0,0.25)] -translate-y-1"
          : ""
      } ${className}`}
    >
      {/* Interactive Radial Spotlight following mouse cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 107, 0, 0.12), transparent 80%)`,
        }}
      />

      {/* 1. Top Curved Arch line SVG stroke (Tesseract signature arch) */}
      <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none overflow-hidden z-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 800 30"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="tesseractBoxGlowHover" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b00" stopOpacity="0" />
              <stop offset="30%" stopColor="#ff6b00" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffaa00" stopOpacity="1" />
              <stop offset="70%" stopColor="#ff6b00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
            </linearGradient>

            <filter id="boxNeonHoverGlow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Arched Top Border Base Stroke */}
          <path
            d="M 5 22 Q 400 4 795 22"
            stroke={isHovered ? "#ff6b00" : "#ff6b00"}
            strokeWidth={isHovered ? "2.5" : "1.8"}
            strokeOpacity={isHovered ? "1" : "0.5"}
            fill="none"
            filter={isHovered ? "url(#boxNeonHoverGlow)" : undefined}
            className="transition-all duration-300"
          />

          {/* Animated beam travelling across top arch */}
          <path
            d="M 5 22 Q 400 4 795 22"
            stroke="url(#tesseractBoxGlowHover)"
            strokeWidth={isHovered ? "4" : "2.5"}
            fill="none"
            strokeDasharray={isHovered ? "250 550" : "150 650"}
            className={isHovered ? "animate-tesseractBeamFast" : "animate-tesseractBeam"}
            filter="url(#boxNeonHoverGlow)"
          />
        </svg>
      </div>

      {/* 2. Traveling Border Beam around entire box edges on Hover */}
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none overflow-hidden p-[1px] z-10">
        <div
          className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent ${
            isHovered ? "animate-beamTravelFast opacity-100" : "animate-beamTravel opacity-50"
          }`}
        />
        <div
          className={`absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffaa00] to-transparent ${
            isHovered ? "animate-beamTravelReverseFast opacity-100" : "animate-beamTravelReverse opacity-40"
          }`}
        />
      </div>

      {/* 3. Corner Brackets (HUD style corner ticks ┌ ┐ └ ┘) - react to hover */}
      <div
        className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 transition-all duration-300 z-20 pointer-events-none ${
          isHovered
            ? "border-[#ff6b00] scale-125 shadow-[0_0_12px_#ff6b00]"
            : "border-[#ff6b00]/60 scale-100"
        }`}
      />
      <div
        className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 transition-all duration-300 z-20 pointer-events-none ${
          isHovered
            ? "border-[#ff6b00] scale-125 shadow-[0_0_12px_#ff6b00]"
            : "border-[#ff6b00]/60 scale-100"
        }`}
      />
      <div
        className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 transition-all duration-300 z-20 pointer-events-none ${
          isHovered
            ? "border-[#ff6b00] scale-125 shadow-[0_0_12px_#ff6b00]"
            : "border-[#ff6b00]/60 scale-100"
        }`}
      />
      <div
        className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 transition-all duration-300 z-20 pointer-events-none ${
          isHovered
            ? "border-[#ff6b00] scale-125 shadow-[0_0_12px_#ff6b00]"
            : "border-[#ff6b00]/60 scale-100"
        }`}
      />

      {/* 4. Background Tech Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(#ff6b00 1px, transparent 1px)`,
          backgroundSize: `24px 24px`,
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-20 flex flex-col gap-4">
        {(title || highlightText || badgeText) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            {title && (
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 ${
                    isHovered
                      ? "bg-[#ffaa00] shadow-[0_0_14px_#ffaa00] scale-125"
                      : "bg-[#ff6b00] shadow-[0_0_8px_#ff6b00]"
                  }`}
                />
                {title}
              </h3>
            )}

            {/* Tesseract style highlight pill border (exact orange outline pill in user screenshot) */}
            {highlightText && (
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-lg border text-sm font-semibold transition-all duration-300 ${
                  isHovered
                    ? "border-[#ff6b00] bg-[#ff6b00] text-white shadow-[0_0_20px_rgba(255,107,0,0.8)] scale-105"
                    : "border-[#ff6b00] bg-[#ff6b00]/10 text-[#ff6b00] shadow-[0_0_15px_rgba(255,107,0,0.2)]"
                }`}
              >
                {highlightText}
              </span>
            )}

            {badgeText && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-300">
                {badgeText}
              </span>
            )}
          </div>
        )}

        {subtitle && (
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
