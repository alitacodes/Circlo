/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core Circlo Palette
        'circlo-yellow': '#FFD700',
        'circlo-gold': '#FFB800',
        'circlo-white': '#FFFFFF',
        'circlo-black': '#1A1A1A',
        'circlo-neutral-100': '#F2F2F2',
        'circlo-neutral-200': '#EAEAEA',
        'circlo-glass': 'rgba(255, 255, 255, 0.2)',
        'circlo-glass-dark': 'rgba(26, 26, 26, 0.1)',
      },
      fontFamily: {
        'clash': ['Poppins', 'Inter', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'glass': '16px',
        'glass-lg': '24px',
        'glass-xl': '32px',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-sm': '10px',
        'glass-lg': '40px',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(90deg, #FFD700, #FFB800)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(26,26,26,0.1), rgba(26,26,26,0.05))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(255, 255, 255, 0.18)',
        'glass-hover': '0 12px 40px 0 rgba(255, 215, 0, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(26, 26, 26, 0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
};
