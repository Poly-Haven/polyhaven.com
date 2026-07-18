const nextBuildId = require('next-build-id')
const { i18n } = require('./next-i18next.config')

module.exports = {
  i18n,
  // Lets a one-off verification build (e.g. CLAUDE_VERIFY_BUILD=1 npm run build) use its own output dir,
  // so it doesn't clobber the .next used by an already-running `next dev` server.
  distDir: process.env.CLAUDE_VERIFY_BUILD ? '.next-verify' : '.next',
  staticPageGenerationTimeout: 300,
  images: {
    domains: ['cdn.polyhaven.com'],
  },
  generateBuildId: () => nextBuildId({ dir: __dirname }),
  webpack: (config, { webpack, buildId, isServer }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.CONFIG_BUILD_ID': JSON.stringify(buildId),
      })
    )
    return config
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/support-us',
        destination: 'https://www.patreon.com/polyhaven/join?cadence=12',
        permanent: true,
      },
      {
        source: '/facebook',
        destination: 'https://www.facebook.com/polyhaven',
        permanent: true,
      },
      {
        source: '/twitter',
        destination: 'https://twitter.com/polyhaven',
        permanent: true,
      },
      {
        source: '/blog',
        destination: 'https://blog.polyhaven.com',
        permanent: true,
      },
      {
        source: '/:locale/faq',
        destination: 'https://docs.polyhaven.com/:locale/faq',
        permanent: true,
        locale: false,
      },
    ]
  },
}
