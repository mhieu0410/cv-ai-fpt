---
name: gsap-orchestration
description: "Orchestrate high-performance GSAP animations, ScrollTrigger timelines, and scrolltelling interactions in Next.js 16/React 19."
risk: safe
category: frontend
date_added: "2026-06-20"
author: "Antigravity"
tags: [gsap, scrolltrigger, animation, react, nextjs]
---

# Skill: GSAP & ScrollTrigger Orchestration in Next.js

## When to Use
- Use when implementing complex, scroll-bound animations (e.g. scroll-scrubbing, timeline-controlled page reveals, canvas frame sequencing).
- Use when animating massive DOM structures or running high-performance parallax elements where React state rendering would cause performance drops.
- Use to manage GSAP tweens and timelines safely within React 19 component lifecycles.

## 1. MANDATORY DEPENDENCIES
To use GSAP safely in React, you MUST install the core library and the official React hook wrapper to handle automatic garbage collection:
```bash
npm install gsap @gsap/react
```

## 2. THE GOLDEN RULE: REACT LIFECYCLE & CLEANUP
GSAP creates permanent styles and listeners on DOM nodes. If a component unmounts without cleaning up its GSAP animations, it will cause memory leaks and broken layouts.

### Using `useGSAP` (Standard Pattern)
Always use the official `@gsap/react` hook. It handles component scope, context cleanup, and execution timing automatically.

```tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins globally (Client Side Only)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ScrollRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    // GSAP animations run here safely, scoped to containerRef
    gsap.from(textRef.current, {
      opacity: 0,
      y: 100,
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%', // trigger when top of container hits 80% viewport
        end: 'top 30%',
        scrub: true,      // link animation progress directly to scrollbar
      }
    });
  }, { scope: containerRef }); // auto-cleans all animations inside scope on unmount

  return (
    <div ref={containerRef} className="min-h-[100dvh] flex items-center justify-center bg-zinc-50">
      <h1 ref={textRef} className="text-6xl font-bold tracking-tight text-zinc-950">
        AI Analysis Engine
      </h1>
    </div>
  );
}
```

## 3. COMPLEX SCROLLTELLING TIMELINES (SCROLL-SCRUBBING)
For linear-like storytelling sections where multiple events happen in sequence as the user scrolls, use a GSAP Timeline bound to a pinned container.

```tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function StorytellingShowcase() {
  const mainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: mainRef.current,
        start: 'top top',
        end: '+=300%', // Scroll length is 3x the viewport height
        pin: true,     // Pin the section in place while animating
        scrub: 1,      // Smooth scrubbing (takes 1 second to catch up to scroll)
      }
    });

    // Step 1: Fade out initial greeting, scale up circle
    tl.to('.step-1', { opacity: 0, y: -50 })
      .to('.portal-circle', { scale: 50, duration: 2 }, '-=0.2')
      
      // Step 2: Fade in the AI Dashboard mock
      .from('.dashboard-preview', { opacity: 0, scale: 0.8 }, '-=1')
      .to('.dashboard-preview', { y: -20, duration: 1 })
      
      // Step 3: Draw the connected SVG path
      .from('.connector-line', { strokeDashoffset: 1000, duration: 1.5 });
  }, { scope: mainRef });

  return (
    <div ref={mainRef} className="h-screen w-full relative overflow-hidden bg-zinc-950 text-white">
      {/* Step 1 Content */}
      <div className="step-1 absolute inset-0 flex items-center justify-center">
        <h2 className="text-4xl font-semibold">Scroll to Analyze CV</h2>
      </div>

      {/* Visual Portal Circle */}
      <div className="portal-circle absolute w-24 h-24 rounded-full bg-orange-500/10 border border-orange-500/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none" />

      {/* Step 2 Content */}
      <div className="dashboard-preview absolute inset-0 flex items-center justify-center opacity-0 z-10 pointer-events-none">
        <div className="w-[80%] h-[60%] bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <p>Dashboard Analysis Data</p>
        </div>
      </div>
    </div>
  );
}
```

## 4. ARCHITECTURAL GUARDRAILS
- **THE EXCLUSION PRINCIPLE**: Never target the same DOM element with both GSAP and Framer Motion. This causes style conflicts, animation freezing, and layout thrashing.
  - *Recommendation*: Use **Framer Motion** for small, state-driven, component-level UI interactions (hover, active click, modal open, page transitions). Use **GSAP** for large, scroll-bound, timeline-orchestrated sections (landing page storytelling).
- **SSR Check**: Always wrap GSAP plugin registrations and window-dependent animations in `if (typeof window !== 'undefined')` checks.
- **Scope Restriction**: Always pass `{ scope: ref }` as the second argument to `useGSAP` to prevent targeting elements outside the component.
