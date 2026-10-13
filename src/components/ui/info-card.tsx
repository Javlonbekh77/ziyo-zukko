"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

export interface GraduateCardProps {
  id?: number | string;
  name: string;
  university: string;
  status?: string;
  image?: string;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  cardBgColor?: string;
}

export const GraduateInfoCard: React.FC<GraduateCardProps> = ({
  name,
  university,
  status = "Grant",
  image = "/talaba_rasm.png",
  borderColor = "#ff6b00",
  borderBgColor = "#dfe4ec",
  borderWidth = 3,
  cardBgColor = "#ffffff",
}) => {
  const [hovered, setHovered] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);

  // Mouse movement for rotating conic-gradient border (prp123.txt specification)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    border.style.setProperty("--rotation", `${angle}rad`);
  };

  const borderGradient = `conic-gradient(from var(--rotation,0deg), ${borderColor} 0deg, ${borderColor} 110deg, ${borderBgColor} 110deg, ${borderBgColor} 360deg)`;

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (borderRef.current) {
          borderRef.current.style.setProperty("--rotation", "0deg");
        }
      }}
      style={{
        border: `${borderWidth}px solid transparent`,
        borderRadius: "1.5rem",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backgroundImage: `linear-gradient(${cardBgColor}, ${cardBgColor}), ${borderGradient}`,
      }}
      className="relative w-full min-h-[240px] sm:min-h-[330px] p-3 sm:p-6 flex flex-col items-center justify-between text-center group cursor-pointer shadow-[0_10px_30px_rgba(7,26,51,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(7,26,51,0.14),0_0_24px_rgba(255,107,0,0.15)] transition-all duration-400 ease-out overflow-hidden select-none"
    >
      {/* Grant Badge with gradient glow and hover micro-interaction */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-gradient-to-r from-[#ff6a00] to-[#ee5100] text-white text-[9px] sm:text-[11px] font-extrabold px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-xl shadow-[0_4px_14px_rgba(255,106,0,0.35)] group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(255,106,0,0.5)] transition-all duration-300">
        {status}
      </div>

      <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full p-[3px] sm:p-[5px] bg-gradient-to-br from-[#0b1727] via-[#071a33] to-[#ff6b00] shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:scale-105 group-hover:shadow-[0_12px_32px_rgba(255,107,0,0.35)] transition-all duration-500 ease-out mt-2 sm:mt-0 shrink-0">
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 sm:border-4 border-white bg-slate-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-top group-hover:scale-110 transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]"
            unoptimized
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="mt-3 sm:mt-5 flex flex-col justify-center flex-1 w-full">
        <p className="text-[9px] sm:text-[11px] font-extrabold text-[#ff6b00] uppercase tracking-wider leading-snug mb-1 sm:mb-2 line-clamp-2">
          {university}
        </p>

        {/* Title / Name with Clip-Path Reveal Effect (prp123.txt prompt specification) */}
        <h3 className="relative inline-block text-xs sm:text-sm md:text-lg font-black text-[#071a33] leading-snug group-hover:text-[#ff6b00] transition-colors duration-300 mx-auto">
          <span className="relative z-10">{name}</span>
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-md z-0 bg-[#ff6b00]/10 transition-all duration-400 ease-[cubic-bezier(.1,.5,.5,1)]"
            style={{
              clipPath: hovered
                ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
                : "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
            }}
          />
        </h3>
      </div>
    </div>
  );
};
