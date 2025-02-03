import { Md3dRotation } from 'react-icons/md'

import { sortCaseInsensitive, sliceIntoChunks, sortByPreference } from 'utils/arrayUtils'
import { urlBaseName } from 'utils/stringUtils'

import IconButton from 'components/UI/Button/IconButton'

import styles from './Carousel.module.scss'

const Carousel = ({ slug, data, files, assetType, setter, showWebGL, showTilePreview, active }) => {
  let images = {
    Preview: `https://cdn.polyhaven.com/asset_img/primary/${slug}.png`,
  }
  if (assetType !== 2) {
    // Model thumb and primary are the same, don't need to show both.
    images['Thumb'] = `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png`
  }

  let image_info = {}
  if (data) {
    for (const i of Object.keys(data)) {
      images[i] = `https://cdn.polyhaven.com/asset_img/renders/${slug}/${i}`
      if (typeof data[i] === 'object') {
        image_info[i] = data[i]
      }
    }
  }

  const sortPreference = {
    Thumb: 1,
    Preview: 2,
    'clay.png': 3,
    cam_: 4,
    'ANYTHING ELSE': 5,
    orth_: 6,
  }
  let renders = sortCaseInsensitive(Object.keys(images))
  renders = sortByPreference(renders, sortPreference, ['cam_', 'orth_'])

  let maps = {}
  for (const m of sortCaseInsensitive(Object.keys(files))) {
    if (m.endsWith('nor_dx')) continue
    let img = null
    try {
      img = files[m]['1k']['jpg']['url']
    } catch {
      // Not all files are expected to have a JPG version (e.g. blend/gltf)
      img = null
    }
    if (img) {
      maps[m] = img
    }
  }

  const clickImage = (e) => {
    setter(e.currentTarget.dataset.src)
  }

  const clickMap = (e) => {
    showTilePreview(e.currentTarget.dataset.src)
  }

  return (
    <div className={styles.imageRow}>
      <div className={`${styles.iconBtn} ${active === 'webGL' ? styles.activeImage : ''}`}>
        <IconButton icon={<Md3dRotation />} onClick={showWebGL} />
      </div>
      {renders.map((i, k) => (
        <div
          key={k}
          data-src={images[i]}
          title={i}
          onClick={clickImage}
          className={`${styles.image} ${active === images[i] ? styles.activeImage : ''}`}
        >
          <img src={images[i] + '?height=110'} />
          {Object.keys(image_info).includes(i) ? (
            <div className={styles.credit}>
              <p>
                {image_info[i].title} by{' '}
                {image_info[i].url ? (
                  <a href={image_info[i].url} rel="noopener">
                    {image_info[i].author}
                  </a>
                ) : (
                  image_info[i].author
                )}
              </p>
              {image_info[i].sources ? (
                <div className={styles.sources}>
                  {image_info[i].sources.length > 1 ? 'Sources:' : 'Source:'}
                  <ul>
                    {image_info[i].sources.map((link, k) => (
                      <li key={k}>
                        <a href={link} rel="noopener">
                          {k + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
      {assetType !== 0 && slug !== 'decorative_book_set_01'
        ? sliceIntoChunks(Object.keys(maps), 2).map((chunk, k1) => (
            <div key={k1} className={styles.texMaps}>
              {chunk.map((m, k2) => (
                <div
                  key={k2}
                  data-src={maps[m]}
                  title={m}
                  onClick={clickMap}
                  className={`${styles.image} ${active === maps[m] ? styles.activeImage : ''}`}
                >
                  <img
                    src={`https://cdn.polyhaven.com/asset_img/map_previews/${slug}/${urlBaseName(
                      maps[m]
                    )}?height=50&width=50`}
                  />
                </div>
              ))}
            </div>
          ))
        : null}
    </div>
  )
}

export default Carousel
