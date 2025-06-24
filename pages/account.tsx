import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation, Trans } from 'next-i18next'
import { useUserPatron } from 'contexts/UserPatronContext'

import Button from 'components/UI/Button/Button'
import Loader from 'components/UI/Loader/Loader'
import TextPage from 'components/Layout/TextPage/TextPage'
import Other from 'components/RewardInfo/Other'
import EarlyAccess from 'components/RewardInfo/EarlyAccess'
import OfflineAccess from 'components/RewardInfo/OfflineAccess'
import Sponsor from 'components/RewardInfo/Sponsor'
import Stakeholder from 'components/RewardInfo/Stakeholder'
import LinkText from 'components/LinkText/LinkText'

const rewardInfo = (r, uuid, patron) => {
  switch (r) {
    case 'Other':
      return <Other uuid={uuid} patron={patron} />
    case 'Early Access':
      return <EarlyAccess />
    case 'Offline Access':
      return <OfflineAccess uuid={uuid} patron={patron} />
    case 'Sponsor':
      return <Sponsor uuid={uuid} patron={patron} />
    case 'Stakeholder':
      return <Stakeholder />
    default:
      return null
  }
}

const Page = () => {
  const { user, isLoading, uuid, patron } = useUserPatron()
  const router = useRouter()
  const returnTo = router.query.returnTo
  const { t } = useTranslation(['common', 'account'])

  if (isLoading)
    return (
      <TextPage title="Account" url="/account">
        <Loader />
      </TextPage>
    )

  if (!user)
    return (
      <TextPage title={t('account:title')} url="/account">
        <h1>{t('account:title')}</h1>
        <p>
          <Trans
            i18nKey="account:login.p1"
            t={t}
            components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" /> }}
          />
        </p>
        <p>{t('account:login.p2')}</p>
        <ul>
          <li>{t('account:login.li2')}</li>
          <li>{t('account:login.li3')}</li>
          <li>{t('account:login.li4')}</li>
        </ul>
        <Button text={t('account:title')} href={`/api/auth/login${returnTo ? `?returnTo=${returnTo}` : ''}`} />
      </TextPage>
    )

  if (!Object.keys(patron).length) {
    return (
      <TextPage title={t('account:account')} url="/account">
        <Loader />
      </TextPage>
    )
  }

  if (patron['error']) {
    return (
      <TextPage title={t('account:account')} url="/account">
        <h1>{t('account:account')}</h1>
        <p>
          <Trans i18nKey="account:not-patron" t={t} components={{ lnk: <LinkText href="/about-contact" /> }} />
        </p>
        <p>
          <pre>{JSON.stringify(patron, null, 2)}</pre>
        </p>
      </TextPage>
    )
  }

  if (patron['status'] !== 'active_patron') {
    return (
      <TextPage title={t('account:account')} url="/account">
        <h1>
          {t('account:hi')} {patron['display_name'] || patron['name']}!
        </h1>
        <p>{t('account:not-patron-anymore')}</p>
      </TextPage>
    )
  }

  return (
    <TextPage title={t('account:account')} url="/account">
      <h1 title={uuid} style={{ textAlign: 'center' }}>
        {t('account:hi')} {(patron['display_name'] || patron['name']).trim()}!
      </h1>
      <p>
        <Trans
          i18nKey={`account:support-amount${patron['yearly_pledge'] ? '-yearly' : ''}`}
          t={t}
          values={{ amount: patron['cents'] / 100 }}
        />
      </p>

      {patron['rewards'].length > 0 && (
        <>
          <p>{t('account:reward', { count: patron['rewards'].length })}</p>

          {patron['rewards'].map((r, i) => (
            <div key={i}>{rewardInfo(r, uuid, patron)}</div>
          ))}
        </>
      )}
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'account'])),
    },
  }
}

export default Page
