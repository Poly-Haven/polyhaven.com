const locales = require('./utils/locales')
const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: Object.keys(locales),
    localePath: path.resolve('./public/locales'),
    localeDetection: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
