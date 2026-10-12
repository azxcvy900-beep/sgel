/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crypta: {
          pink: '#ec1368',
          pinkHover: '#d91b5c',
          pinkDark: '#a20d43',
          yellow: '#f6c324',
          yellowHover: '#e0af18',
          black: '#000000',
          dark: '#08080a',
          card: '#121316',
          border: '#22242a',
          locked: '#181a1f'
        }
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
        display: ['Amiri', 'serif'],
        mono: ['Courier Prime', 'monospace'],
      },
      boxShadow: {
        'pink-glow': '0 0 25px rgba(236, 19, 104, 0.45)',
        'yellow-glow': '0 0 25px rgba(246, 195, 36, 0.35)',
        'card-shelf': '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
