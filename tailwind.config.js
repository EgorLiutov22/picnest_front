/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Палитра лендинга picnest.ru
      colors: {
        brand: {
          DEFAULT: '#5830a4',
          soft: '#f0eaf9',
        },
        ink: {
          DEFAULT: '#211a32',
          deep: '#1b1430',
        },
        muted: '#706a7c',
        line: '#e8e4ed',
        surface: '#f8f8fa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        panel: '20px',
      },
      boxShadow: {
        card: '0px 12px 32px 0px rgba(33, 26, 50, 0.06)',
        float: '0px 12px 40px 0px rgba(33, 26, 50, 0.08)',
        brand: '0px 10px 24px 0px rgba(88, 48, 164, 0.15)',
        deep: '0px 24px 48px 0px rgba(0, 0, 0, 0.25)',
      },
      letterSpacing: {
        tightest: '-2.4px',
        tighter2: '-1.5px',
      },
    },
  },
  plugins: [],
};
