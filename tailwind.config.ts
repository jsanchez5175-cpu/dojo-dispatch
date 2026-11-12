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
        sf: {
          red:    "#E81C2A",
          red2:   "#FF3B4A",
          gold:   "#F5A623",
          dark:   "#0A0A0F",
          dark2:  "#12121A",
          dark3:  "#1A1A26",
          border: "#2E2E4A",
          text:   "#E8E8F0",
          muted:  "#7878A0",
          accent: "#00D4FF",
          green:  "#00FF88",
          purple: "#9933CC",
        },
      },
      fontFamily: {
        condensed: ['"Barlow Condensed"', "sans-serif"],
        sans: ["Barlow", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;