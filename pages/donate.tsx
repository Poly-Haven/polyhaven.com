import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation, Trans } from 'next-i18next'

import LinkText from 'components/LinkText/LinkText'
import TextPage from 'components/Layout/TextPage/TextPage'
import Button from 'components/UI/Button/Button'
import DonationBox from 'components/DonationBox/DonationBox'

const Page = () => {
  const { t } = useTranslation(['common', 'donate'])

  return (
    <TextPage title={t('donate:page-title')} description={t('donate:page-description')} url="/donate">
      <h1>{t('donate:page-title')}</h1>
      <p>{t('donate:intro')}</p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DonationBox />
      </div>
      <p>
        <Trans
          i18nKey="donate:p1"
          t={t}
          components={{
            lnk1: <LinkText href="/finance-reports" />,
            lnk2: <a href="https://www.patreon.com/polyhaven/join?cadence=12" />,
          }}
        />
      </p>
      <p>{t('donate:p2')}</p>
      <h2>{t('donate:one-time-t')}</h2>
      <p>{t('donate:d2p')}</p>
      <Button text={t('donate:d2b1')} href="https://paypal.me/polyhaven" />
      <Button text={t('donate:d2b2')} href="https://ko-fi.com/polyhaven" />
      <h2>{t('donate:where-t')}</h2>
      <p>
        <Trans i18nKey="donate:where-p" t={t} components={{ lnk: <LinkText href="/finance-reports" /> }} />
      </p>
      <h2>{t('donate:help-t')}</h2>
      <ul>
        <li>
          <Trans i18nKey="donate:help-corporate" t={t} components={{ lnk: <LinkText href="/corporate" /> }} />
        </li>
        <li>
          <Trans i18nKey="donate:help-contribute" t={t} components={{ lnk: <LinkText href="/contribute" /> }} />
        </li>
        <li>
          <Trans i18nKey="donate:help-translate" t={t} components={{ lnk: <LinkText href="/translate" /> }} />
        </li>
        <li>{t('donate:help-share')}</li>
      </ul>
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'donate'])),
    },
  }
}

export default Page
