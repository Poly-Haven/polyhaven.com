
import React, { FC, Suspense, useEffect, useReducer, useState } from 'react'

import { Canvas, useLoader } from '@react-three/fiber'
import { GLTF, GLTFLoader } from 'three-stdlib';
interface Props {
    readonly url: string;
}

const GLTFObject: FC<Props> = ({ url }) => {

  console.log(url)
    if (!url) return null
  
    // const [state, dispatch] = useReducer(GLTF_Visibility_reducer, GLTF_Visibility_reducer_defaultState);
    const [loaded, setLoaded] = useState(false);
    
    // const _url = "/tmpdata/Camera_01_4k.gltf/Camera_01_4k.gltf";




    // let gltf: GLTFResult;
    // try {
    //   gltf = useGLTF(url) as GLTFResult;
    // } catch(err) {
    //   console.log(err)
    // }
    
  // try {

  //   const gltf = useLoader(GLTFLoader, url, loader => {
  //     loader.setCrossOrigin('no-cors')
  //   });
  //   console.log(gltf)
  // } catch(err) {
  //   console.log(err);
    
  // }
  
  
  // useEffect(() => {
  //     const glload = new GLTFLoader();

  //     // glload.parse()

  //     glload.load(url, console.log)
  //     // .then(console.log)
  //   }, [])

    
  // console.log(LoadingManager)
  // console.log(new LoadingManager())
  
  
    // console.log("gltf", gltf)
    /*
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
    */
  
    // useEffect(() => {
    //   console.log("gltf", gltf)
    //   if (!gltf) return;
  
    //   // Object.values(gltf.nodes).filter(node => node.type === "Mesh").map(node => dispatch(addMesh(node)));
  
    // }, [loaded]);
    // const TMP_SCALE = 10;
  
    return null;
    // (
            // <Suspense fallback={null}>
  
            //   {gltf && state.meshes &&
            //     state.meshes.map(node => {
            //       console.log(node)
            //       return node.visibility &&
            //         <mesh scale={TMP_SCALE} geometry={node.mesh.geometry}>
            //           {
            //             state.wireframe || node.wireframe ?
            //             <meshBasicMaterial wireframe={true} color='purple' /> :
            //             <meshPhysicalMaterial wireframe={state.wireframe} {...node.mesh.material} />
            //           }
            //         </mesh>
  
            //         // to just load the full scene in on
            //         // <primitive scale={TMP_SCALE} object={gltf.scene} />
            //     })
            // }
            // </Suspense>
    // )
  }
  
  export default GLTFObject;
