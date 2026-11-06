/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          deep: '#07070F',
          base: '#0A0A16',
        },
        surface: {
          elevated: '#121229',
          highlight: '#1A1A38',
          modal: '#222248',
        },
        brand: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#3B1A7A',
        },
        truth: {
          100: '#CFFAFE',
          400: '#22D3EE',
          500: '#06B6D4',
          700: '#0E7490',
        },
        dare: {
          100: '#FFE4E6',
          400: '#FB7185',
          500: '#FF5C77',
          700: '#BE123C',
        },
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'glow-truth': '0 0 35px -5px rgba(6, 182, 212, 0.35)',
        'glow-dare': '0 0 35px -5px rgba(255, 92, 119, 0.40)',
        'glow-brand': '0 0 40px -5px rgba(139, 92, 246, 0.35)',
        'elevation-1': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'elevation-2': '0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.14)',
        'elevation-3': '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 92, 246, 0.3)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

