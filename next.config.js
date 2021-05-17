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
}
