import { useEffect } from 'react'
import { UserProvider } from '@auth0/nextjs-auth0'
import Head from 'next/head'
import Link from 'next/link'
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent'
import { v4 as uuid } from 'uuid'
import { appWithTranslation } from 'next-i18next'

import Layout from 'components/Layout/Layout'

import 'styles/globals.scss'

function MyApp({ Component, pageProps }) {
  const consentGranted = () => {
    // @ts-ignore - gtag not detected as a prop of window, since it's declared in _document.tsx
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
    })
    if (!localStorage.getItem(`uuid`)) {
      localStorage.setItem(`uuid`, uuid())
    }
  }

  useEffect(() => {
    const isConsent = getCookieConsentValue()
    if (isConsent === 'true') {
      consentGranted()
      if (!localStorage.getItem(`uuid`)) {
        localStorage.setItem(`uuid`, uuid())
      }
    }

    if (process.env.NODE_ENV === 'production') {
      console.log(
        `%cHello!
` +
          `%c
Poly Haven is an open source project. This site's git repo is here: ` +
          `%chttps://github.com/Poly-Haven/polyhaven.com` +
          `%c

We have a public API intended to help you integrate our assets into your software/plugin: ` +
          `%chttps://github.com/Poly-Haven/Public-API` +
          `%c, you don't need to try and scrape this site for data :)`,
        'color: rgb(190, 111, 255); font-size: 3em; font-weight: bold',
        '',
        'color: rgb(65, 187, 217); text-decoration:underline',
        '',
        'color: rgb(65, 187, 217); text-decoration:underline',
        ''
      )
    }
  }, [])

  return (
    <>
      <UserProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>

        <CookieConsent
          onAccept={consentGranted}
          buttonText="Got it!"
          style={{
            background: 'rgb(190, 111, 255)',
            alignItems: 'center',
            padding: '1em',
            width: 'auto',
          }}
          buttonStyle={{
            fontSize: '1.1em',
            padding: '0.7em 1em',
            fontWeight: 'bold',
          }}
        >
          This website uses cookies to enhance the user experience.{' '}
          <Link href="/privacy">
            <a style={{ color: 'white', textDecoration: 'underline' }}>Learn more.</a>
          </Link>
        </CookieConsent>
      </UserProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
