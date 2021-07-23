const production = process.env.NODE_ENV === 'production';
const colors = require('tailwindcss/colors');

module.exports = {
  future: {
    // purgeLayersByDefault: true,
    // removeDeprecatedGapUtilities: true,
  },
  purge: {
    enabled: production,
    content: ['./public/index.html', './src/**/*.svelte'],
    options: {
      defaultExtractor: (content) => [
        ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
        ...(content.match(/(?<=class:)[^=>\/\s]*/g) || []),
      ],
    },
  },
  darkMode: false, // or 'media' or 'class'
  /*theme: {
      colors: {
        ...colors,
        gray: colors.trueGray,
      },
  },*/
  variants: {
    extend: {},
  },
  plugins: [],
};
