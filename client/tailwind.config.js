/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
      }
    },
  },
  plugins: [],
}
