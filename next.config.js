const nextBuildId = require('next-build-id')
const { i18n } = require('./next-i18next.config')

module.exports = {
  i18n,
  // Lets a one-off verification build (e.g. CLAUDE_VERIFY_BUILD=1 npm run build) use its own output dir,
  // so it doesn't clobber the .next used by an already-running `next dev` server.
  distDir: process.env.CLAUDE_VERIFY_BUILD ? '.next-verify' : '.next',
  staticPageGenerationTimeout: 300,
  // Nothing uses next/image (images are resized by Bunny from cdn URLs), so turn the optimizer off:
  // with a domain allowed, /_next/image was a public endpoint anyone could run billed optimizations
  // through, and it is where Next's image-processing advisories live.
  images: {
    unoptimized: true,
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
      // Placeholder index pages. Redirecting here instead of from getServerSideProps saves a function
      // invocation per hit. These only catch full page loads (external links, typed URLs): config
      // redirects are not applied to client-side navigation, which would route /learn into the
      // [...assets] catch-all and 404. So in-app links must point straight at the destination.
      {
        // Unused for now: there is only one course. Turn into a real course list when there's more.
        source: '/learn',
        destination: '/learn/photogrammetry',
        permanent: false,
      },
      {
        // Unused for now: there is only one plugin.
        source: '/plugins',
        destination: '/plugins/blender',
        permanent: false,
      },
      {
        // The Unreal HDRI Browser plugin has been removed.
        source: '/plugins/unreal',
        destination: '/tools',
        permanent: false,
      },
      {
        // Agents probe for this. The spec lives on the API host.
        source: '/openapi.json',
        destination: 'https://api.polyhaven.com/api-docs/swagger.json',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        // RFC 9727. With no file extension it would otherwise be served as application/octet-stream.
        source: '/.well-known/api-catalog',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
          },
        ],
      },
      {
        // Unlisted Steam key page for patrons; the meta tag only exists once the client has rendered.
        source: '/lighthouse-key',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}
