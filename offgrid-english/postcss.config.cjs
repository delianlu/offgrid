const tailwindConfig = require('./tailwind.config.cjs');

module.exports = {
  plugins: [
    require('tailwindcss')(tailwindConfig),
    require('autoprefixer'),
  ],
}
