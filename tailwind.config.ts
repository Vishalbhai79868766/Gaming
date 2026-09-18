import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0f1c', // Primary canvas background
          800: '#111827', // Card and panel surfaces
          700: '#1f2937', // Borders and dividers
        },
        'electric-blue': '#00d2ff',
        'light-blue': '#3a86ff',
        'muted-grey': '#9ca3af',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 210, 255, 0.35)',
      }
    },
  },
  plugins: [],
};
export default config;