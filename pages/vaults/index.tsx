import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getImageVersions } from 'utils/imageVersions'
import { cdnUrl } from 'utils/cdn'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import VaultLanding from 'components/Vaults/VaultLanding'
import { vaultsByStatus } from 'utils/vaults'

export default function CollectionsPage({ vaults, imageVersions }) {
  const { t } = useTranslation(['common', 'vaults'])
  // The social image should show a vault you can still fund, not one already released.
  const firstVault = Object.keys(vaultsByStatus(vaults, 'locked'))[0] || Object.keys(vaults)[0]

  return (
    <Page>
      <Head
        title="The Vaults"
        description="Support the future of free assets and unlock The Vaults"
        url="/vaults"
        image={cdnUrl(`vaults/${firstVault}.png`, { width: 580, quality: 95 }, imageVersions?.[`vaults/${firstVault}.png`])}
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
      // Non-asset image versions for _app's ImageVersionsProvider. Fetched here rather than per
      // pageview: getStaticProps runs at build time and on revalidation only.
      imageVersions: await getImageVersions(['vaults']),
      vaults: vaults,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  }
}
