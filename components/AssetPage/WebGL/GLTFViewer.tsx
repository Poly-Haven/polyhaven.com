import React, { FC, useReducer, useState, useEffect, useMemo, Suspense } from 'react'
import { Vector3, Quaternion, Box3, CineonToneMapping } from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { MdPublic, MdLayers, MdLanguage, MdNotInterested, MdFullscreen } from 'react-icons/md'

import IconButton from 'components/UI/Button/IconButton'
import { useGLTFFromAPI } from './useGLTFFromAPI'
import {
  reducer as GLTF_Visibility_reducer,
  DefaultState as GLTF_Visibility_reducer_defaultState,
  addMesh,
  MeshState,
} from './GLTF_Visibility_reducer';


import styles from './GLTFViewer.module.scss'

interface Props {
  readonly show: boolean;
  readonly assetID: string;
  readonly files: { gltf };
  readonly onLoad: Function;
}

const GLTFViewer: FC<Props> = ({ show, assetID, files, onLoad }) => {
  if (!show) return null;

  const handle = useFullScreenHandle();

  const [soloMap, setSoloMap] = useState<"NORMAL" | "METALNESS" | "ROUGHNESS" | "DIFFUSE" | "">("");
  const [wireframe, setWireframe] = useState(false);

  const [showEnvironment, setShowEnvironment] = useState(true);
  const [envPreset, setEnvPreset] = useState<"warehouse" | "sunset" | "dawn" | "night" | "forest" | "apartment" | "studio" | "city" | "park" | "lobby">("warehouse");

  const presetEnvs = {
    warehouse: "empty_warehouse_01",
    sunset: "venice_sunset",
    dawn: "kiara_1_dawn",
    night: "dikhololo_night",
    forest: "forest_slope",
    studio: "studio_small_03",
    city: "potsdamer_platz",
    park: "rooitou_park",
    lobby: "st_fagans_interior"
  }

  const [state, dispatch] = useReducer(GLTF_Visibility_reducer, GLTF_Visibility_reducer_defaultState);

  if (!files) {
    return <div className={styles.wrapper}>No files?<br /><em>Try refresh, otherwise please report this to us.</em></div>
  }

  if (!files.gltf) {
    return <div className={styles.wrapper}>No preview available for this model, sorry :(</div>
  }

  const gltfFiles = files.gltf['4k'] ? files.gltf['4k'].gltf : files.gltf['2k'].gltf;
  const processedGLTFFromAPI = useGLTFFromAPI(gltfFiles);

  // As this functionality is not really necessary, it is overkill to useReducer to handle it.
  // If we need finer grained interaction per part it is useful.
  // It does require a bit of effort to remove though.
  // Not ideal but keep for now.
  useEffect(() => {
    if (!processedGLTFFromAPI) return;
    processedGLTFFromAPI.scene.children.map(processGroup);
  }, [processedGLTFFromAPI])

  // Split group into children and call process group on any groups
  const processGroup = (entity) => {
    if (entity.type === "Mesh") {
      dispatch(addMesh(entity));
    }
    if (entity.type === "Group") {
      entity.children.map(processGroup)
    }
  }

  const center = useMemo(() => calcSceneCenter(calcSceneBB(state.meshes)), [state.meshes]);
  const camDistance = useMemo(() => Math.ceil(state.boundingSphereRadius * 2.5), [state.boundingSphereRadius]);

  const toggleFullscreen = () => {
    handle.active ? handle.exit() : handle.enter()
  }

  if (!processedGLTFFromAPI) return null;

  return (
    <FullScreen handle={handle}>
      <div className={styles.wrapper}>
        {/* Because Canvas wraps in relative div with width/height 100% */}
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Canvas
            camera={{ fov: 27, near: 0.1, far: 1000, position: [-(center.x + camDistance), center.y + (camDistance / 2), center.z + camDistance] }}
            onCreated={({ gl }) => {
              gl.toneMapping = CineonToneMapping
              onLoad()
            }}
          >
            <Suspense fallback={null}>
              <Environment preset={envPreset} background={showEnvironment} />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={center} />

              {
                processedGLTFFromAPI && state.meshes &&
                Object.values(state.meshes).map(node => {
                  return <React.Fragment key={node.mesh.uuid}>
                    <mesh
                      geometry={node.mesh.geometry}
                      position={node.mesh.getWorldPosition(new Vector3)}
                      scale={node.mesh.getWorldScale(new Vector3)}
                      quaternion={node.mesh.getWorldQuaternion(new Quaternion)}
                    >
                      {/*  @ts-ignore - Types are strange here, TS complains but these items exist.. investigate */}
                      {(soloMap === "" ? <meshPhysicalMaterial {...node.mesh.material} /> :
                        <meshBasicMaterial>
                          {node.mesh.material['map'] && soloMap === "DIFFUSE" && <texture attach="map" {...node.mesh.material['map']} />}
                          {node.mesh.material['normalMap'] && soloMap === "NORMAL" && <texture attach="map" {...node.mesh.material['normalMap']} />}
                          {node.mesh.material['metalnessMap'] && soloMap === "METALNESS" && <texture attach="map" {...node.mesh.material['metalnessMap']} />}
                          {node.mesh.material['roughnessMap'] && soloMap === "ROUGHNESS" && <texture attach="map" {...node.mesh.material['roughnessMap']} />}
                        </meshBasicMaterial>)
                      }
                    </mesh>

                    <mesh
                      geometry={node.mesh.geometry}
                      position={node.mesh.getWorldPosition(new Vector3)}
                      scale={node.mesh.getWorldScale(new Vector3)}
                      quaternion={node.mesh.getWorldQuaternion(new Quaternion)}
                    >
                      <meshStandardMaterial wireframe={true} visible={wireframe} color='black' />
                    </mesh>
                  </React.Fragment>
                })
              }
            </Suspense>
          </Canvas>
        </div>

        <div className={styles.buttons}>
          <IconButton icon={<MdPublic />}>
            {Object.keys(presetEnvs).map((p, k) => {
              return <IconButton
                key={k}
                icon={<img src={`https://cdn.polyhaven.com/asset_img/primary/${presetEnvs[p]}.png?width=32&aspect_ratio=1:1`} />}
                active={showEnvironment && envPreset === p}
                onClick={() => {
                  // @ts-ignore - String not detected as part of preset list, but we know they are.
                  setEnvPreset(p)
                  setShowEnvironment(true)
                }}
              />
            })}
            <IconButton icon={<MdNotInterested />} active={!showEnvironment} onClick={() => {
              setShowEnvironment(false)
            }} />
          </IconButton>
          <IconButton icon={<MdLanguage />} active={wireframe} onClick={() => { setWireframe(wf => !wf) }} />
          <IconButton icon={<MdLayers />}>
            <IconButton icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/DIFFUSE.png?width=32`} />} active={soloMap === "DIFFUSE"} onClick={() => { setSoloMap("DIFFUSE") }} />
            <IconButton icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/NORMAL.png?width=32`} />} active={soloMap === "NORMAL"} onClick={() => { setSoloMap("NORMAL") }} />
            <IconButton icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/METALNESS.png?width=32`} />} active={soloMap === "METALNESS"} onClick={() => { setSoloMap("METALNESS") }} />
            <IconButton icon={<img src={`https://cdn.polyhaven.com/asset_img/thumbs/rough_wood.png?width=32`} />} active={soloMap === ""} onClick={() => { setSoloMap("") }} />
          </IconButton>
          <IconButton icon={<MdFullscreen />} onClick={toggleFullscreen} />
        </div>
      </div>
    </FullScreen>
  )
}

