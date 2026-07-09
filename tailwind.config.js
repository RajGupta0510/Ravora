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
        background: "#060B17",
        card: "#0F172A",
        primary: {
          DEFAULT: "#4F7CFF",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#6C63FF",
          foreground: "#ffffff"
        },
        accent: {
          DEFAULT: "#7A5AF8",
          cyan: "#06B6D4"
        },
        slate: {
          400: "#94a3b8"
        }
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
