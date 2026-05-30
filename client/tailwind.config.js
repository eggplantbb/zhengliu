/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7F3EB',
          card: '#FDFBF7',
        },
        ink: {
          DEFAULT: '#1A1612',
          muted: '#6B6358',
        },
        crimson: {
          DEFAULT: '#B91C1C',
          dark: '#991B1B',
        },
        rule: '#E8DFD0',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Songti SC', 'serif'],
        sans: ['"PingFang SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slip-up': 'slipUp 0.5s ease-out forwards',
        'tube-shake': 'tubeShake 0.3s ease-in-out',
      },
      keyframes: {
        slipUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        tubeShake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' },
        },
      },
    },
  },
  plugins: [],
};
