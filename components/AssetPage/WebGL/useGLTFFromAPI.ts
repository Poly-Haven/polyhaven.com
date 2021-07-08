
import { useState, useEffect } from 'react'

import { GLTF, GLTFLoader } from 'three-stdlib';

interface APIDataItem {
    readonly url: string;
    readonly size: number;
    readonly md5: string;
}

interface GLTFFromAPI extends APIDataItem {
    readonly include: { [s: string]: APIDataItem; }
}

// convert polyhaven API data into valid GLTF

export const useGLTFFromAPI = (APIModelObject: GLTFFromAPI): GLTF => { 
    const [mappedGLTF, setMappedGLTF] = useState();
    const [processedGLTF, setProcessedGLTF] = useState<GLTF>();
      
    useEffect(() => {
      fetch(APIModelObject.url)
        .then(res => res.json())
        .then(data => {
        //   console.log(APIModelObject.include)
        //   console.log(data)
          setMappedGLTF(
            {
              ...data,
              images: data.images.map((key, idx) => {
                    return {
                      ...data.images[idx],
                      uri: APIModelObject.include[key.uri].url
                    }
              }),
              buffers: data.buffers.map(key => {
                return {
                  byteLength: APIModelObject.include[key.uri].size,
                  uri: APIModelObject.include[key.uri].url,
                }
              })
            }
          )
      });
    }, []);
  
    useEffect(() => {
    //   console.log("output", mappedGLTF)
  
      if (!mappedGLTF) return;
      const _GLTFLoader = new GLTFLoader();
  
      // should not hard code baseUrl here, get from API
      // can also use deeper nesting but most importantly it is just needed to make glTF URLs relative
      _GLTFLoader.parse(JSON.stringify(mappedGLTF), "https://dl.polyhaven.com/", data => setProcessedGLTF(data))
    }, [mappedGLTF]);

    return processedGLTF;
}