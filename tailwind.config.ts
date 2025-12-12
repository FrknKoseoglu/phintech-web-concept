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
        // Brand Colors (Midas Blurple)
        primary: {
          DEFAULT: "#4E55FF",
          hover: "#3D44D8",
        },
        // Status Colors
        success: "#05C46B",
        danger: "#FF3B30",
        warning: "#F59E0B",
        // Background Colors
        background: {
          light: "#FFFFFF",
          dark: "#000000",
        },
        // Surface/Card Colors
        surface: {
          light: "#F4F4F5",
          dark: "#000000",
        },
        // Border Colors
        border: {
          light: "#E5E7EB",
          dark: "#2C2C2E",
        },
        // Text Colors
        text: {
          // Dark mode
          main: "#FFFFFF",
          muted: "#8E8E93",
          // Light mode
          "light-main": "#000000",
          "light-muted": "#6C6C70",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
