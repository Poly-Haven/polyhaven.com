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
  // Stated explicitly on purpose. Left undefined, i18next guesses whether a key is a namespace
  // path or natural-language text, and any key containing a space, comma, ? ! or ; is assumed to
  // be natural language - so `t('library:Clear author')` never has its namespace stripped and the
  // raw key reaches the UI. Setting these marks them user-defined, which disables that guess.
  keySeparator: '.',
  nsSeparator: ':',
  // Without this, next-i18next walks public/locales with readdirSync plus a statSync per file on
  // every serverSideTranslations call and again on every _app render, which adds up to well over a
  // hundred thousand pointless syscalls across a full build. Keep in sync with public/locales/en.
  // Listed literally rather than read from disk because pages/api/revalidate.ts imports this file,
  // and Vercel does not reliably bundle public/ into serverless functions.
  ns: [
    'about',
    'account',
    'asset',
    'categories',
    'collections',
    'common',
    'donate',
    'faq',
    'gallery',
    'home',
    'library',
    'license',
    'time',
    'vaults',
  ],
}
