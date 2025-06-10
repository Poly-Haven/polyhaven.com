import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import VaultLanding from 'components/Vaults/VaultLanding'

export default function CollectionsPage({ vaults }) {
  const { t } = useTranslation(['common', 'vaults'])
  const firstVault = Object.keys(vaults)[0]

  return (
    <Page>
      <Head
        title="The Vaults"
        description="Support the future of free assets and unlock The Vaults"
        url="/vaults"
        image={`https://cdn.polyhaven.com/vaults/${firstVault}.png?width=580`}
      />
      <VaultLanding vaults={vaults} />
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

export async function getStaticProps({ locale }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  let error = null

  const vaults = await fetch(`${baseUrl}/vaults`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'vaults'])),
      vaults: vaults,
    },
    revalidate: 60 * 60 * 2, // 2 hours
  }
}
