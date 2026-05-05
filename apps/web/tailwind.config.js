/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'count-up': 'countUp 0.8s ease-out forwards',
        'bar-fill': 'barFill 1s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        barFill: {
          from: { width: '0%' },
          to: { width: 'var(--bar-width)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(59,130,246,0.6)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
