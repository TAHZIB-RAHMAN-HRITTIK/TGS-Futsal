import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: "#0F3D2E",
          dark: "#0A2B20",
          line: "#1E5A44",
        },
        turf: "#2E7D4F",
        amber: "#F2B705",
        ink: "#11201A",
        bone: "#F6F4EE",
        card: "#F0EEE6",
        alert: "#B33A3A",
      },
      fontFamily: {
        display: ["var(--font-score)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      fontFeatureSettings: {
        tabular: '"tnum"',
      },
    },
  },
  plugins: [],
};

export default config;
