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
        sans: ["monospace"],
        serif: ["monospace"],
        mono: ["monospace"],
        orbitron: ["monospace"],
        space: ["monospace"],
        outfit: ["monospace"],
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
