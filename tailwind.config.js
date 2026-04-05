/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ajusta esto si tus carpetas tienen otros nombres
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0066FF',
        'dark-surface': '#0D0D0D',
      },
    },
  },
  plugins: [],
}