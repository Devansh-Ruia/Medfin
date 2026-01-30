/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Superlist-inspired color palette
        black: '#000000',
        white: '#ffffff',
        accent: '#10B981',
        'accent-light': '#D1FAE5',
        
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '4xl': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        '2.5xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        '3xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'stagger-1': 'fadeIn 0.4s ease-out 0ms forwards',
        'stagger-2': 'fadeIn 0.4s ease-out 50ms forwards',
        'stagger-3': 'fadeIn 0.4s ease-out 100ms forwards',
        'stagger-4': 'fadeIn 0.4s ease-out 150ms forwards',
        'stagger-5': 'fadeIn 0.4s ease-out 200ms forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      maxWidth: {
        '6xl': '72rem', // 1152px
        '7xl': '80rem', // 1280px
      },
      borderRadius: {
        'xl': '0.75rem', // 12px
        '2xl': '1rem', // 16px
      },
    },
  },
  plugins: [],
}
