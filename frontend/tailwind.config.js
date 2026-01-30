/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary neutrals - "Midnight Calm"
        ink: '#1a1f36',
        slate: '#3d4663',
        mist: '#8892b0',
        cloud: '#f7f8fc',
        paper: '#ffffff',
        
        // Accent colors - Warm & Intentional
        terracotta: {
          50: '#fdf5f2',
          100: '#f9e8e1',
          200: '#f2cfc2',
          300: '#e5a98f',
          400: '#d4815e',
          500: '#c96442',
          600: '#a8533a',
          700: '#8a4232',
          800: '#6e362b',
          900: '#5a2e26',
        },
        sage: {
          50: '#f3f7f5',
          100: '#e8f0ec',
          200: '#cde0d5',
          300: '#a3c7b3',
          400: '#7bab8f',
          500: '#5b8a72',
          600: '#476f5b',
          700: '#3a5a4a',
          800: '#31493d',
          900: '#2a3d34',
        },
        amber: {
          50: '#fdfaf3',
          100: '#faf3e0',
          200: '#f3e3bc',
          300: '#ebcd8a',
          400: '#e0b35a',
          500: '#d4a84b',
          600: '#b8863a',
          700: '#966832',
          800: '#7a532d',
          900: '#654528',
        },
        rose: {
          50: '#fdf6f6',
          100: '#f9eded',
          200: '#f2d8d8',
          300: '#e5b3b3',
          400: '#d38585',
          500: '#b85c5c',
          600: '#9a4848',
          700: '#7d3a3a',
          800: '#683232',
          900: '#572c2c',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'lg': '10px',
        'xl': '14px',
        '2xl': '18px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(26, 31, 54, 0.08)',
        'medium': '0 4px 16px -4px rgba(26, 31, 54, 0.12)',
        'lifted': '0 8px 24px -8px rgba(26, 31, 54, 0.15)',
      },
    },
  },
  plugins: [],
}
