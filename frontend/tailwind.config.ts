import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F2EBDD",
        surface: "#FAF6EE",
        "surface-muted": "#E9DFCC",
        beige: "#D8C9AE",
        ink: "#252923",
        "ink-muted": "#586055",
        "border-subtle": "#D8C9AE",
        accent: "#183D32",
        "accent-hover": "#102B24",
        "accent-soft": "#E4ECE6",
        sage: "#829783",
        gold: "#B69A68",
        "gold-soft": "#F3EBDC",
        navy: "#1F4238",
        "navy-soft": "#E3ECE8",
        amber: {
          700: "#8A5E1A",
          100: "#F4E9D4",
        },
        crimson: {
          700: "#8E2E2E",
          100: "#F7E5E3",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(24, 61, 50, 0.06), 0 1px 3px 0 rgba(37, 41, 35, 0.05)",
        card: "0 8px 28px -8px rgba(16, 43, 36, 0.08), 0 1px 4px 0 rgba(37, 41, 35, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
