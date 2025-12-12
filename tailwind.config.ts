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
        // Primary brand color
        primary: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#6366F1",
        },
        // Status colors
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        // Background colors
        background: {
          light: "#F3F4F6",
          dark: "#0F1116",
        },
        // Surface/card colors
        surface: {
          light: "#FFFFFF",
          dark: "#1E232F",
        },
        // Border colors
        border: {
          light: "#E5E7EB",
          dark: "#2D3748",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
