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
          green:   "#63f807",   // neon green — primary accent / CTA
          lime:    "#63f807",   // alias
          navy:    "#11326e",   // dark navy
          blue:    "#1e4a9a",   // medium blue (derivado del navy)
          gray:    "#c2c2c2",   // light gray
          dark:    "#11326e",   // alias navy
          emerald: "#30bc18",   // secondary / deeper green
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
