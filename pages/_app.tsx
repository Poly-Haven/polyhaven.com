import { useEffect } from "react";
import Link from 'next/link';
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";

import Layout from 'components/Layout/Layout'

import 'styles/globals.scss'

function MyApp({ Component, pageProps }) {
  const consentGranted = () => {
    // @ts-ignore - gtag not detected as a prop of window, since it's declared in _document.tsx
    window.gtag('consent', 'update', {
      'ad_storage': 'granted',
      'analytics_storage': 'granted'
    });
  }

  useEffect(() => {
    const isConsent = getCookieConsentValue();
    if (isConsent === "true") {
      consentGranted();
    }
  }, []);

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>

      <CookieConsent
        onAccept={consentGranted}
        buttonText="Got it!"
        style={{
          background: "rgb(190, 111, 255)",
          alignItems: "center",
          padding: "1em",
          width: "auto"
        }}
        buttonStyle={{
          fontSize: "1.1em",
          padding: "0.7em 1em",
          fontWeight: "bold"
        }}
      >
        This website uses cookies to enhance the user experience. <Link href="/privacy"><a style={{ color: "white", textDecoration: "underline" }}>Learn more.</a></Link>
      </CookieConsent>
    </>
  )
}

export default MyApp
