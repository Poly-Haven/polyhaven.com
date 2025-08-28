import { assetTypeName } from 'utils/assetTypeName'
import { titleCase } from 'utils/stringUtils'

interface CategoryStructuredDataProps {
  assetType: string
  categories: string[]
}

const CategoryStructuredData = ({ assetType, categories }: CategoryStructuredDataProps) => {
  const baseUrl = 'https://polyhaven.com'
  const categoryPath = categories.length > 0 ? `/${categories.join('/')}` : ''
  const pageUrl = `${baseUrl}/${assetType}${categoryPath}`

  // Build page title
  let title = assetTypeName(assetType === 'all' ? null : assetType)
  if (categories.length > 0) {
    title += `: ${titleCase(categories.join(' > '))}`
  }

  // Build description
  let description = ''
  if (categories.length > 0) {
    description = `Free ${categories[categories.length - 1]} `
  } else {
    if (assetType === 'hdris') {
      description = 'Free HDRI environments'
    } else {
      description = `Free ${assetTypeName(assetType === 'all' ? null : assetType).toLowerCase()}`
    }
  }

  const typeDescriptions = {
    hdris: 'HDRI environments for 3D lighting and backgrounds',
    textures: 'PBR texture sets for 3D materials',
    models: '3D models ready for games and visualization',
    all: 'HDRIs, textures, and 3D models for any 3D project',
  }

  if (categories.length === 0) {
    description = typeDescriptions[assetType] || 'Free 3D assets'
  } else {
    description += typeDescriptions[assetType] || 'assets'
  }

  // Build keywords
  const keywords = [
    ...(categories.length > 0 ? categories : []),
    assetType === 'all' ? 'assets' : assetTypeName(assetType === 'all' ? null : assetType).toLowerCase(),
    '3D',
    'free',
    'CC0',
    'creative commons',
    'download',
  ]

  if (assetType === 'hdris' || assetType === 'all') {
    keywords.push('HDRI', 'environment', 'lighting', 'IBL')
  }
  if (assetType === 'textures' || assetType === 'all') {
    keywords.push('PBR', 'material', 'seamless', 'tileable')
  }
  if (assetType === 'models' || assetType === 'all') {
    keywords.push('3D model', 'mesh', 'geometry')
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Poly Haven',
      url: baseUrl,
      description: 'The Public 3D Asset Library',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Poly Haven',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/Logo%20256.png`,
      },
    },
    keywords: keywords.join(','),
    about: {
      '@type': 'Thing',
      name:
        categories.length > 0
          ? titleCase(categories[categories.length - 1])
          : assetTypeName(assetType === 'all' ? null : assetType),
      description: description,
    },
    mainContentOfPage: {
      '@type': 'WebPageElement',
      description: `Browse and download ${description.toLowerCase()}`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: assetTypeName(assetType === 'all' ? null : assetType),
          item: `${baseUrl}/${assetType}`,
        },
        ...categories.map((category, index) => ({
          '@type': 'ListItem',
          position: index + 3,
          name: titleCase(category),
          item: `${baseUrl}/${assetType}/${categories.slice(0, index + 1).join('/')}`,
        })),
      ],
    },
  }

  // Add specific schema types based on asset type
  if (assetType === 'hdris') {
    Object.assign(structuredData, {
      additionalType: 'https://schema.org/ImageGallery',
      genre: 'HDRI Environment Maps',
    })
  } else if (assetType === 'textures') {
    Object.assign(structuredData, {
      additionalType: 'https://schema.org/ImageGallery',
      genre: 'PBR Texture Sets',
    })
  } else if (assetType === 'models') {
    Object.assign(structuredData, {
      genre: '3D Models',
    })
  } else if (assetType === 'all') {
    Object.assign(structuredData, {
      genre: '3D Assets',
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

export default CategoryStructuredData
