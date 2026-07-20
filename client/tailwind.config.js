/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0D284D',
        'secondary-green': '#50C878',
        'dark-bg': '#0D1117',
        'dark-surface': '#161B22',
        'accent-orange': '#FF6B35',
        'secondary-blue': '#1E4D7B',
        // New educational colors
        'learning-yellow': '#FCD34D',
        'discovery-purple': '#A78BFA',
        'success-emerald': '#10B981',
        'warning-amber': '#F59E0B',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Poppins', 'sans-serif'],
        'fun': ['Comic Sans MS', 'cursive'], // For playful elements
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'grow': 'grow 0.3s ease-out',
        // Performance-optimized animations
        'smooth-fade': 'smoothFade 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth-slide': 'smoothSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth-scale': 'smoothScale 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth-float': 'smoothFloat 4s ease-in-out infinite',
        'performance-pulse': 'performancePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        grow: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Performance-optimized keyframes
        smoothFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        smoothSlide: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        smoothScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        smoothFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        performancePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [
    // Custom plugin for glassmorphism
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.2)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Performance utilities
        '.gpu-accelerated': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'will-change': 'transform',
        },
        '.smooth-scroll': {
          'scroll-behavior': 'smooth',
          'scroll-padding-top': '5rem',
        },
        '.optimized-blur': {
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'will-change': 'backdrop-filter',
        },
        '.performance-shadow': {
          'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'will-change': 'box-shadow',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 