import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ritten: {
          // warm alpine palette
          forest: "#2f6f4f",
          moss: "#4c956c",
          rock: "#6b7280",
          snow: "#f8fafc",
          sky: "#3b82f6",
          track: "#e85d04", // walked routes
          planned: "#7c3aed", // planned routes
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
