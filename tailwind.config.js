/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          teal: '#35858E',
          sage: '#7DA78C',
          olive: '#C2D099',
          cream: '#E6EEC9',
        }
      },
    },
  },
  plugins: [],
}
