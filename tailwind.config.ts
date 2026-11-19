import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: "#F28C28", 600: "#D9761A", 700: "#B85F10", 50: "#FEF3E7" },
        navy: { DEFAULT: "#101B36", 800: "#16254A", 700: "#1F3260", 100: "#E3E7F0" },
        mist: "#F5F6F8",
      },
      fontFamily: {
        display: ["var(--font-montserrat)", "Montserrat", "Helvetica", "Arial", "sans-serif"],
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(16,27,54,.06), 0 8px 24px rgba(16,27,54,.06)" },
    },
  },
  plugins: [],
};
export default config;
