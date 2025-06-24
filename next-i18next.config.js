const locales = require('./utils/locales')
const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: Object.keys(locales),
    localeDetection: false,
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
