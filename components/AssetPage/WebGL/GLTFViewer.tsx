import React, { FC, useReducer, useState, useEffect, useMemo, Suspense } from 'react'
import { Vector3, Quaternion, Box3, CineonToneMapping, Texture, type Texture as ThreeTexture } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, MeshTransmissionMaterial, useFBO } from '@react-three/drei'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

import { MdPublic, MdLayers, MdLanguage, MdNotInterested, MdFullscreen } from 'react-icons/md'

import IconButton from 'components/UI/Button/IconButton'
import { useGLTFFromAPI } from './useGLTFFromAPI'
import {
  reducer as GLTF_Visibility_reducer,
  DefaultState as GLTF_Visibility_reducer_defaultState,
  addMesh,
  MeshState,
} from './GLTF_Visibility_reducer'

import styles from './GLTFViewer.module.scss'

interface Props {
  readonly show: boolean
  readonly assetID: string
  readonly files: { gltf }
  readonly onLoad: Function
}

const linearMaps = ['normalMap', 'emissiveMap', 'metalnessMap', 'roughnessMap', 'aoMap']

const channelVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const channelFragmentShader = `
  uniform sampler2D map;
  uniform int channel;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv);
    float v;
    if (channel == 0) v = c.r;
    else if (channel == 1) v = c.g;
    else v = c.b;
    gl_FragColor = vec4(v, v, v, 1.0);
  }
`

const armChannelIndex = { AO: 0, ROUGHNESS: 1, METALNESS: 2 }
const armTextureName = { AO: 'aoMap', ROUGHNESS: 'roughnessMap', METALNESS: 'metalnessMap' }

interface SceneMeshesProps {
  gltf: any
  soloMap: string
  wireframe: boolean
  maxAnisotropy: number
  transparent: boolean
  transmissionBuffer: ThreeTexture
}

const collectMeshes = (node: any, result: any[] = []): any[] => {
  if (node.type === 'Mesh' && node.material) result.push(node)
  if (node.children) node.children.forEach((c) => collectMeshes(c, result))
  return result
}

const SceneMeshes: FC<SceneMeshesProps> = ({ gltf, soloMap, wireframe, maxAnisotropy, transparent, transmissionBuffer }) => {
  const meshes = useMemo(() => collectMeshes(gltf.scene), [gltf])

  return (
    <>
      {meshes.map((mesh) => {
        const isArmChannel = soloMap === 'AO' || soloMap === 'ROUGHNESS' || soloMap === 'METALNESS'
        const isTransmissive = mesh.material.transmission > 0
        const needsTransparent = transparent || mesh.material.transparent || isTransmissive

        return (
          <React.Fragment key={mesh.uuid}>
            <mesh
              geometry={mesh.geometry}
              position={mesh.getWorldPosition(new Vector3())}
              scale={mesh.getWorldScale(new Vector3())}
              quaternion={mesh.getWorldQuaternion(new Quaternion())}
            >
              {soloMap === '' ? (
                isTransmissive ? (
                  <MeshTransmissionMaterial
                    {...mesh.material}
                    transmission={mesh.material.transmission}
                    roughness={mesh.material.roughness}
                    thickness={mesh.material.thickness ?? 0.5}
                    chromaticAberration={0.03}
                    buffer={transmissionBuffer}
                    samples={6}
                    resolution={256}
                  >
                    {Object.entries(mesh.material).map(([key, value]) =>
                      value instanceof Texture ? (
                        <texture
                          key={key}
                          attach={key}
                          {...value}
                          colorSpace={linearMaps.includes(key) ? 'srgb-linear' : 'srgb'}
                          anisotropy={maxAnisotropy}
                        />
                      ) : null
                    )}
                  </MeshTransmissionMaterial>
                ) : (
                  <meshPhysicalMaterial {...mesh.material} vertexColors={false} transparent={needsTransparent}>
                    {Object.entries(mesh.material).map(([key, value]) =>
                      value instanceof Texture ? (
                        <texture
                          key={key}
                          attach={key}
                          {...value}
                          colorSpace={linearMaps.includes(key) ? 'srgb-linear' : 'srgb'}
                          anisotropy={maxAnisotropy}
                        />
                      ) : null
                    )}
                  </meshPhysicalMaterial>
                )
              ) : isArmChannel ? (
                <shaderMaterial
                  key={soloMap}
                  vertexShader={channelVertexShader}
                  fragmentShader={channelFragmentShader}
                  uniforms={{
                    map: { value: (mesh.material[armTextureName[soloMap]] ?? mesh.material.roughnessMap) ?? null },
                    channel: { value: armChannelIndex[soloMap] },
                  }}
                />
              ) : (
                <meshBasicMaterial>
                  {mesh.material['map'] && soloMap === 'DIFFUSE' && (
                    <texture attach="map" {...mesh.material['map']} anisotropy={maxAnisotropy} />
                  )}
                  {mesh.material['normalMap'] && soloMap === 'NORMAL' && (
                    <texture attach="map" {...mesh.material['normalMap']} anisotropy={maxAnisotropy} />
                  )}
                </meshBasicMaterial>
              )}
            </mesh>

            <mesh
              geometry={mesh.geometry}
              position={mesh.getWorldPosition(new Vector3())}
              scale={mesh.getWorldScale(new Vector3())}
              quaternion={mesh.getWorldQuaternion(new Quaternion())}
            >
              <meshStandardMaterial wireframe={true} visible={wireframe} color="black" />
            </mesh>
          </React.Fragment>
        )
      })}
    </>
  )
}

