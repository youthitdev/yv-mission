/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mission: {
          dark: '#1c1c22',
          card: '#26262e',
          accent: '#ffd54a',
        },
      },
    },
  },
  plugins: [],
};
