import apiSWR from 'utils/apiSWR'

import Loader from 'components/UI/Loader/Loader'

import styles from './GLTFViewer.module.scss'

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

  // Replace the block below with the actual webGL code!
  return (
    <div className={styles.wrapper}>
      <h1>WebGL goes here :)</h1>
      <pre>{JSON.stringify(gltfFiles, null, 2)}</pre>
    </div>
  )
}

export default GLTFViewer
