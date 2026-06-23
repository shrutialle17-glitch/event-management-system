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
          DEFAULT: 'rgb(var(--role-accent, 16 185 129) / <alpha-value>)', 
          dark: 'rgb(var(--role-accent-dark, 5 150 105) / <alpha-value>)', 
          light: 'rgb(var(--role-accent-light, 52 211 153) / <alpha-value>)' 
        },
        secondary: { DEFAULT: '#14B8A6', dark: '#0D9488', light: '#5EEAD4' },
        accent:    { DEFAULT: '#06B6D4', dark: '#0891B2', light: '#67E8F9' },
        background:'#F8FAFC',
        card:      '#FFFFFF',
        text:      '#0F172A',
        textMuted: '#64748B',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 40px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)',
        'glow': '0 0 30px rgba(16, 185, 129, 0.25)',
        'glow-lg': '0 0 60px rgba(16, 185, 129, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.5)',
        'button': '0 4px 15px rgba(16, 185, 129, 0.3)',
        'button-hover': '0 6px 20px rgba(16, 185, 129, 0.4)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
