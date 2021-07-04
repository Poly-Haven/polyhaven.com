import apiSWR from 'utils/apiSWR'

import Loader from 'components/UI/Loader/Loader'

import styles from './GLTFViewer.module.scss'
import { Suspense } from "react";

import * as THREE from 'three'
import React, { FC, useRef, useState } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { useEffect } from 'react';

import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

interface Props {
  readonly show: boolean;
  readonly assetID: string;
}

const GLTFViewer: FC<Props> = ({ show, assetID }) => {
  if (!show) return null

  const [loaded, setLoaded] = useState(false);
  // const [GLTF, setGLTF] = useState(null);
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

  const url = "/tmpdata/Camera_01_4k.gltf/Camera_01_4k.gltf";
  // const url = gltfFiles.gltf.url;
  
  let gltf;

  try {
    gltf = useGLTF(url)
  } catch(err) {
    // console.log(err)
    // what horrible interface is this... why doesn't useGLTF just return a promise?!
    err.then(() => {
      // need to trigger a re-render so setting useless state
      // TODO .. something else.. maybe fix three?!
      setLoaded(true)
    })
  }

  

  // useEffect(() => {
  //   // setGLTF(gltf);
  //   console.log("gltf", gltf)

  // }, [gltf]);


  useEffect(() => {
    // setGLTF(gltf);
    console.log("gltf", gltf)
  }, [loaded]);



  // const gltf = useLoader(GLTFLoader, './Poimandres.gltf')

  return (
    <div className={styles.wrapper}>
      {/* because Canvas wraps in relative div with width/height 100%.. */}
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight />
            <perspectiveCamera fov={27} near={0.1} far={1000} position={[0, 0, 5]} />
            <pointLight position={[10, 10, 10]} />
            {gltf && gltf.scene && <primitive scale={10} object={gltf.scene} />}
            <Environment preset="apartment" background={true} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default GLTFViewer
