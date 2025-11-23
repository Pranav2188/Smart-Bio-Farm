/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
      },
    },
  },
  plugins: [],
}