interface SceneProps extends Omit<SceneMeshesProps, 'transmissionBuffer'> {}

const Scene: FC<SceneProps> = (props) => {
  const buffer = useFBO(256, 256)

  useFrame((state) => {
    state.gl.setRenderTarget(buffer)
    state.gl.render(state.scene, state.camera)
    state.gl.setRenderTarget(null)
  })

  return <SceneMeshes {...props} transmissionBuffer={buffer.texture} />
}

const GLTFViewer: FC<Props> = ({ show, assetID, files, onLoad }) => {
  if (!show) return null

  const handle = useFullScreenHandle()

  const [soloMap, setSoloMap] = useState<'NORMAL' | 'AO' | 'ROUGHNESS' | 'METALNESS' | 'DIFFUSE' | ''>('')
  const [wireframe, setWireframe] = useState(false)

  const [showEnvironment, setShowEnvironment] = useState(false)
  const [envPreset, setEnvPreset] = useState<
    'warehouse' | 'sunset' | 'dawn' | 'night' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'
  >('warehouse')

  const presetEnvs = {
    warehouse: 'empty_warehouse_01',
    sunset: 'venice_sunset',
    dawn: 'kiara_1_dawn',
    night: 'dikhololo_night',
    forest: 'forest_slope',
    studio: 'studio_small_03',
    city: 'potsdamer_platz',
    park: 'rooitou_park',
    lobby: 'st_fagans_interior',
  }

  const [maxAnisotropy, setMaxAnisotropy] = useState(1)

  const [state, dispatch] = useReducer(GLTF_Visibility_reducer, GLTF_Visibility_reducer_defaultState)

  if (!files) {
    return (
      <div className={styles.wrapper}>
        No files?
        <br />
        <em>Try refresh, otherwise please report this to us.</em>
      </div>
    )
  }

  if (!files.gltf) {
    return <div className={styles.wrapper}>No preview available for this model, sorry :(</div>
  }

  const gltfFiles = { ...files.gltf }
  if (files['Alpha'] && files['Diffuse']) {
    gltfFiles['alpha'] = files['Diffuse']['4k']?.png ?? files['Diffuse']['2k'].png
  }
  const { gltf: processedGLTFFromAPI, texturesLoaded } = useGLTFFromAPI(gltfFiles)

  useEffect(() => {
    if (texturesLoaded) onLoad()
  }, [texturesLoaded])

  // As this functionality is not really necessary, it is overkill to useReducer to handle it.
  // If we need finer grained interaction per part it is useful.
  // It does require a bit of effort to remove though.
  // Not ideal but keep for now.
  useEffect(() => {
    if (!processedGLTFFromAPI) return
    processedGLTFFromAPI.scene.children.map(processGroup)
  }, [processedGLTFFromAPI])

  // Split group into children and call process group on any groups
  const processGroup = (entity) => {
    if (entity.type === 'Mesh') {
      dispatch(addMesh(entity))
    }
    if (entity.type === 'Group') {
      entity.children.map(processGroup)
    }
  }

  const center = useMemo(() => calcSceneCenter(calcSceneBB(state.meshes)), [state.meshes])
  const camDistance = useMemo(() => Math.ceil(state.boundingSphereRadius * 2.5), [state.boundingSphereRadius])

  const toggleFullscreen = () => {
    handle.active ? handle.exit() : handle.enter()
  }

  if (!processedGLTFFromAPI) return null

  return (
    <FullScreen handle={handle}>
      <div className={styles.wrapper}>
        {/* Because Canvas wraps in relative div with width/height 100% */}
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <Canvas
            dpr={[1, 2]}
            gl={{ alpha: true }}
            camera={{
              fov: 27,
              near: 0.1,
              far: 1000,
              position: [-(center.x + camDistance), center.y + camDistance / 2, center.z + camDistance],
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = CineonToneMapping
              setMaxAnisotropy(Math.max(1, Math.min(16, gl.capabilities.getMaxAnisotropy())))
            }}
          >
            <Suspense fallback={null}>
              <Environment preset={envPreset} background={showEnvironment} />
              {!texturesLoaded && (
                <>
                  <ambientLight intensity={1.5} />
                  <directionalLight intensity={10.5} position={[5, 10, 5]} />
                </>
              )}
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={center} />

              {processedGLTFFromAPI && (
                <Scene
                  gltf={processedGLTFFromAPI}
                  soloMap={soloMap}
                  wireframe={wireframe}
                  maxAnisotropy={maxAnisotropy}
                  transparent={!!gltfFiles['alpha']}
                />
              )}
            </Suspense>
          </Canvas>
        </div>

        <div className={styles.buttons}>
          <IconButton icon={<MdPublic />}>
            {Object.keys(presetEnvs).map((p, k) => {
              return (
                <IconButton
                  key={k}
                  icon={
                    <img
                      src={`https://cdn.polyhaven.com/asset_img/primary/${presetEnvs[p]}.png?width=32&aspect_ratio=1:1&quality=95`}
                    />
                  }
                  active={showEnvironment && envPreset === p}
                  onClick={() => {
                    // @ts-ignore - String not detected as part of preset list, but we know they are.
                    setEnvPreset(p)
                    setShowEnvironment(true)
                  }}
                />
              )
            })}
            <IconButton
              icon={<MdNotInterested />}
              active={!showEnvironment}
              onClick={() => {
                setShowEnvironment(false)
              }}
            />
          </IconButton>
          <IconButton
            icon={<MdLanguage />}
            active={wireframe}
            onClick={() => {
              setWireframe((wf) => !wf)
            }}
          />
          <IconButton icon={<MdLayers />}>
            <div className={styles.labeledButton}>
              <span className={styles.mapLabel}>Base Color</span>
              <IconButton
                icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/DIFFUSE.png?width=32`} />}
                active={soloMap === 'DIFFUSE'}
                onClick={() => {
                  setSoloMap('DIFFUSE')
                }}
              />
            </div>
            <div className={styles.labeledButton}>
              <span className={styles.mapLabel}>Normal</span>
              <IconButton
                icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/NORMAL.png?width=32`} />}
                active={soloMap === 'NORMAL'}
                onClick={() => {
                  setSoloMap('NORMAL')
                }}
              />
            </div>
            <div className={styles.labeledButton}>
              <span className={styles.mapLabel}>Ambient Occlusion</span>
              <IconButton
                icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/AO.png?width=32`} />}
                active={soloMap === 'AO'}
                onClick={() => {
                  setSoloMap('AO')
                }}
              />
            </div>
            <div className={styles.labeledButton}>
              <span className={styles.mapLabel}>Roughness</span>
              <IconButton
                icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/ROUGHNESS.png?width=32`} />}
                active={soloMap === 'ROUGHNESS'}
                onClick={() => {
                  setSoloMap('ROUGHNESS')
                }}
              />
            </div>
            <div className={styles.labeledButton}>
              <span className={styles.mapLabel}>Metalness</span>
              <IconButton
                icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/METALNESS.png?width=32`} />}
                active={soloMap === 'METALNESS'}
                onClick={() => {
                  setSoloMap('METALNESS')
                }}
              />
            </div>
            <IconButton
              icon={<img src={`https://cdn.polyhaven.com/asset_img/thumbs/rough_wood.png?width=32`} />}
              active={soloMap === ''}
              onClick={() => {
                setSoloMap('')
              }}
            />
          </IconButton>
          <IconButton icon={<MdFullscreen />} onClick={toggleFullscreen} />
        </div>
      </div>
    </FullScreen>
  )
}

