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
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-text-primary)"
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-text-primary)"
        },
        accent: {
          DEFAULT: "var(--color-ai-accent)",
          cyan: "var(--color-info)"
        },
        slate: {
          400: "var(--color-text-secondary)"
        }
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      }
    },
  },
  plugins: [],
}
