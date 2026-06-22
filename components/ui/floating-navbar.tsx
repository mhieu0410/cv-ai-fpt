"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring,
} from "framer-motion";
import { MagneticButton } from "./magnetic-button";
import { Logo } from "./logo";

/**
 * FloatingNavbar — White pill + Curtain behaviour.
 *
 * Curtain UX:
 *  - Navbar is visible on page load (white pill, native look)
 *  - As user scrolls into the dark hero journey → slides UP & fades out
 *    (immersive; white navbar would clash with dark background anyway)
 *  - When user exits hero into white content → slides back DOWN smoothly
 *
 * heroEndPx is calculated from the DOM element with id="hero-scroll-section"
 * so it works correctly regardless of ticker/spacer heights above.
 */
export const FloatingNavbar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ── Detect hero section end from DOM ────────────────────────────
  const [heroEndPx, setHeroEndPx] = useState(999999);

  useEffect(() => {
    const calc = () => {
      const el = document.getElementById("hero-scroll-section");
      if (el) {
        // offsetTop = distance from document top, offsetHeight = element height
        setHeroEndPx(el.offsetTop + el.offsetHeight);
      } else {
        // Fallback: hero is 800vh, ticker ~44px, spacer 80px
        setHeroEndPx(window.innerHeight * 800 + 130);
      }
    };
    calc();
    // Retry after hydration settles
    const t = setTimeout(calc, 400);
    window.addEventListener("resize", calc, { passive: true });
    return () => { window.removeEventListener("resize", calc); clearTimeout(t); };
  }, []);

  // ── Curtain animation ────────────────────────────────────────────
  const { scrollY } = useScroll();
  const NAV_H = 90; // px — pill height + pt-4

  //  0       → visible
  //  140     → start hiding (ticker has scrolled away)
  //  260     → fully hidden
  //  heroEnd-400 → start reappearing
  //  heroEnd+80  → fully visible
  const rawY = useTransform(
    scrollY,
    [0, 44, 140, 260, Math.max(heroEndPx - 400, 261), heroEndPx + 80],
    [40, 0,   0, -NAV_H, -NAV_H, 0]
  );
  const rawOpacity = useTransform(
    scrollY,
    [0, 140, 240, Math.max(heroEndPx - 300, 241), heroEndPx + 60],
    [1,   1,   0,   0, 1]
  );
  const navY      = useSpring(rawY,      { stiffness: 400, damping: 40, mass: 0.5 });
  const navOpacity= useSpring(rawOpacity,{ stiffness: 400, damping: 40, mass: 0.5 });

  // Update scrolled state (only switch to white mode when reappearing at the end of hero)
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > heroEndPx - 300));
    return unsub;
  }, [scrollY, heroEndPx]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = isLoggedIn
    ? [{ label: "Dashboard", href: "/dashboard" }]
    : [{ label: "Đăng nhập", href: "/login" }];

  return (
    <>
      {/* ── Floating Navbar ──────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
        <motion.nav
          style={{ y: navY, opacity: navOpacity, minWidth: "min(640px, 90vw)" }}
          initial={{ y: -NAV_H, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
          className={`pointer-events-auto flex items-center justify-between gap-8 px-6 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? "bg-white/95 backdrop-blur-md shadow-[6px_6px_0px_0px_#000] border-4 border-black"
              : "bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          }`}
        >
          {/* Logo */}
          <Logo collapsed={scrolled} theme={scrolled ? "light" : "dark"} />

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-4">
            {!isLoggedIn && (
              <Link
                href="/login"
                className={`px-4 py-2 text-sm font-black uppercase tracking-widest hover:text-[var(--fpt-orange)] transition-colors border-b-2 border-transparent hover:border-[var(--fpt-orange)] ${
                  scrolled ? "text-black" : "text-white/90"
                }`}
              >
                Đăng nhập
              </Link>
            )}
            <MagneticButton>
              <Link
                href={isLoggedIn ? "/dashboard" : "/signup"}
                className="px-6 py-2.5 bg-[var(--fpt-orange)] border-2 border-black text-white text-sm font-black uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all block rounded-full active:scale-95"
              >
                {isLoggedIn ? "Dashboard" : "Tạo CV Ngay"}
              </Link>
            </MagneticButton>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden flex flex-col gap-1.5 p-2 relative w-8 h-8"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  rotate:  i === 0 && mobileOpen ? 45 : i === 2 && mobileOpen ? -45 : 0,
                  y:       i === 0 && mobileOpen ?  7 : i === 2 && mobileOpen ?  -7 : 0,
                  opacity: i === 1 && mobileOpen ? 0 : 1,
                }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className={`block w-full h-0.5 origin-center absolute ${
                  scrolled ? "bg-black" : "bg-white"
                } ${
                  i === 0 ? "top-2" : i === 1 ? "top-[50%] -translate-y-1/2" : "bottom-2"
                }`}
              />
            ))}
          </button>
        </motion.nav>
      </header>

      {/* ── Mobile Overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ delay: 0.05 * i + 0.1, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-5xl font-black uppercase text-black hover:text-[var(--fpt-orange)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {!isLoggedIn && (
                <motion.div
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="inline-block px-12 py-5 bg-[var(--fpt-orange)] border-4 border-black text-white font-black uppercase text-2xl neo-shadow active:scale-95 transition-transform"
                  >
                    Tạo CV Ngay
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};
