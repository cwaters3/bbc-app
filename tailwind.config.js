/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moss: { DEFAULT: '#5C7A5C', dark: '#4A6449', tint: '#EAF0E8' },
        apricot: { DEFAULT: '#E0A878', dark: '#C98C5C', tint: '#FBF0E5' },
        danger: { DEFAULT: '#C1554A', tint: '#FBEAE7' },
        bg: '#FAF9F6',
        card: '#FFFFFF',
        border: '#E8E6DF',
        ink: '#2A2A28',
        muted: { DEFAULT: '#7C7A70', 2: '#A6A398' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Lobster', 'cursive'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,18,12,0.04), 0 10px 24px -10px rgba(20,18,12,0.18)',
        sm2: '0 1px 2px rgba(20,18,12,0.03), 0 4px 12px -6px rgba(20,18,12,0.10)',
      },
    },
  },
  plugins: [],
};
