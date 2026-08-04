import Head from 'next/head'
import { useRouter } from 'next/router'

import locales from 'utils/locales'

const SITE = 'https://polyhaven.com'

/** Absolute URL for `path` in `locale`. The default locale is served unprefixed. */
const absUrl = (locale: string, defaultLocale: string, path: string) =>
  `${SITE}${locale && locale !== defaultLocale ? `/${locale}` : ''}${path}`

/**
 * og:locale wants language_TERRITORY. utils/locales carries the territory as `flag`,
 * so de + DE becomes de_DE and pt-BR + BR becomes pt_BR.
 */
const ogLocale = (locale: string) => {
  const entry = locales[locale]
  const language = String(locale || 'en').split('-')[0]
  return entry?.flag ? `${language}_${entry.flag}` : language
}

const HeadComponent = ({ title, description, keywords, url, author, assetType, image, noindex, children }) => {
  const router = useRouter()
  const defaultLocale = router?.defaultLocale || 'en'
  const locale = router?.locale || defaultLocale
  // router.locales is the enabled set from next.config; utils/locales also lists
  // languages that are translated but not yet switched on, which must not get hreflang.
  const enabledLocales: string[] = router?.locales || [defaultLocale]

  let defaultKeywords = 'Arch-viz,Game,Unreal,Unity,Blender,Maya,Max,free,cc0,creative commons'
  if (assetType === 0) {
    defaultKeywords = 'hdri,hdri haven,ibl,hdr,environment,exr,' + defaultKeywords
  }
  if (assetType === 1) {
    defaultKeywords = 'texture,pbr,scan,png,exr,material,tileable,seamless,mtlx,' + defaultKeywords
  }
  if (assetType === 2) {
    defaultKeywords = '3D Model,Textured,pbr,gltf,fbx,usd,' + defaultKeywords
  }
  // Self-referencing per locale. Pointing every localised page at the English URL told search
  // engines to drop all 25 non-English versions, so none of the translation work could rank.
  const fullUrl = absUrl(locale, defaultLocale, url)

  // "Poly Haven" alone on the home page, rather than "Poly Haven • Poly Haven".
  const fullTitle = title === 'Poly Haven' ? title : `${title} • Poly Haven`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${keywords}${keywords ? ',' : ''}${defaultKeywords}`} />
      <meta name="author" content={author} />

      {/* "follow" so link equity still flows out to the pages we do want indexed. */}
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="rgb(234, 91, 12)" />

      <link rel="canonical" href={fullUrl} />

      {/* Reciprocal alternates for every enabled locale, plus x-default for unmatched visitors.
          Without these the self-canonicals above would just look like duplicate pages. */}
      {enabledLocales.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={absUrl(l, defaultLocale, url)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={absUrl(defaultLocale, defaultLocale, url)} />

      <meta property="og:locale" content={ogLocale(locale)} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Poly Haven" />
      {image ? <meta property="og:image" content={image} /> : null}

      {/* Twitter tags are `name`, not `property` - `property` is the Open Graph convention.
          Cards fall back to OG, but the card type must match: claiming a large image on a page
          that has none leaves an empty preview. */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:site" content="@polyhaven" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      {children}
    </Head>
  )
}

HeadComponent.defaultProps = {
  description: 'The Public 3D Asset Library',
  keywords: '',
  author: 'Poly Haven',
  assetType: null,
  image: null,
  noindex: false,
  children: null,
}

export default HeadComponent
