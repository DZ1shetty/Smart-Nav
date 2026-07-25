/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0d0d0d",
        "dark-accent": "#111111",
        "room-bg": "#1c1c1c",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        orbitron: ["Outfit", "sans-serif"],
        space: ["Outfit", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'spin-reverse': 'spin-reverse 14s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
