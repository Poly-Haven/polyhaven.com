import React, { FC, useReducer, useState, useEffect, useMemo, Suspense } from 'react'
import apiSWR from 'utils/apiSWR'
import { Vector3, CineonToneMapping } from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'

import { MdPublic, MdLayers, MdLanguage } from 'react-icons/md'

import Loader from 'components/UI/Loader/Loader'
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
}

const GLTFViewer: FC<Props> = ({ show, assetID }) => {
  if (!show) return null;

  const [soloMap, setSoloMap] = useState<"NORMAL" | "METALNESS" | "ROUGHNESS" | "DIFFUSE" | "">("");
  const [wireframe, setWireframe] = useState(false);

  const [showEnvironment, setShowEnvironment] = useState(true);

  const [state, dispatch] = useReducer(GLTF_Visibility_reducer, GLTF_Visibility_reducer_defaultState);

  const { data: files, error } = apiSWR(`/files/${assetID}`, { revalidateOnFocus: false });
  if (error) {
    return <div className={styles.wrapper}>No files?<br /><em>Try refresh, otherwise please report this to us.</em></div>
  } else if (!files) {
    return <div className={styles.wrapper}><Loader /></div>
  }

  try {
    files['gltf']['4k']
  } catch (e) {
    console.error(e)
    return <div className={styles.wrapper}>No preview available for this model, sorry :(</div>
  }

  const gltfFiles = files.gltf['4k'].gltf;
  const processedGLTFFromAPI = useGLTFFromAPI(gltfFiles);

  // as this functionality is not really necessary, it is overkill to useReducer to handle it
  // if we need finer grained interaction per part it is useful
  // it does require a bit of effort to remove though
  // not ideal but keep for now
  useEffect(() => {
    if (!processedGLTFFromAPI) return;
    processedGLTFFromAPI.scene.children.map(processGroup);
  }, [processedGLTFFromAPI])

  // split group into children and call process group on any groups
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

  if (!processedGLTFFromAPI) return null;

  return (
    <div className={styles.wrapper}>
      {/* because Canvas wraps in relative div with width/height 100%.. */}
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Canvas
          camera={{ fov: 27, near: 0.1, far: 1000, position: [-(center.x + camDistance), center.y + (camDistance / 2), center.z + camDistance] }}
          onCreated={({ gl }) => { gl.toneMapping = CineonToneMapping }}
        >
          <Suspense fallback={null}>
            <Environment preset="warehouse" background={showEnvironment} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={center} />

            {
              processedGLTFFromAPI && state.meshes &&
              Object.values(state.meshes).map(node => {
                return <React.Fragment key={node.mesh.uuid}>

                  <mesh geometry={node.mesh.geometry}>
                    {/*  @ts-ignore - types are strange here, TS complains but these items exist.. investigate */}
                    {(soloMap === "" ? <meshPhysicalMaterial {...node.mesh.material} /> :
                      <meshBasicMaterial>
                        {node.mesh.material['map'] && soloMap === "DIFFUSE" && <texture attach="map" {...node.mesh.material['map']} />}
                        {node.mesh.material['normalMap'] && soloMap === "NORMAL" && <texture attach="map" {...node.mesh.material['normalMap']} />}
                        {node.mesh.material['metalnessMap'] && soloMap === "METALNESS" && <texture attach="map" {...node.mesh.material['metalnessMap']} />}
                        {node.mesh.material['roughnessMap'] && soloMap === "ROUGHNESS" && <texture attach="map" {...node.mesh.material['roughnessMap']} />}
                      </meshBasicMaterial>)
                    }
                  </mesh>

                  <mesh geometry={node.mesh.geometry}><meshStandardMaterial wireframe={true} visible={wireframe} color='purple' /></mesh>
                </React.Fragment>
              })
            }
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.buttons}>
        <IconButton icon={<MdPublic />} active={showEnvironment} onClick={() => { setShowEnvironment(env => !env) }} />
        <IconButton icon={<MdLanguage />} active={wireframe} onClick={() => { setWireframe(wf => !wf) }} />
        <IconButton icon={<MdLayers />}>
          <IconButton icon={<img src={`https://cdn.polyhaven.com/asset_img/thumbs/rough_wood.png?width=32`} />} active={soloMap === ""} onClick={() => { setSoloMap("") }} />
          <IconButton icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/DIFFUSE.png?width=32`} />} active={soloMap === "DIFFUSE"} onClick={() => { setSoloMap("DIFFUSE") }} />
          <IconButton icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/NORMAL.png?width=32`} />} active={soloMap === "NORMAL"} onClick={() => { setSoloMap("NORMAL") }} />
          <IconButton icon={<img src={`https://cdn.polyhaven.com/site_images/map_types/METALNESS.png?width=32`} />} active={soloMap === "METALNESS"} onClick={() => { setSoloMap("METALNESS") }} />
        </IconButton>
      </div>

    </div>
  )
}

type BoundingBox = { min: Vector3, max: Vector3 };

const calcSceneBB = (meshes): BoundingBox => {
  return Object.values(meshes).reduce<BoundingBox>((acc, curr: MeshState, idx) => {
    if (idx === 0) {
      acc.min = curr.mesh.geometry.boundingBox.min;
      acc.max = curr.mesh.geometry.boundingBox.max;
    } else {
      acc.max.x = Math.max(acc.max.x, curr.mesh.geometry.boundingBox.max.x);
      acc.max.y = Math.max(acc.max.y, curr.mesh.geometry.boundingBox.max.y);
      acc.max.z = Math.max(acc.max.z, curr.mesh.geometry.boundingBox.max.z);
      acc.min.x = Math.min(acc.min.x, curr.mesh.geometry.boundingBox.min.x);
      acc.min.y = Math.min(acc.min.y, curr.mesh.geometry.boundingBox.min.y);
      acc.min.z = Math.min(acc.min.z, curr.mesh.geometry.boundingBox.min.z);
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
