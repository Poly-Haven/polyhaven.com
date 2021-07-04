import apiSWR from 'utils/apiSWR'

import Loader from 'components/UI/Loader/Loader'

import styles from './GLTFViewer.module.scss'
import { Suspense } from "react";

import * as THREE from 'three'
import React, { FC, useReducer, useState } from 'react'

import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { useEffect } from 'react';
import { GLTF } from 'three-stdlib';

import {
  reducer as GLTF_Visibility_reducer,
  DefaultState as GLTF_Visibility_reducer_defaultState,

  addMesh,
  soloMesh,
  toggleMesh,
  unsoloMesh,
  toggleWireframe,
} from './GLTF_Visibility_reducer';

type GLTFResult = GLTF & {
  nodes: {
    [s: string]: THREE.Mesh; // | Object3D;
  },
  materials: {
    [s: string]: THREE.MeshStandardMaterial;
  }
}

interface Props {
  readonly show: boolean;
  readonly assetID: string;
}

const GLTFViewer: FC<Props> = ({ show, assetID }) => {
  if (!show) return null

  const [state, dispatch] = useReducer(GLTF_Visibility_reducer, GLTF_Visibility_reducer_defaultState);
  const [loaded, setLoaded] = useState(false);
  
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

  // const gltfFiles = files['gltf']['4k']
  // const url = gltfFiles.gltf.url;

  const url = "/tmpdata/Camera_01_4k.gltf/Camera_01_4k.gltf";
  
  let gltf: GLTFResult;

  try {
    gltf = useGLTF(url) as GLTFResult;
  } catch(err) {
    // what weird interface is this... why doesn't useGLTF just return a promise?!
    // as a custom hook it just breaks, unless I'm using it wrong
    // TODO .. fix this ASAP!
    // useLoader is not the correct module type (?) so would need fixing?
    // GLTFLoader.loadAsync returns a promise.. maybe this is the better way?
    err.then(() => {
      // need to trigger a re-render so setting useless state
      // TODO .. something else.. maybe fix three?!
      // gltf = gltf.scene;
      setLoaded(true)
    })
  }

  useEffect(() => {
    // console.log("gltf", gltf)
    if (!gltf) return;

    Object.values(gltf.nodes).filter(node => node.type === "Mesh").map(node => dispatch(addMesh(node)));

  }, [loaded]);
  const TMP_SCALE = 10;

  return (
    <div className={styles.wrapper}>
      {/* because Canvas wraps in relative div with width/height 100%.. */}
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <perspectiveCamera fov={27} near={0.1} far={1000} position={[5, 2, 5]} />
            <Environment preset="apartment" background={true /* true to show HDR background */} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />


            {gltf && state.meshes &&
              state.meshes.map(node => {
                console.log(node)
                return node.visibility &&
                  <mesh scale={TMP_SCALE} geometry={node.mesh.geometry}>
                    {
                      state.wireframe || node.wireframe ?
                      <meshBasicMaterial wireframe={true} color='purple' /> :
                      <meshPhysicalMaterial wireframe={state.wireframe} {...node.mesh.material} />
                    }
                  </mesh>

                  // to just load the full scene in on
                  // <primitive scale={TMP_SCALE} object={gltf.scene} />
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

        <ul style={{ listStyle: "none" }}>
          {
            gltf && (
              state.meshes.map(node => {
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