type BoundingBox = { min: Vector3, max: Vector3 };

const calcSceneBB = (meshes): BoundingBox => {
  return Object.values(meshes).reduce<BoundingBox>((acc, curr: MeshState, idx) => {
    curr.mesh.updateMatrixWorld();
    const box = new Box3();
    const wBounds = box.copy(curr.mesh.geometry.boundingBox).applyMatrix4(curr.mesh.matrixWorld);
    if (idx === 0) {
      acc.min = wBounds.min;
      acc.max = wBounds.max;
    } else {
      acc.max.x = Math.max(acc.max.x, wBounds.max.x);
      acc.max.y = Math.max(acc.max.y, wBounds.max.y);
      acc.max.z = Math.max(acc.max.z, wBounds.max.z);
      acc.min.x = Math.min(acc.min.x, wBounds.min.x);
      acc.min.y = Math.min(acc.min.y, wBounds.min.y);
      acc.min.z = Math.min(acc.min.z, wBounds.min.z);
    }

    return acc;
  }, {} as BoundingBox);
}

const calcSceneCenter = (bb: BoundingBox): Vector3 => {
  if (!bb || !bb.max) return new Vector3(0, 0, 0);
  return new Vector3(
    bb.max.x - ((bb.max.x - bb.min.x) / 2),
    bb.max.y - ((bb.max.y - bb.min.y) / 2),
    bb.max.z - ((bb.max.z - bb.min.z) / 2)
  );
}

export default GLTFViewer
