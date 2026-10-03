"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

export interface GraduateCardProps {
  id: number;
  name: string;
  university: string;
  status: string;
  image: string;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  cardBgColor?: string;
}

export const GraduateInfoCard: React.FC<GraduateCardProps> = ({
  name,
  university,
  status,
  image,
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
      className="relative w-full min-h-[330px] p-6 flex flex-col items-center justify-between text-center group cursor-pointer shadow-[0_10px_30px_rgba(7,26,51,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(7,26,51,0.14),0_0_24px_rgba(255,107,0,0.15)] transition-all duration-400 ease-out overflow-hidden select-none"
    >
      {/* Grant Badge with gradient glow and hover micro-interaction */}
      <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#ff6a00] to-[#ee5100] text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl shadow-[0_4px_14px_rgba(255,106,0,0.35)] group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(255,106,0,0.5)] transition-all duration-300">
        {status}
      </div>

      {/* Circular Photo Box (chiroqchiim.vercel.app style) */}
      <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-full p-[5px] bg-gradient-to-br from-[#0b1727] via-[#071a33] to-[#ff6b00] shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:scale-105 group-hover:shadow-[0_12px_32px_rgba(255,107,0,0.35)] transition-all duration-500 ease-out mt-2 shrink-0">
        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white bg-slate-100">
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
      <div className="mt-5 flex flex-col justify-center flex-1 w-full">
        <p className="text-[11px] font-extrabold text-[#ff6b00] uppercase tracking-wider leading-snug mb-2 line-clamp-2">
          {university}
        </p>

        {/* Title / Name with Clip-Path Reveal Effect (prp123.txt prompt specification) */}
        <h3 className="relative inline-block text-lg font-black text-[#071a33] leading-snug group-hover:text-[#ff6b00] transition-colors duration-300 mx-auto">
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
