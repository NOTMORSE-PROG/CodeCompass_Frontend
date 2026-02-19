/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // TIP College — Yellow + Black palette
          yellow:         '#FFC300',   // Primary TIP yellow
          'yellow-dark':  '#E6A800',   // Hover / pressed states
          'yellow-light': '#FFD966',   // Subtle backgrounds, accents
          'yellow-pale':  '#FFF8DC',   // Very light tint (card backgrounds on white)
          black:          '#0A0A0A',   // TIP near-black
          'black-soft':   '#1A1A1A',   // Cards / sidebar background
          'black-muted':  '#2D2D2D',   // Secondary backgrounds
          'black-border': '#3D3D3D',   // Borders on dark backgrounds
          'gray-warm':    '#F5F0E8',   // Light page background (warm, not cold gray)
          'gray-mid':     '#6B6B6B',   // Muted text
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px #FFC300, 0 0 10px #FFC300' },
          '100%': { boxShadow: '0 0 20px #FFC300, 0 0 30px #FFC300' },
        },
      },
    },
  },
  plugins: [],
}
