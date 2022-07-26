import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation, Trans } from 'next-i18next';

import LinkText from 'components/LinkText/LinkText';
import TextPage from 'components/Layout/TextPage/TextPage'
import Button from 'components/Button/Button';

const Page = () => {
  const { t } = useTranslation(['common', 'donate']);

  return (
    <TextPage
      title={t('donate:title')}
      description={t('donate:description')}
      url="/donate"
    >
      <h1>{t('donate:title')}</h1>
      <p><Trans
        i18nKey="donate:p1"
        t={t}
        components={{
          lnk1: <LinkText href="/finance-reports" />,
          lnk2: <a href="https://www.patreon.com/polyhaven/overview" />,
        }}
      /></p>
      <p>{t('donate:p2')}</p>
      <h2>{t('donate:d1t')}</h2>
      <p><Trans
        i18nKey="donate:d1p"
        t={t}
        components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" />, }}
      /></p>
      <h2>{t('donate:d2t')}</h2>
      <p>{t('donate:d2p')}</p>
      <Button text={t('donate:d2b1')} href="https://paypal.me/polyhaven" />
      <Button text={t('donate:d2b2')} href="https://ko-fi.com/polyhaven" />
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'donate'])),
    },
  };
}

export default Page