/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6',
          dark: '#60a5fa'
        },
        background: {
          light: '#ffffff',
          dark: '#0f172a'
        },
        text: {
          light: '#1f2937',
          dark: '#f3f4f6'
        }
      }
    },
  },
  plugins: [],
}

