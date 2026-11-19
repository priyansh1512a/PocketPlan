/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark-theme inverted ramps: low numbers are dark surfaces, high numbers are light text
        purple: {
          50: '#161020',
          100: '#211832',
          200: '#372a4e',
          300: '#7a6b9b',
          400: '#a99cc9',
          500: '#c0aef0',
          600: '#cbb9f5',
          700: '#d8cbfa',
          800: '#ebe5fa',
          900: '#f6f2fd',
        },
        mint: {
          50: '#0e1f1c',
          100: '#12302b',
          200: '#1a473f',
          300: '#4fc7a8',
          400: '#63d4b8',
          500: '#2fbf9a',
          600: '#7ce6c9',
          700: '#99eed6',
          800: '#b5f3e2',
          900: '#ccf7ea',
        },
        orange: {
          50: '#241408',
          100: '#2e1a0c',
          200: '#452812',
          300: '#eda35d',
          400: '#f5b06a',
          500: '#f97316',
          600: '#fbb46b',
          700: '#fcc489',
          800: '#fdd3a5',
          900: '#fee2c1',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0, 0, 0, 0.35)',
        lift: '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
