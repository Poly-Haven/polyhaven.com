import { filesize } from 'filesize'
import { MdVisibility, MdFileDownload } from 'react-icons/md'

import styles from './DownloadOptions.module.scss'

const BackplateThumb = ({ assetID, bp, fileName, preview, trackDownload }) => {
  const types = {
    jpg_pretty: { name: 'Pretty JPG', tip: 'With some visual improvements (as shown).' },
    jpg_plain: { name: 'Plain JPG', tip: 'No adjustments, converted straight from RAW.' },
    raw: { name: 'Original RAW', tip: 'Straight from the camera.' },
  }

  return (
    <div className={styles.thumbnail}>
      <img
        src={`https://cdn.polyhaven.com/asset_img/backplates/${assetID}/${fileName}?width=152&quality=95`}
        data-src={`https://cdn.polyhaven.com/asset_img/backplates/${assetID}/${fileName}`}
        onClick={preview}
      />
      <div className={styles.buttonWrapper}>
        <div
          className={styles.button}
          data-src={`https://cdn.polyhaven.com/asset_img/backplates/${assetID}/${fileName}`}
          onClick={preview}
        >
          <MdVisibility />
        </div>
        <div className={styles.button}>
          <MdFileDownload />
          <div className={styles.downloadMenu}>
            {Object.keys(types).map((t, j) => (
              <a
                key={j}
                className={styles.download}
                href={bp[t].url}
                target="_blank"
                rel="noopener"
                onClick={trackDownload}
                data-res="backplate"
                data-format={t}
                data-tip={types[t].tip + `<br/>(${filesize(bp[t].size)})`}
              >
                {types[t].name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackplateThumb
