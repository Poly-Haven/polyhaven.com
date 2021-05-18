const nextBuildId = require('next-build-id')

module.exports = {
  images: {
    domains: ['cdn.polyhaven.com'],
  },
  generateBuildId: () => nextBuildId({ dir: __dirname }),
  webpack: (config, { webpack, buildId, isServer }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.CONFIG_BUILD_ID': JSON.stringify(buildId)
      })
    );
    return config;
  },
  future: {
    webpack5: true,
  },
  async redirects() {
    return [
      {
        source: '/support-us',
        destination: 'https://www.patreon.com/hdrihaven/overview',
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
        destination: 'https://blog.hdrihaven.com',
        permanent: true,
      },
    ]
  },
}
