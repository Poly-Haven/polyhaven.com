import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import Collections from 'components/Library/Collections/Collections'

export default function HomePage() {
  const { t } = useTranslation(['common', 'collections'])

  return (
    <Page>
      <Head
        title={t('collections:title')}
        description={t('collections:description')}
        url="/"
        image="https://cdn.polyhaven.com/collections/the-shed.png?width=630"
      />
      <Collections />
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'collections'])),
    },
  }
}
