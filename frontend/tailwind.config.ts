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
        canvas: "#F7F5F0",
        surface: "#FFFFFF",
        "surface-muted": "#EFECE5",
        ink: "#1E242B",
        "ink-muted": "#525D68",
        "border-subtle": "#DDD7CB",
        accent: "#164E3F",
        "accent-hover": "#0F3A2F",
        "accent-soft": "#E6F0EC",
        navy: "#1B3252",
        "navy-soft": "#E9EEF5",
        amber: {
          700: "#92540A",
          100: "#FDF3E3",
        },
        crimson: {
          700: "#9B2C2C",
          100: "#FDECEC",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
