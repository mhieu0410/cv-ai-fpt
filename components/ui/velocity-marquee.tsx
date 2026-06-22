"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function VelocityMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marquee1Ref = useRef<HTMLDivElement>(null);
  const marquee2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!marquee1Ref.current || !marquee2Ref.current) return;

    // First Marquee - Moving Left
    const tl1 = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    tl1.to(marquee1Ref.current, { xPercent: -50, duration: 20 });

    // Second Marquee - Moving Right
    const tl2 = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    // Start at -50% and move to 0% to give continuous loop effect
    gsap.set(marquee2Ref.current, { xPercent: -50 });
    tl2.to(marquee2Ref.current, { xPercent: 0, duration: 18 });

    // Scroll Velocity Tracker
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // self.getVelocity() returns pixels per second. 
        // We divide by a factor to get a multiplier.
        let velocity = self.getVelocity() / 300;
        
        // Clamp velocity to avoid insane speeds
        velocity = Math.max(Math.min(velocity, 5), -5);

        // Base timeScale is 1. We add the velocity to it.
        // If scrolling down, velocity is positive. If scrolling up, it's negative.
        // We want direction to reverse if scrolling up, so timeScale goes negative.
        const targetTimeScale = 1 + velocity;
        
        // Animate the timeScale smoothly
        gsap.to([tl1, tl2], {
          timeScale: targetTimeScale,
          duration: 0.5,
          ease: "power2.out",
          overwrite: true,
          onComplete: () => {
            // Return back to normal speed slowly
            gsap.to([tl1, tl2], {
              timeScale: Math.sign(targetTimeScale) * 1, // keep the direction but speed 1
              duration: 1,
              ease: "power2.out"
            });
          }
        });
      }
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="border-y border-zinc-200 bg-zinc-50 overflow-hidden relative">
      <div className="py-4 border-b border-zinc-200">
        <div ref={marquee1Ref} className="flex whitespace-nowrap w-[200%]">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-2xl font-black text-zinc-800 uppercase mx-6 flex items-center gap-5 tracking-tight shrink-0">
              TIN DÙNG BỞI 500+ SINH VIÊN FPT
              <span className="text-[var(--fpt-orange)] text-3xl leading-none">•</span>
            </span>
          ))}
        </div>
      </div>
      <div className="py-4">
        <div ref={marquee2Ref} className="flex whitespace-nowrap w-[200%]">
          {[
            'FPT Software', 'VNG Corporation', 'MoMo', 'Tiki', 'VNPT',
            'Viettel', 'Shopee VN', 'Zalo', 'KMS Technology', 'NashTech',
            'FPT Software', 'VNG Corporation', 'MoMo', 'Tiki', 'VNPT',
            'Viettel', 'Shopee VN', 'Zalo', 'KMS Technology', 'NashTech',
          ].map((co, i) => (
            <span key={i} className="text-sm font-black text-zinc-500 uppercase mx-6 tracking-widest flex items-center gap-5 shrink-0">
              <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true"><rect width="6" height="6"/></svg>
              {co}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
