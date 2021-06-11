import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class CustomDocument extends Document {
  render() {
    const gaTrackingID = 'G-D4YXRFPL5Z';

    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />

          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css" />

          <meta property="og:locale" content="en_US" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Poly Haven" />
          <meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
          <meta content="utf-8" http-equiv="encoding" />
          <meta name="theme-color" content="rgb(190, 111, 255)" />

          {/* Download service worker */}
          <script src="/download-js/ua-parser.min.js"></script>
          <script src="/download-js/zip.js"></script>
          <script src="/download-js/download.js"></script>

          {/* Global site tag (gtag.js) - Google Analytics */}
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingID}`}></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            testvar = "Yep!";

            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied'
            });

            gtag('js', new Date());
            gtag('config', '${gaTrackingID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </Head>

        <body>
          <Main />
          <NextScript />

        </body>
      </Html>
    )
  }
}