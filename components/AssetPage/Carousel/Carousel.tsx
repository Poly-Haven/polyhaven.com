import apiSWR from 'utils/apiSWR'

import styles from './Carousel.module.scss'

const Carousel = ({ slug, assetType, setter }) => {
  let images = {
    "Preview": `https://cdn.polyhaven.com/asset_img/primary/${slug}.png`,
  }
  if (assetType !== 2) {
    // Model thumb and primary are the same, don't need to show both.
    images["Thumb"] = `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png`
  }

  const { data, error } = apiSWR(`/renders/${slug}`, { revalidateOnFocus: false });
  if (!error && data) {
    for (const i of Object.keys(data))
      images[i] = `https://cdn.polyhaven.com/asset_img/renders/${slug}/${i}`
  }

  const sortPreference = {
    "Thumb": 1,
    "Preview": 2,
    "clay.png": 3,
    "cam_": 4,
    "ANYTHING ELSE": 5,
    "orth_": 6
  }
  let sortedKeys = Object.keys(images).sort((a, b) => (a.toLowerCase() > b.toLowerCase()) ? -1 : 1)  // Alphabetically
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
    if (prefA === prefB) {
      result = (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;
    }
    result = prefA < prefB ? -1 : 1
    return result
  })

  const click = (e) => {
    setter(e.currentTarget.dataset.src)
  }

  return (
    <div className={styles.imageRow}>
      {sortedKeys.map((i, k) =>
        <div key={k} data-src={images[i]} onClick={click} className={styles.image}>
          <img src={images[i] + "?height=110"} />
        </div>
      )}
    </div>
  )
}

export default Carousel
