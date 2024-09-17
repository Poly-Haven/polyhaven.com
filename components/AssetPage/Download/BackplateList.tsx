import Masonry from 'react-masonry-css'

import { MdHelp } from 'react-icons/md'

import BackplateThumb from './BackplateThumb'

import styles from './DownloadOptions.module.scss'

const BackplateList = ({ assetID, files, trackDownload, setPreview }) => {
  const types = {
    jpg_pretty: { name: 'Pretty JPG', tip: 'With some visual improvements (as shown).' },
    jpg_plain: { name: 'Plain JPG', tip: 'No adjustments, converted straight from RAW.' },
    raw: { name: 'Original RAW', tip: 'Straight from the camera.' },
  }

  const preview = (e) => {
    setPreview(e.currentTarget.dataset.src)
  }

  return (
    <>
      <h3>
        Backplates:{' '}
        <MdHelp data-tip="The images below are separate photos that you can use as high resolution background images in your render.<br />Depending on your render resolution and camera settings, sometimes an HDRI (even a very large one) might not have enough pixels to still appear sharp in the background of your render. In these cases you can use one of these backplates in the background instead, and use a lower resolution HDRI just for lighting and reflections." />
      </h3>
      <Masonry breakpointCols={2} className={styles.masonry} columnClassName={styles.masonryColumn}>
        {Object.keys(files)
          .sort()
          .map((n, i) => {
            const bp = files[n]
            if (Object.keys(bp).length !== Object.keys(types).length) {
              // Don't show backplates that are missing some type versions.
              // This rarely happens for very old assets where the spare raw files were included.
              return
            }
            return (
              <BackplateThumb
                key={i}
                assetID={assetID}
                bp={bp}
                fileName={bp['jpg_pretty']['url'].split('/').pop()}
                preview={preview}
                trackDownload={trackDownload}
              />
            )
          })}
      </Masonry>
    </>
  )
}

export default BackplateList
