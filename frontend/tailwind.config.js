/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serifDisplay: ['"Playfair Display"', 'serif'], // For headings like "Experience"
        sansUI: ['Inter', 'sans-serif'],               // For inputs, nav, buttons
      },
    },
  },
  plugins: [],
}