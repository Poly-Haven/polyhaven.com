import { assetTypeName } from 'utils/assetTypeName'

interface AssetStructuredDataProps {
  assetID: string
  data: {
    name: string
    description?: string
    type: number
    authors: { [key: string]: any }
    categories: string[]
    tags: string[]
    date_published: number
    download_count?: number
  }
  files?: { [key: string]: any }
}

const AssetStructuredData = ({ assetID, data, files }: AssetStructuredDataProps) => {
  if (!data) return null

  const assetUrl = `https://polyhaven.com/a/${assetID}`
  const imageUrl = `https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=630&quality=95`

  // Get file formats available
  const fileFormats = files ? Object.keys(files).map((format) => format.toUpperCase()) : []

  // Convert timestamp to ISO date
  const publishedDate = new Date(data.date_published * 1000).toISOString()

  // Get authors as array
  const authors = Object.keys(data.authors).map((authorKey) => ({
    '@type': 'Person',
    name: authorKey,
  }))

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.name,
    description: data.description || `Free ${assetTypeName(data.type, false).toLowerCase()} for 3D projects`,
    url: assetUrl,
    image: imageUrl,
    datePublished: publishedDate,
    author: authors.length === 1 ? authors[0] : authors,
    creator: authors.length === 1 ? authors[0] : authors,
    publisher: {
      '@type': 'Organization',
      name: 'Poly Haven',
      url: 'https://polyhaven.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://polyhaven.com/Logo%20256.png',
      },
    },
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    keywords: [...data.categories, ...data.tags, assetTypeName(data.type, false), '3D', 'free', 'CC0'].join(','),
    genre: assetTypeName(data.type, false),
    category: data.categories,
    additionalType: `https://polyhaven.com/${data.type === 0 ? 'hdris' : data.type === 1 ? 'textures' : 'models'}`,
    isAccessibleForFree: true,
    usageInfo: 'CC0 - Public Domain',
    copyrightNotice: 'Released under CC0 - Public Domain',
  }

  // Add specific properties based on asset type
  if (data.type === 0) {
    // HDRI
    Object.assign(structuredData, {
      '@type': ['CreativeWork', 'ImageObject'],
      contentType: 'image/exr',
      encodingFormat: fileFormats.includes('EXR') ? 'EXR' : 'HDR',
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Asset Type',
          value: 'HDRI Environment',
        },
        {
          '@type': 'PropertyValue',
          name: 'File Formats',
          value: fileFormats.join(', '),
        },
      ],
    })
  } else if (data.type === 1) {
    // Texture
    Object.assign(structuredData, {
      '@type': ['CreativeWork', 'ImageObject'],
      contentType: 'image/png',
      encodingFormat: 'PNG',
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Asset Type',
          value: 'PBR Texture Set',
        },
        {
          '@type': 'PropertyValue',
          name: 'File Formats',
          value: fileFormats.join(', '),
        },
        {
          '@type': 'PropertyValue',
          name: 'Texture Type',
          value: 'Seamless/Tileable',
        },
      ],
    })
  } else if (data.type === 2) {
    // Model
    Object.assign(structuredData, {
      '@type': ['CreativeWork', '3DModel'],
      encodingFormat: fileFormats.includes('GLTF') ? 'GLTF' : fileFormats.includes('FBX') ? 'FBX' : '3D Model',
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Asset Type',
          value: '3D Model',
        },
        {
          '@type': 'PropertyValue',
          name: 'File Formats',
          value: fileFormats.join(', '),
        },
        {
          '@type': 'PropertyValue',
          name: 'Texturing',
          value: 'PBR Textured',
        },
      ],
    })
  }

  // Add download count if available
  if (data.download_count) {
    Object.assign(structuredData, {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/DownloadAction',
        userInteractionCount: data.download_count,
      },
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

export default AssetStructuredData
