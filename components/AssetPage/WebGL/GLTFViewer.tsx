import apiSWR from 'utils/apiSWR'

import Loader from 'components/UI/Loader/Loader'

import styles from './GLTFViewer.module.scss'

import React, { FC, useReducer, useState, useEffect, useMemo, Suspense } from 'react'

import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'

import {
  reducer as GLTF_Visibility_reducer,
  DefaultState as GLTF_Visibility_reducer_defaultState,

  addMesh,
  // soloMesh,
  // toggleMesh,
  // unsoloMesh,
  // toggleWireframe,
  // toggleEnvironment,
  MeshState,
} from './GLTF_Visibility_reducer';
// import ErrorBoundary from 'utils/ErrorBoundary'
import { useGLTFFromAPI } from './useGLTFFromAPI'
import { Vector3 } from 'three'

interface Props {
  readonly show: boolean;
  readonly assetID: string;
}

const GLTFViewer: FC<Props> = ({ show, assetID }) => {
  if (!show) return null
      

  const [soloMap, setSoloMap] = useState<"NORMAL" | "METALNESS" | "ROUGHNESS" | "DIFFUSE" | "">("");
  const [wireframe, setWireframe] = useState(false);

  // TODO change which environment map to use
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

  console.log(files)
  const gltfFiles = files.gltf['4k'].gltf;
  const processedGLTFFromAPI = useGLTFFromAPI(gltfFiles);

  // console.log(processedGLTFFromAPI)
  
  // as this functionality is not really necessary, it is overkill to useReducer to handle it
  // if we need finer grained interaction per part it is useful
  // it does require a bit of effort to remove though
  // not ideal but keep for now
  useEffect(() => {
    if (!processedGLTFFromAPI) return;
    processedGLTFFromAPI.scene.children.map(processGroup);
  }, [processedGLTFFromAPI])

  // split group into children and call process group on any groups
  // (can there be circular references?)
  const processGroup = (entity) => {
    if (entity.type === "Mesh") {
      dispatch(addMesh(entity));
    }
    if (entity.type === "Group") {
      entity.children.map(processGroup)
    }
  }

  if (!processedGLTFFromAPI) return null;

  const center = useMemo(() => calcSceneCenter(calcSceneBB(state.meshes)), [state.meshes]);
  const camDistance = useMemo(() => Math.ceil(state.boundingSphereRadius * 2.5), [state.boundingSphereRadius]);

  // console.log(center, camDistance)

  return (
    <div className={styles.wrapper}>
      {/* because Canvas wraps in relative div with width/height 100%.. */}
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Canvas camera={{fov: 27, near: 0.1, far: 1000, position: [-(center.x + camDistance), center.y + (camDistance / 2), center.z + camDistance] }}>
          <Suspense fallback={null}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Environment preset="warehouse" background={showEnvironment} /> 
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} 
            target={center} // when switching wireframe, orbit recenters.. 
            />

            {
              processedGLTFFromAPI && state.meshes &&
                Object.values(state.meshes).map(node => {
                  // console.log(node)
                  // return node.visibility && // for multi object files, this is actually useful
                  return <React.Fragment key={node.mesh.uuid}>

                    <mesh geometry={node.mesh.geometry}>
                      {/* types are strange here, TS complains but these items exist.. investigate */}
                      {(soloMap === "" ? <meshPhysicalMaterial {...node.mesh.material} /> :
                        <meshStandardMaterial>
                          { node.mesh.material.map && soloMap === "DIFFUSE" && <texture attach="map" {...node.mesh.material.map} /> }
                          { node.mesh.material.normalMap && soloMap === "NORMAL" && <texture attach="map" {...node.mesh.material.normalMap} /> }
                          { node.mesh.material.metalnessMap && soloMap === "METALNESS" && <texture attach="map" {...node.mesh.material.metalnessMap} /> }
                          {/* { node.mesh.material.roughnessMap && soloMap === "ROUGHNESS" && <texture attach="map" {...node.mesh.material.roughnessMap} /> } */}
                        </meshStandardMaterial>)
                      }
                    </mesh>

                    <mesh geometry={node.mesh.geometry}><meshStandardMaterial wireframe={true} visible={wireframe} color='purple' /></mesh>
                  </React.Fragment>
                })
            }
          </Suspense>
        </Canvas>
      </div>

      <div
        // tmp positioning, use actual UI components for these 
        style={{position: "absolute", bottom: "8px", right: "8px" }}
      >
        <button onClick={() => { setWireframe(wf => !wf) }}>{wireframe ? "hide" : "show"} wireframe</button>
        <button onClick={() => { setShowEnvironment(env => !env) }}>{showEnvironment ? "hide" : "show"} environment</button>

        <button onClick={() => { setSoloMap("DIFFUSE") }}>diffuse</button>
        <button onClick={() => { setSoloMap("NORMAL") }}>normal</button>
        <button onClick={() => { setSoloMap("METALNESS") }}>metalness</button>

        {/*
          // metal and roughness use same maps
          <button onClick={() => { setSoloMap("ROUGHNESS") }}>roughness</button>
        */}

        <button onClick={() => { setSoloMap("") }}>unsolo</button>

        {/* <br />
        // some models have multiple parts that all want the origin (collections not multi part models)
        // there is no way to solo them if we remove this. Desired functionality doesn't include this
        // however for certain models like rocks and pipes, all meshes just sit on top of eachother broken
        // there is no way to identify which is which as far as I know
        <ul style={{ listStyle: "none" }}>
          {
            processedGLTFFromAPI && (
              Object.values(state.meshes).map(node => {
                console.log(node)
                return (
                  <li style={{ padding: "12px", }} key={`list-${node.mesh.uuid}`}>
                    {node.mesh.name}

                    <div>
                      <button onClick={() => { dispatch(toggleMesh(node.mesh.uuid)) } } >
                        {node.visibility ? "hide" : "show"} part
                      </button>

                      <button onClick={() => { dispatch(toggleWireframe(node.mesh.uuid)) } } >
                        {node.wireframe ? "shaded" : "wireframe"}
                      </button>
                    </div>
                  </li>
                )
              })
            )
          }
        </ul> */}
       
      </div>

    </div>
  )
}

type BoundingBox = {min: Vector3, max: Vector3};

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
