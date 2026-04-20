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
          DEFAULT: '#00a8b5', // Turquoise principal
          hover: '#33bfc9',    // Turquoise clair pour hover
          light: '#d4f4f7',    // Bleu très clair pour backgrounds
          dark: '#008792',     // Turquoise foncé pour contraste
          50: '#f0fdff',       // Ultra clair
          100: '#d4f4f7',      
          500: '#00a8b5',      
          600: '#008792',      
          700: '#006670',      
        },
        secondary: {
          DEFAULT: '#003d5c',  // Bleu foncé principal
          hover: '#005580',    // Bleu foncé hover
          light: '#e6f1f8',    // Bleu foncé très clair
          dark: '#002740',     // Bleu foncé très foncé
          50: '#f8fbff',       
          100: '#e6f1f8',      
          600: '#003d5c',      
          700: '#002740',      
          800: '#001a2e',      
        },
        // Suppression des couleurs "text" qui créaient confusion
        status: {
          available: '#10b981', // Vert - En stock
          alert: '#F59E0B',     // Orange - Stock faible
          error: '#ef4444',     // Rouge - Rupture
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      fontWeight: {
        'semibold': '600',
      },
    },
  },
  plugins: [],
}

export default config