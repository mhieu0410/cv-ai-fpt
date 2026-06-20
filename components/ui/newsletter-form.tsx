"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "./magnetic-button";

type FormState = "idle" | "loading" | "success" | "error";

/**
 * NewsletterForm — with full interaction states.
 *
 * Fixes applied from ui-review:
 * - Proper <label> for accessibility
 * - Loading, success, and error states implemented
 * - No dead UI
 */
export const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ.");
      setFormState("error");
      return;
    }
    setFormState("loading");
    setErrorMsg("");

    // Simulate API call — replace with real endpoint
    await new Promise((r) => setTimeout(r, 1200));
    setFormState("success");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        Địa chỉ email của bạn
      </label>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formState === "error") setFormState("idle");
            }}
            placeholder="Nhập email của bạn..."
            disabled={formState === "success"}
            className={`w-full bg-zinc-900 border-4 ${
              formState === "error" ? "border-red-500" : "border-zinc-700 focus:border-[var(--fpt-orange)]"
            } p-4 text-lg font-bold text-white outline-none placeholder:text-zinc-500 transition-colors disabled:opacity-50`}
            aria-invalid={formState === "error"}
            aria-describedby={formState === "error" ? "newsletter-error" : undefined}
          />
          <AnimatePresence>
            {formState === "error" && (
              <motion.p
                id="newsletter-error"
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm font-bold mt-2"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <MagneticButton>
          <button
            type="submit"
            disabled={formState === "loading" || formState === "success"}
            className="w-full sm:w-auto px-8 py-4 bg-[var(--fpt-orange)] border-4 border-[var(--fpt-orange)] hover:border-white text-white font-black uppercase text-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[140px]"
          >
            <AnimatePresence mode="wait">
              {formState === "loading" && (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="animate-spin"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Đang gửi...
                </motion.span>
              )}
              {formState === "success" && (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Đã gửi!
                </motion.span>
              )}
              {(formState === "idle" || formState === "error") && (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Gửi Ngay
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </MagneticButton>
      </div>

      <AnimatePresence>
        {formState === "success" && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-emerald-400 font-bold mt-4 text-sm"
          >
            Cảm ơn! Chúng tôi sẽ gửi tin mới nhất đến email của bạn.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
};
