import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        sidebar: "var(--bg-sidebar)",
        well: "var(--bg-well)",
        card: "var(--bg-card)",
        hover: "var(--bg-hover)",
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        line: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          fg: "var(--accent-fg)",
          soft: "var(--accent-soft)",
          ink: "var(--accent-ink)",
        },
        status: {
          "success-ink": "var(--success-ink)",
          "success-soft": "var(--success-soft)",
          "warn-ink": "var(--warn-ink)",
          "warn-soft": "var(--warn-soft)",
          "danger-ink": "var(--danger-ink)",
          "danger-soft": "var(--danger-soft)",
        },
      },
      textColor: {
        accent: {
          DEFAULT: "var(--accent-ink)",
          fg: "var(--accent-fg)",
        },
      },
      borderColor: {
        accent: "var(--accent-border)",
      },
      ringColor: {
        accent: "var(--accent-border)",
      },
      animation: {
        "fade-in": "fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
