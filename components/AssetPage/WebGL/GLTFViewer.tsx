import apiSWR from 'utils/apiSWR'

import Loader from 'components/UI/Loader/Loader'

import styles from './GLTFViewer.module.scss'

import init from './scene'



const GLTFViewer = ({ show, assetID }) => {

  if (!show) return null

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

  const gltfFiles = files['gltf']['4k']

  const id = "3d-viewer";

  init(id, gltfFiles);



  return (
    // TODO: maybe replace the id with some sort of binding??
    <div id={id} className={styles.wrapper}>
    </div>
  )
}

export default GLTFViewer
