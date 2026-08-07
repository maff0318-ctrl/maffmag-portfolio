/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimalist palette with softer tones
        'minimal': {
          white: '#FFFFFF',
          black: '#000000',
          dark: '#2C2C2C',
          medium: '#8B8B8B',
          light: '#E8E8E8',
        },
        'accent': {
          DEFAULT: '#4A90E2',
          hover: '#357ABD',
        },
      },
      fontFamily: {
        sans: ['Work Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        // Editorial serif for banner-style headings/subtitles (e.g. Portfolio
        // subtitle, album titles). Includes CJK serif fallbacks so Chinese
        // album titles (e.g. "東京 · 熱") render in the same high-fashion
        // Songti/MingLiU-style serif instead of falling back to the default
        // sans-serif Chinese glyphs.
        serif: [
          'Playfair Display', 'Cormorant Garamond',
          'Noto Serif TC', 'Songti SC', 'MingLiU',
          'Georgia', 'Times New Roman', 'serif',
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.75rem', letterSpacing: '0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.03em' }],
        '3xl': ['2rem', { lineHeight: '2.25rem', letterSpacing: '0.04em' }],
        '4xl': ['2.5rem', { lineHeight: '2.75rem', letterSpacing: '0.05em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '0.06em' }],
      },
      letterSpacing: {
        tighter: '-0.025em',
        tight: '-0.0125em',
        normal: '0',
        wide: '0.025em',   // Subtle, like reference website
        wider: '0.05em',   // Still subtle
        widest: '0.075em', // Not too wide
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '30': '7.5rem',   // 120px
      },
      borderRadius: {
        // Override all radius to 0 for sharp corners
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
      },
      boxShadow: {
        // Minimal shadows
        'minimal': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'minimal-md': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'minimal-lg': '0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
