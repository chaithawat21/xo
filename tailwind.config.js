/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': {'max':'375px'},
        'md': {'max':'860px'},
      },
    },
  },
  plugins: [],
}

