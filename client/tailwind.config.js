/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      colors: {
        primary: {
          DEFAULT: "#00674F",
          dark: "#00533F",
          light: "#1A8A6C",
        },

        secondary: {
          DEFAULT: "#00533F",
          dark: "#004634",
          light: "#2F8B75",
        },

        accent: {
          DEFAULT: "#008A68",
          dark: "#00674F",
          light: "#42B89B",
        },

        background: "#F8FAFC",
        card: "#FFFFFF",
        text: "#0F172A",
        textMuted: "#64748B",
      },

      backgroundImage: {
        "gradient-primary": 'linear-gradient(135deg,#00674F 0%,#008A68 100%)',

        "gradient-hero":
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)",

        "gradient-card":
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
      },

      boxShadow: {
        card: "0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.04)",

        "card-hover":
          "0 12px 40px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)",

        glow: "0 0 30px rgba(0,103,79,0.25)",

        "glow-lg": "0 0 60px rgba(0,103,79,0.20)",

        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.5)",

        button: 
          "0 4px 15px rgba(0,103,79,.30)",

          "button-hover": "0 8px 24px rgba(0,103,79,.40)",
      },

      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      animation: {
        "fade-in-up": "fadeInUp 0.7s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },

      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(24px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },

        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },

        pulseGlow: {
          "0%,100%": {
            boxShadow: "0 0 20px rgba(0,103,79,0.20)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(0,103,79,0.40)",
          },
        },

        shimmer: {
          "0%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
      },
    },
  },
  plugins: [],
}

