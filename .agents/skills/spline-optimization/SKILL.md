---
name: spline-optimization
description: "Optimize 3D Spline scenes, React Three Fiber rendering, load states, and GPU/memory footprint in Next.js applications."
risk: safe
category: frontend
date_added: "2026-06-19"
author: "Antigravity"
tags: [3d, spline, r3f, performance, nextjs, react]
---

# Skill: 3D Spline & Canvas Performance Optimization

## When to Use
- Use when the project rendering includes `@splinetool/react-spline`, `@splinetool/runtime`, `@react-three/fiber`, or `three.js`.
- Use when designing pages with 3D canvas elements, complex meshes, interactive models, or scroll-tied 3D animations.
- Use to diagnose and resolve frame rate drop (below 60fps), high GPU/CPU thermal load, memory leaks on page transition, or slow initial page load (FCP).

## 1. NEXT.JS LAZY LOADING & SSR GUARD (CRITICAL)
3D runtimes access WebGL browser APIs that do not exist on the server. Importing them directly causes Next.js compilation or hydration errors.

### The Dynamic SSR-Disabled Wrapper
Always load Spline or ThreeJS Canvas components dynamically, disabling Server-Side Rendering (SSR). This prevents bundle bloating on the initial page load.

```tsx
// components/spline-container.tsx
'use client';

import dynamic from 'next/dynamic';
import { Activity } from 'lucide-react'; // Or custom light loader

// Dynamic load with ssr: false
const SplineComponent = dynamic(
  () => import('@splinetool/react-spline').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-zinc-50/50 rounded-3xl animate-pulse">
        <Activity className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    ),
  }
);

interface SplineContainerProps {
  sceneUrl: string;
}

export default function SplineContainer({ sceneUrl }: SplineContainerProps) {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl">
      <SplineComponent scene={sceneUrl} />
    </div>
  );
}
```

## 2. WEBGL GARBAGE COLLECTION & MEMORY LEAK PREVENTION
When navigating between pages in Next.js (Single Page App), canvas elements are unmounted, but WebGL contexts, geometry, and textures may remain in GPU memory, causing eventual browser crashes.

### Cleanup Protocol for ThreeJS / React Three Fiber (R3F)
If building custom ThreeJS/Fiber canvases, ensure all resources are explicitly disposed of upon unmounting:

```tsx
useEffect(() => {
  return () => {
    // Traverse the scene and dispose of geometries, materials, and textures
    scene.traverse((object) => {
      if (!object.isMesh) return;
      
      object.geometry.dispose();

      if (object.material.isMaterial) {
        cleanMaterial(object.material);
      } else {
        // Handle array of materials
        for (const material of object.material) cleanMaterial(material);
      }
    });
  };
}, [scene]);

const cleanMaterial = (material) => {
  material.dispose();
  for (const key of Object.keys(material)) {
    if (material[key] && typeof material[key].dispose === 'function') {
      material[key].dispose();
    }
  }
};
```

## 3. SPLINE DESKTOP VS MOBILE PERFORMANCE CONTROLS
Spline scenes can easily lag mobile browsers due to high polygon counts and dynamic shadows.

- **Interaction Isolation**: Set `pointer-events-none` on the 3D container unless the user is explicitly meant to rotate/interact with the mesh. This prevents the canvas from intercepting scroll gestures on touchscreens.
- **Dynamic Quality Scaling**: Use user agent detection or screen size breakpoints to load simpler scenes (lower mesh detail, no dynamic shadows) on viewports `< 768px`.
- **Canvas Suspension**: Detect if the canvas is offscreen using `IntersectionObserver`. If the canvas is not in the viewport, pause the rendering loop or set the container to `display: none` to stop GPU cycles.

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const [isInViewport, setIsInViewport] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setIsInViewport(entry.isIntersecting),
    { threshold: 0.1 }
  );

  if (containerRef.current) {
    observer.observe(containerRef.current);
  }

  return () => observer.disconnect();
}, []);

// Render canvas only when in viewport to save mobile battery
return (
  <div ref={containerRef} className="w-full h-full">
    {isInViewport && <SplineComponent scene={sceneUrl} />}
  </div>
);
```

## 4. LIGHTING & SHADOW OPTIMIZATION
In the Spline Editor:
- **Shadow Map Resolution**: Keep shadow maps under `1024x1024` pixels.
- **Realtime Lights**: Limit the number of dynamic lights casting shadows to **one** (directional or spot light). Use ambient lighting or baked lighting for the rest of the scene.
- **Anti-Aliasing**: Disable screen-space anti-aliasing (MSAA) inside the WebGL canvas settings if performance is slow; let the browser's default resolution handle scaling.
