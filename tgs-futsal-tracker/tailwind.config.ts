import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme: white + sky blue (sampled from the Gregorians logo)
        sky: "#2C84B6", // exact logo blue: borders, big fills
        pitch: { DEFAULT: "#1F6A99", dark: "#175578", line: "#2C84B6" }, // buttons
        turf: "#1F6A99", // blue used for small text/headings (readable on white)
        amber: { DEFAULT: "#F2B705", 600: "#D9A404", 700: "#8A6500" }, // gold: MOTM star
        ink: "#0E2A3F", // main text (dark navy)
        bone: "#FFFFFF", // text on blue buttons
        card: "#EEF5FA", // light sky tint for boxes
        alert: "#B33A3A", // live / red cards
      },
      fontFamily: {
        display: ["var(--font-score)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
