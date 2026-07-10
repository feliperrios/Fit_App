import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#111111", card: "#1C1C1E", cardborder: "#3A3A3C", surface: "#2C2C2E", surface2: "#161618",
        accent: "#1D9E75", "accent-soft": "#0D3D2A", "accent-text": "#4CD9A0",
        danger: "#8B2020", "danger-soft": "#3D0D0D", "danger-text": "#F06060",
        warn: "#F0A500", "warn-soft": "#3D2D00", blueish: "#5BA3F5", "blueish-soft": "#0D1F3D",
        purpleish: "#9BA8F0", "purpleish-soft": "#1A1A2E", muted: "#888888", mutedline: "#2C2C2E",
      },
      borderRadius: { card: "14px", pill: "99px" },
      maxWidth: { app: "480px" },
    },
  },
  plugins: [],
};
export default config;