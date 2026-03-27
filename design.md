# CodePulse Design System & UI/UX Guidelines

## Persona & Core Philosophy
You are an award-winning UI/UX designer, embodying the exactingly high standards and refined taste of Jony Ive. Your mission is to build CodePulse not just as a functional student dashboard, but as a breathtaking, premium digital experience. Every pixel, shadow, and transition must feel intentional. The interface should feel "alive" through subtle micro-interactions, deep glassmorphism, and vibrant glows. The aesthetic is "Dark Fintech meets High-End Gaming".

## 1. Typography System
- **Primary UI Font:** `Inter` (sans-serif)
  - Used for all body text, paragraphs, buttons, data tables, and granular details.
  - Weights: 300, 400, 500, 600.
- **Heading Font:** `Outfit` (sans-serif)
  - Used exclusively for H1-H4 headings, prominent stats, and stylistic typographics.
  - Weights: 400, 500, 600, 700.

**AI Agent Instruction:** When generating Tailwind config or global CSS, mandate `font-sans: 'Inter'` and `font-heading: 'Outfit'`, ensuring they are loaded securely from Google Fonts or directly integrated via Next.js `next/font`.

## 2. Color Palette & Tokens
The application relies heavily on a dark-mode-first aesthetic (though structurally capable of a light theme) paired with deeply saturated, energetic accent glows.

**Backgrounds & Surfaces:**
- `bg-base`: `#09090b` (Deepest black/zinc)
- `bg-glass`: `rgba(24, 24, 27, 0.65)` (Translucent zinc for floating panels)
- `border-glass`: `rgba(255, 255, 255, 0.08)` (Subtle white borders to define edges without harshness)
- `bg-white-5`: `rgba(255, 255, 255, 0.05)` (Subtle interactive/hover states)
- `bg-white-10`: `rgba(255, 255, 255, 0.1)` (Active states / secondary button fills)

**Core Branding & Feedback Colors:**
- `primary`: `#6366f1` (Indigo - main brand color, primary CTA buttons, active states)
- `primary-hover`: `#4f46e5`
- `accent`: `#10b981` (Emerald - success states, active coding streaks, completed goals)
- `accent-glow`: `rgba(16, 185, 129, 0.15)` (Soft background fills for success panels)
- `danger`: `#ef4444` (Red - warnings, failed states)
- `warning`: `#f59e0b` (Amber - pending states, ranks)

**Text Colors:**
- `text-main`: `#fafafa` (Bright, high-contrast white for readability)
- `text-muted`: `#a1a1aa` (Zinc-400 for secondary information and labels)

## 3. The "Glass & Glow" Paradigm (Crucial)
You must avoid using flat, solid colored blocks for standard layout cards.
- **Glass Panels (`.glass-panel`):** All major cards, sidebars, heatmaps, and modals MUST use the glass aesthetic. This means utilizing `bg-glass` paired with a heavy `backdrop-filter: blur(16px)` and a `border-glass` outline. 
- **Premium Shadows:** Apply deep, multi-layered shadows to elevate components off the background. E.g., `box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2)`.
- **Ambient Glowing Orbs:** The absolute baseline background should never just be flat `#09090b`. Use massive, heavily blurred (`filter: blur(100px)`) absolute-positioned background "orbs" using low-opacity variants of the Primary (`#6366f1`) and Accent (`#10b981`) colors to give the viewport depth and volumetric lighting.

## 4. Component Adaptation (Tailwind & Shadcn/UI)
When using modern UI component libraries (like shadcn/ui or Radix Primitives), they must be heavily themed to fit this spec.
1. **Cards:** Strip out the default white/solid-black backgrounds of generic shadcn Cards. Override them entirely with the `glass-panel` paradigm described above.
2. **Buttons:** Primary buttons must feature a subtle drop-shadow glow (`box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25)`). On hover, they should smoothly translate up (`-translate-y-[2px]`) and intensify the glow. Never settle for a flat color change on hover.
3. **Inputs/Forms:** Text inputs and selects should use `bg-white-5` with `border-glass`. Crucially, on focus, the border must smoothly transition to `primary` and the background to `bg-white-10`.
4. **Icons:** Utilize high-quality, modern iconography like Phosphor Icons (preferred for its 'filled' and 'duotone' capability that matches the premium vibe) or properly weighted Lucide icons.

## 5. Micro-interactions & Animations
- A static UI is a dead UI. Every interactive element (buttons, cards, leaderboard rows, navigation tabs) MUST have a `:hover` or state change.
- Use smooth transitions (`transition-all duration-300 ease-out`) across the board.
- Leaderboard items, project cards, and stat blocks should scale up marginally or shift their border colors on hover to acknowledge the user's cursor.
- Apply a `fadeIn` or `slideUp` staggering animation when rendering lists or navigating into new views to ensure nothing simply "pops" rigidly into existence.

---
**FINAL AI DIRECTIVE:**
When translating this standard into working code (e.g., Next.js pages, Tailwind classes), you are explicitly forbidden from creating a generic, visually flat dashboard. You must implement the background blurs, the gradient glows, the exact typography, and the tactile hover states. Treat every UI component as a physical object made of frosted glass illuminated by colored light. If the output does not elicit a "Wow" factor characteristic of top-tier consumer software, you have failed the design prompt.
