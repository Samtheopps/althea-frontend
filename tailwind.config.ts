import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00a8b5', // Turquoise
          hover: '#33bfc9',    // Turquoise clair
          light: '#d4f4f7',    // Bleu très clair
        },
        secondary: {
          DEFAULT: '#003d5c',  // Bleu foncé
          hover: '#005580',
        },
        status: {
          available: '#10b981', // Vert - En stock
          alert: '#F59E0B',     // Orange - Stock faible
          error: '#ef4444',     // Rouge - Rupture
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      fontWeight: {
        'semibold': '600',
      },
    },
  },
  plugins: [],
}

export default config