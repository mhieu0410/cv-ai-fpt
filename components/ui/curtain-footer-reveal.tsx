"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function CurtainFooterReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  // Scale: 0.85 → 1 as section scrolls into view
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden flex items-center justify-center bg-[var(--fpt-orange)]"
      style={{ height: "60vh" }}
    >
      {/* Logo scales up as you scroll into it */}
      <motion.div
        className="relative z-20 w-full h-full"
        style={{ scale }}
      >
        {children}
      </motion.div>
    </div>
  );
}
