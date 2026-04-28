import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "resume-page": "0 24px 80px rgba(15, 23, 42, 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-app)", "ui-sans-serif", "system-ui"],
        resume: ["var(--font-resume)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
