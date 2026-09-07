import React, { createContext, useContext, useMemo } from 'react'

import { cdnUrl, CdnParams } from 'utils/cdn'
import type { ImageVersions } from 'utils/imageVersions'

// Populated from pageProps by _app, for the pages whose getStaticProps fetched the manifest. Any
// page that does not is not broken: the context stays empty and every URL comes out unversioned,
// which is exactly how the site behaved before versioning existed.
const ImageVersionsContext = createContext<ImageVersions>({})

export const ImageVersionsProvider: React.FC<{ versions?: ImageVersions; children: React.ReactNode }> = ({
  versions,
  children,
}) => {
  // Identity-stable so a new object literal per render doesn't invalidate every consumer.
  const value = useMemo(() => versions || {}, [versions])
  return <ImageVersionsContext.Provider value={value}>{children}</ImageVersionsContext.Provider>
}

// The hook components should reach for: takes a raw storage path and returns a versioned CDN URL.
//
//   const siteImg = useSiteImg()
//   <img src={siteImg('site_images/home/window_rend.jpg', { width: 630, quality: 95 })} />
export const useSiteImg = () => {
  const versions = useContext(ImageVersionsContext)
  return (path: string, params?: CdnParams) => cdnUrl(path, params, versions[path])
}

// For the rarer case of needing the bare version, e.g. to hand to a component that builds its own
// URL or to a CSS custom property.
export const useImageVersion = (path: string): string | undefined => useContext(ImageVersionsContext)[path]

export default ImageVersionsContext
