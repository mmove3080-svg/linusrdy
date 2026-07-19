import type { Config } from "tailwindcss";

/**
 * Linus Delivery — Design System
 * ------------------------------------------------------------------
 * Extracted from the official homepage design reference.
 *
 * Palette:   near-white canvas, vivid royal blue accent, deep navy ink
 * Type:      Plus Jakarta Sans (display + body) — rounded, modern, premium
 * Surfaces:  white cards, large radii, soft layered shadows, hairline borders
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#DCE4FE",
          200: "#BCCBFD",
          300: "#93AAFB",
          400: "#6483F7",
          500: "#3B5DF0",
          600: "#2145E6", // primary — headline accent, buttons, active nav
          700: "#1A37C4",
          800: "#172E9E",
          900: "#16297D",
        },
        ink: {
          DEFAULT: "#0B1B3F", // deep navy — headings
          soft: "#3D4A6B",    // body text
          faint: "#8A94AD",   // captions, placeholders
        },
        canvas: {
          DEFAULT: "#FFFFFF",
          tint: "#F6F8FC",    // very light gray-blue page tint
          line: "#E8ECF4",    // subtle borders / separators
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        // Hero display scale (matches two-line headline proportions)
        "display-lg": ["4.25rem", { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-md": ["3.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-sm": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "800" }],
      },
      borderRadius: {
        card: "1.25rem",   // info cards, tracking card
        pill: "9999px",
        panel: "1.75rem",  // navbar container, large surfaces
      },
      boxShadow: {
        // Layered, blue-tinted soft shadows — the "floating on white" look
        soft: "0 2px 8px -2px rgba(11,27,63,0.06), 0 8px 24px -8px rgba(11,27,63,0.08)",
        card: "0 4px 12px -4px rgba(11,27,63,0.06), 0 16px 40px -12px rgba(11,27,63,0.10)",
        lift: "0 8px 20px -6px rgba(33,69,230,0.16), 0 24px 56px -16px rgba(11,27,63,0.14)",
        glowInput: "0 0 0 4px rgba(33,69,230,0.14)",
        navbar: "0 1px 2px rgba(11,27,63,0.04), 0 12px 32px -12px rgba(11,27,63,0.12)",
      },
      keyframes: {
        "pin-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.9" },
          "70%": { transform: "scale(2.4)", opacity: "0" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "suspension": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2.5px)" },
        },
        "dash-travel": {
          to: { strokeDashoffset: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(45,140,255,0)" },
          "50%": { transform: "scale(1.06)", boxShadow: "0 0 10px 2px rgba(45,140,255,0.22)" },
        },
      },
      animation: {
        "pin-pulse": "pin-pulse 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        suspension: "suspension 3.2s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
      maxWidth: {
        shell: "80rem", // 1280px content shell
      },
    },
  },
  plugins: [],
} satisfies Config;
