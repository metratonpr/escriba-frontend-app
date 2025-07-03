// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // <- Use este, como o erro sugere
    autoprefixer: {},
  },
}