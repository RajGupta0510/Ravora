/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        card: "var(--color-surface)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
          subtle: "var(--color-surface-subtle)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          dark: "var(--color-primary-dark)",
          foreground: "#0b0e14"
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-text-primary)"
        },
        accent: {
          DEFAULT: "var(--color-primary)",
          amber: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
          cyan: "#f59e0b"
        },
        stone: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          800: "#1e293b",
          900: "#0f172a"
        },
        slate: {
          400: "var(--color-text-secondary)"
        },
        border: "var(--color-border)"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      }
    },
  },
  plugins: [],
}
