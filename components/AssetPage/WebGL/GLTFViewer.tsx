import apiSWR from 'utils/apiSWR'

import Loader from 'components/UI/Loader/Loader'

import styles from './GLTFViewer.module.scss'

import * as THREE from 'three'
import React, { FC, useReducer, useState, useEffect, Suspense } from 'react'

import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'

import {
  reducer as GLTF_Visibility_reducer,
  DefaultState as GLTF_Visibility_reducer_defaultState,

  addMesh,
  soloMesh,
  toggleMesh,
  unsoloMesh,
  toggleWireframe,
  toggleEnvironment,
} from './GLTF_Visibility_reducer';
import ErrorBoundary from 'utils/ErrorBoundary'
import { useGLTFFromAPI } from './useGLTFFromAPI'

interface Props {
  readonly show: boolean;
  readonly assetID: string;
}

const GLTFViewer: FC<Props> = ({ show, assetID }) => {
  if (!show) return null
      
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

  // console.log(files)
  const gltfFiles = files.gltf['4k'].gltf;
  const processedGLTFFromAPI = useGLTFFromAPI(gltfFiles);

  // console.log(processedGLTFFromAPI)
  
  useEffect(() => {
    if (!processedGLTFFromAPI) return;
    processedGLTFFromAPI.scene.children.filter(child => child.type === "Mesh").map(node => dispatch(addMesh(node)));
  }, [processedGLTFFromAPI])

  const TMP_SCALE = 10;
  
  // console.log("state.meshes", state.meshes)

  return (
    <div className={styles.wrapper}>
      {/* because Canvas wraps in relative div with width/height 100%.. */}
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <perspectiveCamera fov={27} near={0.1} far={1000} position={[5, 2, 5]} />
            <Environment preset="warehouse" background={state.showEnvironment /* true to show HDR background */} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

            {
              processedGLTFFromAPI && state.meshes &&
                Object.values(state.meshes).map(node => {
                  console.log(node)
                  return node.visibility &&
                    <mesh scale={TMP_SCALE} key={node.mesh.uuid} geometry={node.mesh.geometry}>
                      {
                        state.wireframe || node.wireframe ?
                        <meshBasicMaterial wireframe={true} color='purple' /> :
                        <meshPhysicalMaterial wireframe={state.wireframe} {...node.mesh.material} />
                      }
                    </mesh>
                })
            }
          </Suspense>
        </Canvas>
      </div>

      <div style={{width: "320px", height: "100%", background: "white", position: "absolute", right: "0" }}>
        <div><b>Controls</b></div>
        <button onClick={() => { dispatch(toggleWireframe()) }}>
          {state.wireframe ? "hide" : "show"} wireframe
        </button>
        <button onClick={() => { dispatch(toggleEnvironment()) }}>
          {state.showEnvironment ? "hide" : "show"} environment
        </button>

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
        </ul>
      </div>

    </div>
  )
}

export default GLTFViewer
