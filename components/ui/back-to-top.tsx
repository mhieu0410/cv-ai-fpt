"use client";

import React from 'react';

export const BackToTopButton = () => {
  return (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="flex items-center gap-2 hover:text-white transition-colors group cursor-pointer"
    >
      Lên đầu trang
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="group-hover:-translate-y-1 transition-transform"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    </button>
  );
};
