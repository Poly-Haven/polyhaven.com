import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation, Trans } from 'next-i18next';
import { getPatronInfo } from 'utils/patronInfo';

import Button from 'components/Button/Button'
import Loader from 'components/UI/Loader/Loader'
import TextPage from 'components/Layout/TextPage/TextPage'
import Other from 'components/RewardInfo/Other';
import EarlyAccess from 'components/RewardInfo/EarlyAccess';
import OfflineAccess from 'components/RewardInfo/OfflineAccess';
import Sponsor from 'components/RewardInfo/Sponsor';
import Stakeholder from 'components/RewardInfo/Stakeholder';
import LinkText from 'components/LinkText/LinkText';

const rewardInfo = (r, uuid, patron) => {
  switch (r) {
    case "Other":
      return <Other uuid={uuid} patron={patron} />
    case "Early Access":
      return <EarlyAccess />
    case "Offline Access":
      return <OfflineAccess uuid={uuid} patron={patron} />
    case "Sponsor":
      return <Sponsor uuid={uuid} patron={patron} />
    case "Stakeholder":
      return <Stakeholder />
    default:
      return null
  }
}

const Page = () => {
  const { user, isLoading } = useUser();
  const [uuid, setUuid] = useState(null);
  const [patron, setPatron] = useState({});
  const router = useRouter()
  const returnTo = router.query.returnTo
  const { t } = useTranslation(['common', 'account']);

  useEffect(() => {
    if (uuid) {
      getPatronInfo(uuid)
        .then(resdata => {
          setPatron(resdata)
        })
    } else {
      if (user) {
        setUuid(user.sub.split('|').pop())
      }
    }
  }, [user, uuid]);

  if (isLoading) return <TextPage title="Account" url="/account"><Loader /></TextPage>

  if (!user) return (
    <TextPage
      title={t('account:title')}
      url="/account"
    >
      <h1>{t('account:title')}</h1>
      <p><Trans
        i18nKey="account:login.p1"
        t={t}
        components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" /> }}
      /></p>
      <p>{t('account:login.p2')}</p>
      <ul>
        <li>{t('account:login.li1')}</li>
        <li>{t('account:login.li2')}</li>
        <li>{t('account:login.li3')}</li>
        <li>{t('account:login.li4')}</li>
      </ul>
      <Button text={t('account:title')} href={`/api/auth/login${returnTo ? `?returnTo=${returnTo}` : ''}`} />
    </TextPage>
  )

  if (!Object.keys(patron).length) {
    return <TextPage title={t('account:account')} url="/account"><Loader /></TextPage>
  }

  if (patron['error']) {
    return (
      <TextPage title={t('account:account')} url="/account">
        <h1>{t('account:account')}</h1>
        <p><Trans
          i18nKey="account:not-patron"
          t={t}
          components={{ lnk: <LinkText href="/about-contact" /> }}
        /></p>
        <p><pre>{JSON.stringify(patron, null, 2)}</pre></p>
      </TextPage>
    )
  }

  if (patron['status'] !== "active_patron") {
    return (
      <TextPage
        title={t('account:account')}
        url="/account"
      >
        <h1>{t('account:hi')} {patron['display_name'] || patron['name']}!</h1>
        <p>{t('account:not-patron-anymore')}</p>
      </TextPage>
    )
  }

  return (
    <TextPage
      title={t('account:account')}
      url="/account"
    >
      <h1 title={uuid} style={{ textAlign: "center" }}>{t('account:hi')} {(patron['display_name'] || patron['name']).trim()}!</h1>
      <p><Trans
        i18nKey="account:support-amount"
        t={t}
        values={{ amount: patron['cents'] / 100 }}
      /></p>

      {patron['rewards'].length > 0 && <>
        <p>{t('account:reward', { count: patron['rewards'].length })}</p>

        {patron['rewards'].map((r, i) => <div key={i}>{rewardInfo(r, uuid, patron)}</div>)}
      </>}
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'account'])),
    },
  };
}

export default Page