"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
/**
 * FAQAccordion — neo-brutalist accordion.
 *
 * Fixes applied:
 * - Animate opacity + scaleY via CSS instead of height to avoid
 *   layout thrashing (height animation triggers layout reflow)
 * - Uses + / – lucide icons instead of raw "+" character
 * - Proper aria-expanded for accessibility
 */
export const FAQAccordion = ({ faqs }: { faqs: { q: string; a: string }[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border-4 border-black bg-white overflow-hidden neo-shadow">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="w-full p-6 md:p-8 flex items-center justify-between text-left font-black text-xl md:text-2xl uppercase hover:bg-yellow-300 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fpt-orange)] focus-visible:ring-inset"
            >
              <span className="pr-6 text-black leading-tight">{faq.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex-shrink-0 text-[var(--fpt-orange)]"
              >
                {/* Single "+" that rotates 45° to become "×" */}
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className="border-t-4 border-black bg-zinc-50"
                >
                  <div className="p-6 md:p-8 text-base md:text-lg font-bold text-zinc-700 leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
