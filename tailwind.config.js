/**
 * IsaacOriginals — Tailwind config
 *
 * The site currently loads Tailwind via CDN (see each .html file) so you can
 * deploy with zero build step. If/when you want a smaller production bundle,
 * install Tailwind locally (see README.md "Production build") and this config
 * will be used by the compiler.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './assets/**/*.{html,js}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink:  { DEFAULT: '#F5F1EA', muted: '#8A847A' },
        bg:   { DEFAULT: '#0F0F0F', soft: '#151515', line: '#2A2723' },
        gold: { DEFAULT: '#D4A24C', deep: '#A6763C', ember: '#E8B56A' },
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
    },
  },
  plugins: [],
};
