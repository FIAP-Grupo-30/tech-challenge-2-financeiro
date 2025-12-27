/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bytebank: {
          green: '#47A138',
          'green-dark': '#3a8a2e',
          'green-light': '#59b449',
          black: '#000000',
          gray: '#CCCCCC',
          'gray-light': '#e4e1e1',
          'gray-medium': '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
