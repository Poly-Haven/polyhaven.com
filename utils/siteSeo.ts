/* ---------------------------------------------------------------------------
 * Site-level identity, emitted once on the home page.
 *
 * The per-page seo modules (assetSeo, librarySeo, courseSeo) describe individual
 * pages; this describes who publishes them. `sameAs` is what lets search engines
 * and answer engines tie polyhaven.com to the same entity as our social profiles,
 * which is the main way an organisation gets recognised as a known publisher.
 * ------------------------------------------------------------------------- */

const SITE = 'https://polyhaven.com'

// Must stay in sync with the profiles actually linked from the footer and header.
const SAME_AS = [
  'https://www.patreon.com/polyhaven',
  'https://x.com/polyhaven',
  'https://www.youtube.com/c/PolyHaven',
  'https://www.instagram.com/polyhaven',
  'https://www.facebook.com/polyhaven',
  'https://masto.ai/@polyhaven',
  'https://github.com/Poly-Haven',
  'https://blog.polyhaven.com',
]

export const SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Poly Haven',
      alternateName: ['HDRI Haven', 'Texture Haven'],
      url: SITE,
      logo: `${SITE}/Logo%20256.png`,
      description:
        'Poly Haven is a public 3D asset library offering free, CC0-licensed HDRIs, PBR textures and 3D models. Funded by donations and sponsorship rather than by selling the assets.',
      sameAs: SAME_AS,
    },
    {
      '@type': 'WebSite',
      // Referenced by `isPartOf` on the library browse pages.
      '@id': `${SITE}/#website`,
      name: 'Poly Haven',
      alternateName: 'The Public 3D Asset Library',
      url: SITE,
      inLanguage: 'en',
      publisher: { '@id': `${SITE}/#organization` },
      // Everything published here is public domain.
      license: 'https://creativecommons.org/publicdomain/zero/1.0/',
      isAccessibleForFree: true,
    },
  ],
}
