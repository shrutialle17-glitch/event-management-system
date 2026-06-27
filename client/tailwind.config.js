/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: { 
          DEFAULT: '#10B981', 
          dark: '#059669', 
          light: '#34D399' 
        },
        secondary: { 
          DEFAULT: '#06B6D4', 
          dark: '#0891B2', 
          light: '#67E8F9' 
        },
        accent: { 
          DEFAULT: '#6366F1', 
          dark: '#4F46E5', 
          light: '#818CF8' 
        },
        background: '#F8FAFC',
        card: '#FFFFFF',
        text: '#0F172A',
        textMuted: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(15, 23, 42, 0.05)',
        'soft-hover': '0 10px 40px rgba(15, 23, 42, 0.08)',
        'button': '0 4px 14px rgba(16, 185, 129, 0.25)',
        'button-hover': '0 6px 20px rgba(16, 185, 129, 0.35)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'skeleton': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
