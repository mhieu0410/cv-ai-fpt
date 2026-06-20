---
name: framer-motion-orchestration
description: "Orchestrate complex Framer Motion transitions, stagger cascades, layoutId animations, and exit sequences in Next.js 16/React 19."
risk: safe
category: frontend
date_added: "2026-06-19"
author: "Antigravity"
tags: [motion, animation, framer-motion, react, nextjs]
---

# Skill: Framer Motion Animation Orchestration

## When to Use
- Use when designing staggered entrance transitions (e.g., lists, bento grids, navigation dropdowns).
- Use when animating shared elements between different views or layouts using Framer Motion's `layoutId`.
- Use to resolve rendering issues, layout jumps, or performance bottlenecks when running multiple concurrent animations in React 19.

## 1. REACT 19 & NEXT.JS RSC ORCHESTRATION RULES
All `<motion.div>` tags and Framer Motion hooks (`useScroll`, `useTransform`, `useMotionValue`, `AnimatePresence`) MUST reside exclusively in Client Components.

### The Leaf Isolation Pattern
Do not wrap your entire page in a Client Component just to add a fade-in effect. Instead, wrap child elements or create a dedicated wrapper component:

```tsx
// components/motion/fade-in-wrapper.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function FadeInWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

## 2. STAGGERED ENTRANCES (WATERFALL EFFECT)
To animate a list or grid sequentially:
- Define `variants` on the parent container setting `staggerChildren` and `delayChildren`.
- Define `variants` on children matching the parent's target keys.
- **CRITICAL**: The Parent and Children must be in the same Client Component tree.

```tsx
'use client';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Time between child animations
      delayChildren: 0.2,   // Initial delay
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
};

export function StaggeredGrid({ items }: { items: string[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={childVariants} className="p-6 bg-white rounded-3xl shadow-soft">
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

## 3. SHARED ELEMENT TRANSITIONS (LAYOUT ID)
Use `layoutId` to morph elements from one visual state or container to another seamlessly during state changes (e.g., active tabs, expanding card details).

```tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function NavigationTabs() {
  const [activeTab, setActiveTab] = useState('home');
  const tabs = ['home', 'profile', 'settings'];

  return (
    <nav className="flex space-x-2 bg-zinc-100 p-1.5 rounded-full relative">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className="relative px-4 py-2 text-sm font-medium rounded-full transition-colors z-10"
        >
          <span className={activeTab === tab ? 'text-zinc-950' : 'text-zinc-500'}>
            {tab}
          </span>
          {activeTab === tab && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
```

## 4. PERFORMANCE & ANIMATION DO's & DONT's
- **NO Layout Thrashing**: Never animate properties like `width`, `height`, `top`, `left`, `margin`, or `padding`. Animate **exclusively** `x`, `y`, `scale`, `rotate`, and `opacity`.
- **AnimatePresence Exit Keys**: When using `<AnimatePresence>`, make sure direct children have unique, persistent `key` props; otherwise, exit animations will not trigger.
- **Hardware Acceleration**: Set `transform-gpu` or use `willChange` on elements containing complex, continuous motion.
