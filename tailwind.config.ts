import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette from Image
        'mashed-potatoes': '#fff2e6', // Primary Background
        'artichoke': '#586357',       // Muted text/borders
        'green-bean': '#052102',      // Deep accents
        'cranberry': '#734141',       // Highlight / Soft CTA
        'cabernet': '#3d0000',        // Deep red accent
        'mulled-wine': '#280d08',     // Darkest text / Primary foreground
        
        background: '#fff2e6', 
        foreground: '#280d08',
      },
      fontFamily: {
        // We will map this to the CSS variable loaded in layout
        heading: ['var(--font-heading)', 'serif'], 
        body: ['var(--font-body)', 'sans-serif'], 
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;