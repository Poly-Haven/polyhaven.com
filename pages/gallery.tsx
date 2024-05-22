import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'
import Link from 'next/link'

import IconButton from 'components/UI/Button/IconButton'
import Page from 'components/Layout/Page/Page'
import Gallery from 'components/Gallery/Gallery'

import { MdAdd } from 'react-icons/md'

export default function GalleryPage(props) {
  const { t } = useTranslation(['common', 'gallery'])

  return (
    <Page>
      <Head title={t('gallery:title')} description={t('gallery:description')} url="/gallery" />
      <h1
        style={{
          textAlign: 'center',
          marginTop: '1.5em',
          marginBottom: 0,
        }}
      >
        {t('gallery:title')}
      </h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: '1em',
        }}
      >
        <p>
          <em>{t('gallery:description')}</em>
        </p>
        <Link href={`/gallery-submit`} prefetch={false}>
          <IconButton icon={<MdAdd />} label={t('gallery:add')} />
        </Link>
      </div>
      <Gallery data={props.data} />
    </Page>
  )
}

export async function getStaticProps(context) {
  let error = null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const data = await fetch(`${baseUrl}/gallery`)
    .then((response) => response.json())
    .catch((e) => (error = e))

  if (error) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ['common', 'gallery'])) },
      revalidate: 60 * 5, // 5 minutes
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'gallery'])),
      data: data,
    },
    revalidate: 60 * 30, // 30 minutes
  }
}
