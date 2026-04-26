/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#1B2E1F',
        paper: '#F4F1E8',
        moss: '#4A7C3A',
        mossLt: '#8FB069',
        mossDk: '#2F5524',
        earth: '#C97D5C',
        earthLt: '#E8B89A',
        bark: '#6B4F3A',
        muted: '#5C6B5E',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
