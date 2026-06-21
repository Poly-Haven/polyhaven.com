import { useState, useEffect } from 'react'
import { GLTF, GLTFLoader } from 'three-stdlib'
import { MeshStandardMaterial } from 'three'

interface APIDataItem {
  readonly url: string
  readonly size: number
  readonly md5: string
}

interface GLTFResolution extends APIDataItem {
  readonly include: { [s: string]: APIDataItem }
}

export interface GLTFFiles {
  readonly '1k'?: { gltf: GLTFResolution }
  readonly '2k'?: { gltf: GLTFResolution }
  readonly '4k'?: { gltf: GLTFResolution }
  alpha?: APIDataItem
}

// 1x1 transparent PNG so GLTFLoader skips texture fetches in the first pass.
const STUB_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const buildMappedGLTF = (data: any, res: GLTFResolution, alpha: APIDataItem | undefined, stubTextures: boolean) => ({
  ...data,
  images: data.images.map((img: { uri: string }) => {
    if (alpha && (img.uri.endsWith('_diff_4k.jpg') || img.uri.endsWith('_diff_2k.jpg') || img.uri.endsWith('_diff_1k.jpg'))) {
      return stubTextures ? { ...img, mimeType: 'image/png', uri: STUB_PNG } : { ...img, mimeType: 'image/png', uri: alpha.url }
    }
    return stubTextures
      ? { ...img, mimeType: 'image/png', uri: STUB_PNG }
      : { ...img, uri: res.include[img.uri].url }
  }),
  buffers: data.buffers.map((buf: { uri: string }) => ({
    byteLength: res.include[buf.uri].size,
    uri: res.include[buf.uri].url,
  })),
  // When stubbing, force matte white so the model doesn't look fully metallic.
  materials: stubTextures
    ? data.materials?.map((mat: any) => ({
        ...mat,
        pbrMetallicRoughness: {
          ...mat.pbrMetallicRoughness,
          metallicFactor: 0,
          roughnessFactor: 1,
          metallicRoughnessTexture: undefined,
        },
        normalTexture: undefined,
        occlusionTexture: undefined,
      }))
    : data.materials,
})

const applyAOMaps = (gltf: GLTF) => {
  gltf.scene.traverse((obj: any) => {
    if (!obj.isMesh) return
    const mat = obj.material as MeshStandardMaterial
    if (mat && !mat.aoMap && mat.roughnessMap) {
      mat.aoMap = mat.roughnessMap
      mat.aoMap.channel = 0 // red channel of ARM texture
      mat.aoMapIntensity = 1
      mat.needsUpdate = true
    }
  })
}

export interface ProgressiveGLTF {
  gltf: GLTF | undefined
  texturesLoaded: boolean
}

export const useGLTFFromAPI = (files: GLTFFiles): ProgressiveGLTF => {
  const [gltf, setGltf] = useState<GLTF>()
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  const initialRes = (files['1k'] ?? files['2k'] ?? files['4k'])!
  const finalRes = (files['4k'] ?? files['2k'] ?? files['1k'])!

  useEffect(() => {
    let cancelled = false

    fetch(initialRes.gltf.url)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return

        // Phase 1
        const loader = new GLTFLoader()
        loader.parse(
          JSON.stringify(buildMappedGLTF(data, initialRes.gltf, files.alpha, true)),
          'https://dl.polyhaven.com/',
          (parsed) => {
            if (cancelled) return
            setGltf(parsed)

            // Phase 2: re-parse with real textures and swap the scene.
            const loadFull = (fullData: any) => {
              if (cancelled) return
              const fullLoader = new GLTFLoader()
              fullLoader.parse(
                JSON.stringify(buildMappedGLTF(fullData, finalRes.gltf, files.alpha, false)),
                'https://dl.polyhaven.com/',
                (fullParsed) => {
                  if (!cancelled) {
                    applyAOMaps(fullParsed)
                    setGltf(fullParsed)
                    setTexturesLoaded(true)
                  }
                }
              )
            }

            if (finalRes.gltf.url === initialRes.gltf.url) {
              loadFull(data)
            } else {
              fetch(finalRes.gltf.url)
                .then((r) => r.json())
                .then(loadFull)
            }
          }
        )
      })

    return () => {
      cancelled = true
    }
  }, [initialRes.gltf.url])

  return { gltf, texturesLoaded }
}
