import Head from 'next/head'

const HeadComponent = ({ title, description, keywords, url, author, assetType, image, children }) => {
  let defaultKeywords = "Arch-viz,Game,Unreal,Unity,Blender,Maya,Max,free,cc0,creative commons"
  if (assetType === 0) {
    defaultKeywords = "hdri,ibl,hdr,environment,exr," + defaultKeywords
  }
  if (assetType === 1) {
    defaultKeywords = "texture,pbr,scan,png,exr," + defaultKeywords
  }
  if (assetType === 2) {
    defaultKeywords = "3D Model,Textured,pbr,gltf," + defaultKeywords
  }
  const fullUrl = "https://polyhaven.com" + url
  return (
    <Head>
      <title>{title}{title !== 'Poly Haven' ? ` • Poly Haven` : ''}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${keywords}${keywords ? ',' : ''}${defaultKeywords}`} />
      <meta name="author" content={author} />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="rgb(234, 91, 12)" />

      <link rel="canonical" href={fullUrl} />

      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${title} • Poly Haven`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Poly Haven" />
      {image ? <meta property="og:image" content={image} /> : null}
      {children}
    </Head>
  )
}

HeadComponent.defaultProps = {
  description: "The Public 3D Asset Library",
  keywords: "",
  author: "Poly Haven",
  assetType: null,
  image: null,
  children: null
}

export default HeadComponent
