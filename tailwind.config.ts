import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Midas Deep Black & Yellow Accent Theme
        midas: {
          black: "#0a0a0a",
          dark: "#111111",
          darker: "#0d0d0d",
          gold: "#FFD700",
          yellow: "#FBBF24",
          accent: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
