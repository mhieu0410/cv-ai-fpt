# CV AI FPT - Design System & UI/UX Guidelines

These rules apply globally to this workspace for all UI development tasks.

## 1. Aesthetic Vibe: "Modern Editorial" & "High-Contrast Minimalism"
- **Theme:** Strictly Light Mode. Backgrounds should be pure white (`#FFFFFF`) or off-white (`#F9FAFB` / `zinc-50`). No dark mode.
- **Contrast:** High contrast between background and text. Text should be sharp black (`#171717` or `#000000`) or dark gray (`#3F3F46`) for secondary text.
- **Cleanliness:** Ample whitespace (padding and margins). Avoid clutter.

## 2. Typography: "Bold & Oversized"
- **Fonts:** Use `Geist` and `Geist Mono` (already configured).
- **Headings:** Headings (`h1`, `h2`) should use tracking-tight (negative letter-spacing), font-bold to font-extrabold, and be significantly larger than body text.
- **Body:** Body text should be clean, highly legible, and properly line-height spaced (leading-relaxed).

## 3. Colors: "FPT Signature Orange"
- **Accent Color:** FPT Orange (`#F26F21`).
- **Usage:** Use the accent color **sparingly** and intentionally. It should only be used for primary CTA buttons, active states, hover underlines, or small critical highlights. Do not overuse it to maintain the clean editorial look.

## 4. Motion Design: "Parallax & Smooth Interactions"
- **Wow Factor:** Use Parallax 3D tilt effects for major UI cards (Bento grids) on the Landing Page.
- **Micro-interactions:** Buttons should have subtle scale down (`active:scale-95`) and smooth color transitions.
- **Library:** Rely on `framer-motion` for complex animations and standard Tailwind `transition-all duration-300` for simple hover states.

## 5. UI Components (Bento Grids)
- Use Bento Box style cards to display complex data (like CV stats, JD Match scores).
- Cards should have subtle borders (`border-zinc-200`), pure white backgrounds, and soft, highly dispersed shadows (`shadow-xl` or custom large soft shadow) to stand out against the off-white app background.

## 6. Commercial Product Mindset & Holistic UX
- **User-Centric & Practical:** Design must prioritize actual user flows, logic, and practicality. A beautiful screen is meaningless if it is disjointed or introduces friction.
- **Cohesion Across the App:** The entire journey (from Landing Page -> Auth -> Dashboard -> CV Builder -> Checkout) must feel like one unified premium product, not a collection of isolated screens.
- **High-Value Feel for Paying Customers:** The UI/UX must justify a paid subscription. This means zero jank, robust error handling, progressive disclosure of complex features, and intuitive navigation. We must think like a commercial product owner.

## 7. THE ULTIMATE AESTHETIC STANDARD (NO HALF-MEASURES)
- **Zero Compromise:** The internal App UI (Dashboard, Builder, Checkout, Auth) MUST possess the EXACT SAME level of visual fidelity, "Wow" factor, and high-end aesthetics as the Landing Page.
- **Beyond Generic SaaS:** Do not settle for "clean but boring" layouts. Every screen must employ high-end design techniques: complex asymmetrical bento grids, glassmorphism (`backdrop-blur`), sophisticated micro-animations (Framer Motion springs, stagger children), and dramatic typography scaling.
- **Self-Interrogation:** Before proposing any UI change, ask yourself: *"Does this look like a $1,000/month Enterprise product? Does it evoke emotion? Does it match the jaw-dropping quality of our Landing Page?"* If the answer is No, tear it down and start over. No superficial plans. No half-baked upgrades.

## 8. DEEP BUSINESS LOGIC & CREATIVE CONTENT STRATEGY
- **Proactive Creativity:** Do not just upgrade existing components structurally. Actively invent and propose necessary content, features, and user flows that *should* exist but currently do not. Think like a Product Strategist.
- **Understand & Guide the User:** Every form, especially Auth and Onboarding, must extract high-value information to understand the customer (e.g., pain points, experience level) and instantly use that data to guide them (e.g., personalized template suggestions, tailored UX writing). 
- **Beyond the Surface:** A premium product anticipates user needs. Don't just build a form; build a mini-consultation. Empathize with the user's career goals and shape the UI/UX logic around those goals.
