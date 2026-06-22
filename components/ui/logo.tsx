"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";

interface LogoProps {
  className?: string;
  isFooter?: boolean;
  collapsed?: boolean;
  theme?: "light" | "dark";
}

const GlitchLetter = ({ char }: { char: string }) => {
  const [isLetterHovered, setIsLetterHovered] = useState(false);
  return (
    <span
      className="relative inline-block cursor-crosshair"
      onMouseEnter={() => setIsLetterHovered(true)}
      onMouseLeave={() => setIsLetterHovered(false)}
    >
      {/* Invisible spacer keeps layout stable */}
      <span className="invisible">{char}</span>

      {/* Overlay layer */}
      <span className="absolute inset-0 flex justify-center items-center">
        {!isLetterHovered ? (
          <span className="text-zinc-950">{char}</span>
        ) : (
          <UltimateTraeGlitch colorClass="text-zinc-950">
            {char}
          </UltimateTraeGlitch>
        )}
      </span>
    </span>
  );
};

export const Logo = ({ className = "", isFooter = false, collapsed = false, theme = "light" }: LogoProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [autoGlitch, setAutoGlitch] = useState(false);
  const flipContainer = useRef<HTMLDivElement>(null);

  // Tự động kích hoạt GlitchEffect mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoGlitch(true);
      setTimeout(() => setAutoGlitch(false), 400); // Glitch chạy 400ms
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeGlitch = isHovered || autoGlitch;

  // Sử dụng useEffect kết hợp GSAP (bỏ qua useGSAP hook để tương thích 100% với mọi phiên bản React)
  useEffect(() => {
    if (!isFooter && flipContainer.current) {
      gsap.to(flipContainer.current, {
        rotateX: collapsed ? -180 : 0,
        duration: 0.6,
        ease: "power3.inOut",
        overwrite: true
      });
    }
  }, [collapsed, isFooter]);

  const mainColor = theme === "dark" ? "text-white" : "text-black";
  const aiColor = isFooter ? "text-black" : "text-[var(--fpt-orange)]";

  // FOOTER LOGO: Per-Letter Ultimate Trae Glitch Effect (No Masks, No Borders)
  if (isFooter) {

    return (
      <div
        className={`relative flex items-center justify-center font-black uppercase tracking-tighter z-10 w-full h-full select-none overflow-hidden ${className}`}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center items-center w-full h-full text-[37vw] leading-[0.8]"
        >
          <div className="flex items-center justify-center w-full">
            <GlitchLetter char="C" />
            <GlitchLetter char="V" />
            <span className="font-mono tracking-tight ml-[1vw] flex">
              <GlitchLetter char="A" />
              <GlitchLetter char="I" />
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // NAVBAR LOGO: GSAP 3D Flipping Logo
  return (
    <Link
      href="/"
      className={`relative select-none z-50 hover:scale-105 transition-transform block w-[100px] h-[36px] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: 1200 }} 
    >
      <div
        ref={flipContainer}
        style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
        className="absolute inset-0 w-full h-full"
      >
        {/* FRONT: WORDMARK */}
        <div 
          style={{ backfaceVisibility: "hidden" }} 
          className="absolute inset-0 flex items-center justify-start font-black uppercase tracking-tighter text-2xl"
        >
          <span className={mainColor}>CV</span>
          <span className="relative inline-flex ml-1">
            <span className={`font-mono tracking-tight ${aiColor} ${activeGlitch && !collapsed ? "opacity-0" : "opacity-100"}`}>
              AI
            </span>
            {activeGlitch && !collapsed && <GlitchEffect text="AI" isFooter={false} strokeStyle={{}} />}
          </span>
        </div>

        {/* BACK: ABSTRACT SYMBOLS */}
        <div 
          style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }} 
          className="absolute inset-0 flex items-center justify-start"
        >
          <GeometrySymbol />
        </div>
      </div>
    </Link>
  );
};

// ── SYMBOL 1: MINIMALIST GEOMETRY ──
const GeometrySymbol = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" stroke="black" strokeWidth="3" fill="#C4A1FF" />
    <rect x="12" y="12" width="16" height="16" stroke="black" strokeWidth="3" fill="var(--fpt-orange)" />
  </svg>
);

// ── GLITCH EFFECT CŨ (Cho Header) ──
const GlitchEffect = ({ text, strokeStyle, isFooter }: { text: string, strokeStyle?: React.CSSProperties, isFooter?: boolean }) => {
  const blendMode1 = isFooter ? "mix-blend-screen text-[#FF0055]" : "mix-blend-multiply text-[#FF0055]";
  const blendMode2 = isFooter ? "mix-blend-screen text-[#00FFFF]" : "mix-blend-multiply text-[#00FFFF]";
  const baseColor = "text-[var(--fpt-orange)]";

  return (
    <span className="absolute inset-0 block font-mono tracking-tight" style={strokeStyle}>
      <motion.span
        animate={{ 
          x: [-3, 4, -2, 3, -4], 
          y: [1, -2, 2, -1, 0],
          clipPath: [
            "inset(20% 0 80% 0)",
            "inset(60% 0 10% 0)",
            "inset(10% 0 50% 0)",
            "inset(80% 0 5% 0)",
            "inset(0% 0 0% 0)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
        className={`absolute inset-0 z-20 ${blendMode1}`}
      >
        {text}
      </motion.span>
      
      <motion.span
        animate={{ 
          x: [3, -4, 2, -3, 4], 
          y: [-1, 2, -2, 1, 0],
          clipPath: [
            "inset(10% 0 60% 0)",
            "inset(80% 0 5% 0)",
            "inset(20% 0 30% 0)",
            "inset(50% 0 20% 0)",
            "inset(0% 0 0% 0)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
        className={`absolute inset-0 z-10 ${blendMode2}`}
      >
        {text}
      </motion.span>

      <motion.span 
        animate={{ x: [-1, 1, 0], opacity: [1, 0.8, 1] }}
        transition={{ repeat: Infinity, duration: 0.08, ease: "linear" }}
        className={`absolute inset-0 z-30 ${baseColor}`}
      >
        {text}
      </motion.span>
    </span>
  );
};

// ── ULTIMATE TRAE GLITCH (Cho Footer) ──
// Tạo ra hàng tá lát cắt cực mỏng và giật ngẫu nhiên liên tục để tái hiện độ "ảo diệu" của TRAE
const generateGlitchSlices = () => {
  return Array.from({ length: 20 }).map((_, i) => {
    const top = (i * 100) / 20;
    const bottom = 100 - ((i + 1) * 100) / 20;
    // Chaotic random values
    const xValues = [
      0, 
      (Math.random() - 0.5) * 150, 
      (Math.random() - 0.5) * 120, 
      (Math.random() - 0.5) * 90, 
      0
    ];
    const duration = 0.05 + Math.random() * 0.1;
    const delay = Math.random() * 0.05;
    return { top, bottom, xValues, duration, delay };
  });
};

const UltimateTraeGlitch = ({ children, colorClass = "" }: { children: React.ReactNode, colorClass?: string }) => {
  const [slices] = useState(generateGlitchSlices);

  return (
    <span className="absolute inset-0 flex justify-center items-center w-full">
      {/* Base Layer */}
      <motion.span 
        className={`absolute inset-0 z-10 flex justify-center items-center ${colorClass}`}
        animate={{ opacity: [1, 0.5, 0.9, 1], x: [-6, 6, -3, 0] }}
        transition={{ repeat: Infinity, duration: 0.08, ease: "linear" }}
      >
        {children}
      </motion.span>

      {/* Slices */}
      {slices.map((slice, idx) => (
        <motion.span
          key={idx}
          className={`absolute inset-0 z-20 flex justify-center items-center ${colorClass}`}
          style={{ clipPath: `inset(${slice.top}% 0 ${slice.bottom}% 0)` }}
          animate={{ x: slice.xValues }}
          transition={{ 
            repeat: Infinity, 
            duration: slice.duration,
            ease: "linear",
            delay: slice.delay 
          }}
        >
          {children}
        </motion.span>
      ))}
    </span>
  );
};
