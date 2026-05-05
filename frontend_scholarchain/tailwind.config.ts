import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { 
          DEFAULT: '#2563EB', 
          dark: '#1d4ed8' 
        },
        success: '#16a34a',
        danger: '#dc2626',
      }
    },
  },
  plugins: [],
};

export default config;