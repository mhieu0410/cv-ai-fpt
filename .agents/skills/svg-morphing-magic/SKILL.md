---
name: svg-morphing-magic
description: "Design fluid SVG path transitions, animated vector paths, drawing stroke cascades, and interactive SVG morphing in React."
risk: safe
category: frontend
date_added: "2026-06-19"
author: "Antigravity"
tags: [svg, animation, framer-motion, morphing, react]
---

# Skill: SVG Path Morphing & Drawing Magic

## When to Use
- Use when designing dynamic UI indicators (e.g. morphing play to pause button, morphing checkmark to warning, AI processing nodes).
- Use to animate connection paths (lines that draw themselves between CV nodes or sections on scroll).
- Use when implementing custom circular/linear progress bars, dynamic line charts, or decorative glowing orbits.

## 1. PATH MORPHING PRINCIPLES
Framer Motion can seamlessly morph one SVG path into another using `motion.path` *only if the source and target paths have the same number of vertices and command structure*.

### Morphing Constraint: Vertex Matching
If Path A has 4 points and Path B has 8 points, the transition will jitter or fail. Always design morphing paths in vector editors (Figma/Illustrator) by modifying the *same path shape* so that the total path commands (like `M`, `C`, `L`, `Z`) match exactly.

```tsx
'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

// Both paths must have matching coordinate structures
const CHECK_PATH = "M6 12L10 16L18 8";
const ARROW_PATH = "M6 12L18 12L13 7";

export function MorphingButton() {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <button 
      onClick={() => setIsSuccess(!isSuccess)}
      className="p-3 bg-zinc-950 text-white rounded-full hover:scale-105 active:scale-95 transition-transform"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          animate={{ d: isSuccess ? CHECK_PATH : ARROW_PATH }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        />
      </svg>
    </button>
  );
}
```

## 2. DYNAMIC PATH DRAWING (STROKE ANIMATION)
You can easily animate the drawing of lines, charts, or icons by manipulating the `strokeDasharray` and `strokeDashoffset` properties using Framer Motion's shorthand `pathLength`.

```tsx
'use client';
import { motion } from 'framer-motion';

export function AnimatedCircle() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="4" fill="transparent" />
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke="#F26F21" // FPT Orange
        strokeWidth="4"
        fill="transparent"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
}
```

## 3. COORDINATE-DRIVEN DYNAMIC CONNECTOR LINES
When designing dynamic connectors (e.g. a line connecting an AI scoring node to a CV section), calculate the bounding box of the target elements dynamically and feed the coordinates into an SVG path.

```tsx
'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function DynamicConnector({ fromRef, toRef }: { fromRef: React.RefObject<HTMLDivElement | null>; toRef: React.RefObject<HTMLDivElement | null> }) {
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useEffect(() => {
    const updateCoordinates = () => {
      if (!fromRef.current || !toRef.current) return;
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();
      
      // Calculate coordinates relative to parent workspace
      setCoords({
        x1: fromRect.left + fromRect.width / 2 + window.scrollX,
        y1: fromRect.bottom + window.scrollY,
        x2: toRect.left + toRect.width / 2 + window.scrollX,
        y2: toRect.top + window.scrollY,
      });
    };

    updateCoordinates();
    window.addEventListener('resize', updateCoordinates);
    window.addEventListener('scroll', updateCoordinates);
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      window.removeEventListener('scroll', updateCoordinates);
    };
  }, [fromRef, toRef]);

  // Construct a smooth cubic bezier curve
  const pathD = `M ${coords.x1} ${coords.y1} C ${coords.x1} ${(coords.y1 + coords.y2) / 2}, ${coords.x2} ${(coords.y1 + coords.y2) / 2}, ${coords.x2} ${coords.y2}`;

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
      <motion.path
        d={pathD}
        stroke="#F26F21"
        strokeWidth="2"
        fill="transparent"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}
```
