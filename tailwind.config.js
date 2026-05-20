/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10b981", // Emerald 500
        secondary: "#047857", // Emerald 700
        background: "#f0fdf4", // Emerald 50
        darkBg: "#064e3b", // Emerald 900
      }
    },
  },
  plugins: [],
}
