import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class CustomDocument extends Document {
  render() {
    const gaTrackingID = 'G-D4YXRFPL5Z'

    return (
      <Html
        dir={['ar', 'fa', 'he'].includes(this.props.locale) ? 'rtl' : 'ltr'}
        style={this.props.locale === 'ar' ? { textAlign: 'right' } : null}
      >
        <Head>
          <link rel="icon" href="/favicon.ico" />

          {/* Every asset preview and grid thumbnail comes from here, including the LCP image,
              so warm the connection instead of paying DNS+TLS when the first <img> is parsed. */}
          <link rel="preconnect" href="https://cdn.polyhaven.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://cdn.polyhaven.com" />

          {/* Next's font optimizer injects its own crossorigin preconnect for gstatic. Font
              requests are CORS-mode, so a preconnect without crossorigin warms a socket they
              cannot reuse - it has to match. */}
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css" />

          {/* og:locale, og:type, og:site_name and theme-color all come from
              components/Head/Head.tsx, which every page renders. Duplicating them here emitted
              each one twice per page, and the theme-color copy was a different colour
              (rgb(190, 111, 255)) that lost to Head's on document order anyway. */}
          <meta content="text/html;charset=utf-8" httpEquiv="Content-Type" />
          <meta content="utf-8" httpEquiv="encoding" />
          <meta property="commit_hash" content={process.env.CONFIG_BUILD_ID} />

          {/* Download service worker */}
          <script src="/download-js/ua-parser.min.js"></script>
          <script src="/download-js/zip.js"></script>
          <script src="/download-js/download.js"></script>
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
