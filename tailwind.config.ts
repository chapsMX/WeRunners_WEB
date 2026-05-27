import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semantic tokens (CSS-variable-driven, theme-aware) ── */
        background:   "var(--background)",
        foreground:   "var(--foreground)",
        "surface-alt":"var(--surface-alt)",
        muted:        "var(--muted)",
        line:         "var(--line)",

        /* ── Brand palette ── */
        brand: {
          green:   "#7AC142",   // primary accent
          lime:    "#7AC142",   // alias kept for backward compat
          navy:    "#002A5C",   // dark navy
          blue:    "#2D5980",   // medium blue
          gray:    "#B2B7BB",   // light gray
          dark:    "#002A5C",   // was #0a0a0a → now navy
          emerald: "#7AC142",   // alias kept
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
