/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        surface: {
          900: '#0f0f1a',
          800: '#14141f',
          700: '#1a1a2e',
          600: '#1e1e35',
          500: '#252545',
        },
        accent: {
          green: '#10b981',
          cyan: '#06b6d4',
          purple: '#a855f7',
          pink: '#ec4899',
          amber: '#f59e0b',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'success-gradient': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          to: { boxShadow: '0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(168,85,247,0.3)' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
