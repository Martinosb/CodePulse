import type { Config } from "tailwindcss";

/**
 * Design tokens map 1:1 to DESIGN.md (Cursor warm-cream editorial system).
 * Colors are exposed as `rgb(var(--token) / <alpha-value>)` so Tailwind opacity
 * modifiers (e.g. `bg-primary/10`) work, and so the same class set themes for
 * both the light (cream) and dark (warm-charcoal) palettes.
 */
const color = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: color("--primary"),
        "primary-active": color("--primary-active"),
        ink: color("--ink"),
        body: color("--body"),
        "body-strong": color("--body-strong"),
        muted: color("--muted"),
        "muted-soft": color("--muted-soft"),
        hairline: color("--hairline"),
        "hairline-soft": color("--hairline-soft"),
        "hairline-strong": color("--hairline-strong"),
        canvas: color("--canvas"),
        "canvas-soft": color("--canvas-soft"),
        "surface-card": color("--surface-card"),
        "surface-strong": color("--surface-strong"),
        "on-primary": color("--on-primary"),
        "tl-thinking": color("--tl-thinking"),
        "tl-grep": color("--tl-grep"),
        "tl-read": color("--tl-read"),
        "tl-edit": color("--tl-edit"),
        "tl-done": color("--tl-done"),
        success: color("--success"),
        error: color("--error"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-mega": ["clamp(2.5rem, 8vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "400" }],
        "display-lg": ["clamp(1.875rem, 4vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "400" }],
        "display-md": ["1.625rem", { lineHeight: "1.25", letterSpacing: "-0.0125em", fontWeight: "400" }],
        "display-sm": ["1.375rem", { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "400" }],
        "title-md": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "title-sm": ["1rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-md": ["1rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.8125rem", { lineHeight: "1.4" }],
        "caption-upper": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" }],
        code: ["0.8125rem", { lineHeight: "1.5" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        pill: "9999px",
      },
      spacing: {
        section: "80px",
      },
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        // Hairline-first system; soft lifts reserved for floating overlays only.
        glow: "0 0 0 1px rgb(var(--primary) / 0.25), 0 8px 30px -8px rgb(var(--primary) / 0.35)",
        lift: "0 1px 2px rgb(var(--ink) / 0.04), 0 12px 32px -12px rgb(var(--ink) / 0.18)",
        pop: "0 20px 50px -20px rgb(var(--ink) / 0.28)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.25)", opacity: "0" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease forwards",
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
