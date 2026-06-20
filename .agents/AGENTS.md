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
