const locales = require('./utils/locales')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: Object.keys(locales),
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development'
};