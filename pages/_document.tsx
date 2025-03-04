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

          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css" />

          <meta property="og:locale" content="en_US" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Poly Haven" />
          <meta content="text/html;charset=utf-8" httpEquiv="Content-Type" />
          <meta content="utf-8" httpEquiv="encoding" />
          <meta name="theme-color" content="rgb(190, 111, 255)" />
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
