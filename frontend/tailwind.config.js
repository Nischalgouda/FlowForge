/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        canvas: {
          dark: '#030303', // Deep black for modern AI feel
          mid: '#0A0A0A',  // Slightly lighter
          card: '#111111', // Card background
          border: '#222222', // Subtle borders
        },
        brand: {
          purple: '#8A2BE2',
          pink: '#FF1493',
          blue: '#4169E1'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #8A2BE2, #FF1493)',
      },
      boxShadow: {
        'node': '0 4px 24px rgba(0,0,0,0.4)',
        'node-hover': '0 0 20px rgba(138,43,226,0.4)',
        'brand-glow': '0 0 15px rgba(255,20,147,0.5)',
      }
    },
  },
  plugins: [],
}
