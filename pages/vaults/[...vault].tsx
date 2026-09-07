import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getImageVersions } from 'utils/imageVersions'
import { cdnUrl } from 'utils/cdn'

import Head from 'components/Head/Head'
import Library from 'components/Library/Library'
import { isUpcomingVault } from 'utils/vaults'

import asset_types from 'constants/asset_types.json'

const LibraryPage = (props) => {
  return (
    <>
      <Head
        title={props.vault.name + ' Vault'}
        url={`/vaults/${props.vault.id}`}
        description={props.vault.description}
        assetType={asset_types[props.assetType]}
        image={cdnUrl(
          `vaults/${props.vault.id}.png`,
          { width: 580, quality: 95 },
          props.imageVersions?.[`vaults/${props.vault.id}.png`]
        )}
      />
      <Library
        assetType={props.assetType}
        categoryPath={null}
        vault={props.vault}
        author={props.author}
        search={props.search}
        strictSearch={props.strictSearch}
        sort={props.sort}
      />
    </>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

export async function getServerSideProps(context) {
  const params = context.params.vault
  const vaultID = params.shift()
  const author = context.query.a
  const search = context.query.s
  const strictSearch = context.query.strict
  let sort = context.query.o

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  let error = null

  const vaults = await fetch(`${baseUrl}/vaults`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  // Released vaults keep their page as an archive of what the community unlocked. Upcoming ones
  // have no public existence yet, so they 404 alongside ids that were never vaults at all.
  if (!vaults?.[vaultID] || isUpcomingVault(vaults[vaultID])) {
    return {
      notFound: true,
      props: {
        ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
        // Non-asset image versions for _app's ImageVersionsProvider. Fetched here rather than per
        // pageview: getStaticProps runs at build time and on revalidation only.
        imageVersions: await getImageVersions(['vaults', 'people', 'collections', 'site_images/news_cards']),
      },
    }
  }

  const allowedSorts = ['hot', 'latest', 'top', 'name']
  if (!allowedSorts.includes(sort)) {
    sort = 'hot'
  }

  const vaultData = vaults[vaultID]

  // Cacheable for the same reason as [...assets].tsx: the asset list is fetched client-side, so
  // only the vault's own unlock state is baked in, and admin's unlockVault job purges this path
  // (every locale) when that changes.
  //
  // Cloudflare already caches this for ~4 hours off its own rules, ignoring the origin — measured:
  // cf-cache-status HIT with max-age=14400 while the origin sent no header at all. So do NOT read
  // this as shortening that to an hour; whether the zone honours s-maxage is unverified. What it
  // reliably changes is Vercel's own edge cache, which currently misses on every request.
  context.res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
      assetType: 'all',
      vault: vaultData,
      author: author ? author : '',
      search: search ? search : '',
      strictSearch: strictSearch ? true : false,
      sort: sort ? sort : 'hot',
    },
  }
}

export default LibraryPage
