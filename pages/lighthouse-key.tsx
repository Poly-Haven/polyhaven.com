import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useUser } from '@auth0/nextjs-auth0/client'

import Page from 'components/Layout/Page/Page'
import CenteredPage from 'components/Layout/Page/CenteredPage'
import Button from 'components/UI/Button/Button'
import Loader from 'components/UI/Loader/Loader'

import styles from 'components/LighthouseKey/LighthouseKey.module.scss'

// Unlisted Project Lighthouse Steam key claim page for patrons. Linked only from Patreon: no nav link,
// not in the sitemap, noindex. English only, hard-coded rather than in i18nexus, so translators aren't
// notified about it. While claims are switched off it renders the same as the 404 page.
// Design: info/steam_key_claims_plan.md (Poly Haven root).

const STEAM_URL = 'https://store.steampowered.com/app/4162610/Project_Lighthouse/'
const redeemUrl = (key: string) => `https://store.steampowered.com/account/registerkey?key=${encodeURIComponent(key)}`

type Status = {
  state: string
  key?: string
  test?: boolean
  would_be?: string
  terms?: { version: string; text: string }
}

const post = async (body: object): Promise<Status> => {
  try {
    const res = await fetch('/api/lighthouseKey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch {
    return { state: 'error' }
  }
}

const REASONS = {
  not_patron: (
    <p>
      We couldn't find a Patreon membership for this account. Keys are for our patrons; if you think this is wrong,
      please <a href="/about-contact">get in touch</a>.
    </p>
  ),
  not_active: <p>Your Patreon membership isn't active at the moment. Keys are for current patrons.</p>,
  under_minimum: (
    <p>
      Keys are for patrons who have paid at least $3 in total. If you've only just joined, your first payment can take
      a little while to show up here, so please try again later.
    </p>
  ),
  joined_too_late: <p>Keys are for patrons who joined before the game's release on 27 March 2027.</p>,
}

const NotFound = () => (
  <CenteredPage>
    <Head>
      <title>¯\_(ツ)_/¯</title>
      <meta name="description" content="Page not found." />
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    <h1>404</h1>
    <p>Page Not Found</p>
  </CenteredPage>
)

const LighthouseKeyPage = () => {
  const { user, isLoading } = useUser()
  const [status, setStatus] = useState<Status | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    // Logged in: ask for this person's status directly, since testers and people who already claimed get an
    // answer even while claims are closed. Logged out: only show a login button if claims are open.
    if (user) {
      setStatus(await post({ action: 'status' }))
    } else {
      const open = await post({ action: 'open' })
      setStatus({ state: open.state === 'not_found' || !(open as any).open ? 'not_found' : 'logged_out' })
    }
  }, [user])

  useEffect(() => {
    if (!isLoading) load()
  }, [isLoading, load])

  const claim = async () => {
    setClaiming(true)
    setNotice(null)
    const res = await post({ action: 'claim', terms_version: status?.terms?.version })
    if (res.state === 'busy' || res.state === 'error') {
      setNotice(
        res.state === 'busy'
          ? 'Lots of people are claiming right now. Please try again in a moment.'
          : 'Something went wrong. Please try again in a minute.'
      )
    } else if (res.state === 'terms_changed') {
      setAgreed(false)
      setNotice('The terms have changed since this page loaded. Please read them again.')
      setStatus({ ...res, state: 'eligible' })
    } else {
      setStatus(res)
    }
    setClaiming(false)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(status.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (isLoading || !status) {
    return (
      <Page>
        {/* No title yet: while claims are closed this becomes the 404 page */}
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className={styles.page}>
          <Loader />
        </div>
      </Page>
    )
  }

  if (status.state === 'not_found') return <NotFound />

  let body = null
  switch (status.state) {
    case 'logged_out':
      body = (
        <>
          <p>Patrons can claim a Steam key for Project Lighthouse. Log in with your Patreon account to get yours.</p>
          <Button text="Log in with Patreon" href="/api/auth/login?returnTo=%2Flighthouse-key" />
        </>
      )
      break
    case 'not_patron':
    case 'not_active':
    case 'under_minimum':
    case 'joined_too_late':
      body = REASONS[status.state]
      break
    case 'claimed_elsewhere':
      body = (
        <p>
          You've already claimed a key through community.polyhaven.com. It's one key per person, so that one is yours.
        </p>
      )
      break
    case 'sold_out':
      body = (
        <>
          <p>All the patron keys have now been claimed. Thank you for supporting us all the same.</p>
          <p>
            You can still <a href={STEAM_URL}>wishlist the game on Steam</a> to hear when it's released.
          </p>
        </>
      )
      break
    case 'eligible':
      body = (
        <>
          <p>As a thank you for supporting Poly Haven, here's a Steam key for Project Lighthouse.</p>
          <div className={styles.terms}>{status.terms?.text}</div>
          <label className={styles.agree}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />I agree
          </label>
          <div className={agreed && !claiming ? '' : styles.disabled}>
            <Button text={claiming ? 'Claiming...' : 'Claim my key'} onClick={agreed && !claiming ? claim : null} />
          </div>
        </>
      )
      break
    case 'claimed':
      body = (
        <>
          <p>Here's your key. It's yours alone, so please don't share it. You can come back to this page any time to see it again.</p>
          <div className={styles.key}>
            <code>{status.key}</code>
          </div>
          <div className={styles.buttons}>
            <Button text="Redeem on Steam" href={redeemUrl(status.key)} />
            <Button text={copied ? 'Copied' : 'Copy key'} color="hollow" onClick={copy} />
          </div>
        </>
      )
      break
    default:
      body = (
        <>
          <p>Something went wrong. Please try again in a minute.</p>
          <Button text="Try again" onClick={load} />
        </>
      )
  }

  return (
    <Page>
      <Head>
        <title>Project Lighthouse Steam key</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={styles.page}>
        <h1>Project Lighthouse</h1>
        {status.test ? (
          <p className={styles.test}>
            {status.state === 'claimed' ? 'Test key: this one came from the private pool.' : 'Test mode: claims are closed, so your key will come from the private pool.'}
            {status.would_be ? ` As a regular patron you'd be told you aren't eligible (${status.would_be.replace(/_/g, ' ')}).` : ''}
          </p>
        ) : null}
        {notice ? <p className={styles.notice}>{notice}</p> : null}
        {body}
      </div>
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  // English only: no copies under /de/, /fr/ etc.
  if (locale !== 'en') return { notFound: true }
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default LighthouseKeyPage