type BoundingBox = { min: Vector3; max: Vector3 }

const calcSceneBB = (meshes): BoundingBox => {
  return Object.values(meshes).reduce<BoundingBox>((acc, curr: MeshState, idx) => {
    curr.mesh.updateMatrixWorld()
    const box = new Box3()
    const wBounds = box.copy(curr.mesh.geometry.boundingBox).applyMatrix4(curr.mesh.matrixWorld)
    if (idx === 0) {
      acc.min = wBounds.min
      acc.max = wBounds.max
    } else {
      acc.max.x = Math.max(acc.max.x, wBounds.max.x)
      acc.max.y = Math.max(acc.max.y, wBounds.max.y)
      acc.max.z = Math.max(acc.max.z, wBounds.max.z)
      acc.min.x = Math.min(acc.min.x, wBounds.min.x)
      acc.min.y = Math.min(acc.min.y, wBounds.min.y)
      acc.min.z = Math.min(acc.min.z, wBounds.min.z)
    }

    return acc
  }, {} as BoundingBox)
}

const calcSceneCenter = (bb: BoundingBox): Vector3 => {
  if (!bb || !bb.max) return new Vector3(0, 0, 0)
  return new Vector3(
    bb.max.x - (bb.max.x - bb.min.x) / 2,
    bb.max.y - (bb.max.y - bb.min.y) / 2,
    bb.max.z - (bb.max.z - bb.min.z) / 2
  )
}

export default GLTFViewer
