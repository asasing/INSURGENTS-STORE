/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#000000', // Black for light mode
          dark: '#ffffff'   // White for dark mode
        },
        background: {
          light: '#ffffff',    // White background
          dark: '#0a0a0a'      // Near-black for dark mode
        },
        text: {
          light: '#171717',    // Near-black text
          dark: '#f5f5f5'      // Off-white text
        },
        accent: {
          light: '#404040',    // Dark gray accent
          dark: '#d4d4d4'      // Light gray accent
        }
      }
    },
  },
  plugins: [],
}

