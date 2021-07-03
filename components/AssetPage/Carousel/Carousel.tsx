import apiSWR from 'utils/apiSWR'

import { Md3DRotation } from 'react-icons/md'

import styles from './Carousel.module.scss'

const Carousel = ({ slug, assetType, setter, showWebGL }) => {
  let images = {
    "Preview": `https://cdn.polyhaven.com/asset_img/primary/${slug}.png`,
  }
  if (assetType !== 2) {
    // Model thumb and primary are the same, don't need to show both.
    images["Thumb"] = `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png`
  }

  let image_info = {}
  const { data, error } = apiSWR(`/renders/${slug}`, { revalidateOnFocus: false });
  if (!error && data) {
    for (const i of Object.keys(data)) {
      images[i] = `https://cdn.polyhaven.com/asset_img/renders/${slug}/${i}`
      if (typeof data[i] === 'object') {
        image_info[i] = data[i]
      }
    }
  }

  const sortPreference = {
    "Thumb": 1,
    "Preview": 2,
    "clay.png": 3,
    "cam_": 4,
    "ANYTHING ELSE": 5,
    "orth_": 6
  }
  let sortedKeys = Object.keys(images).sort((a, b) => a.localeCompare(b))  // Alphabetically
  sortedKeys = sortedKeys.sort((a, b) => {  // Then in order of preference
    const startsWithPrefs = ["cam_", "orth_"]
    let prefA = sortPreference[a]
    let prefB = sortPreference[b]
    for (const swp of startsWithPrefs) {
      if (!prefA && a.startsWith(swp)) {
        prefA = sortPreference[swp]
      }
      if (!prefB && b.startsWith(swp)) {
        prefB = sortPreference[swp]
      }
    }
    prefA = prefA || sortPreference["ANYTHING ELSE"]
    prefB = prefB || sortPreference["ANYTHING ELSE"]
    let result = 0;
    if (prefA !== prefB) {
      result = prefA < prefB ? -1 : 1
    }
    return result
  })

  const clickImage = (e) => {
    setter(e.currentTarget.dataset.src)
  }

  return (
    <div className={styles.imageRow}>
      {assetType !== 0 ? <div className={styles.iconBtn} onClick={showWebGL}><Md3DRotation /></div> : null}
      {sortedKeys.map((i, k) =>
        <div key={k} data-src={images[i]} onClick={clickImage} className={styles.image}>
          <img src={images[i] + "?height=110"} />
          {Object.keys(image_info).includes(i) ? <div className={styles.credit}>
            <p>{image_info[i].title} by {image_info[i].url ? <a href={image_info[i].url} rel="noopener">{image_info[i].author}</a> : image_info[i].author}</p>
            {image_info[i].sources ? <div className={styles.sources}>
              {image_info[i].sources.length > 1 ? "Sources:" : "Source:"}
              <ul>{image_info[i].sources.map((link, k) => <li key={k}><a href={link} rel="noopener">{k + 1}</a></li>)}</ul>
            </div> : null}
          </div> : null}
        </div>
      )}
    </div>
  )
}

export default Carousel
