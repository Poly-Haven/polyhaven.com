import apiSWR from 'utils/apiSWR'

import styles from './Carousel.module.scss'

const Carousel = ({ slug, setter }) => {
  let images = {
    "Sphere": `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png`,
    "Preview": `https://cdn.polyhaven.com/asset_img/primary/${slug}.png`,
  }

  const { data, error } = apiSWR(`/renders/${slug}`, { revalidateOnFocus: false });
  if (!error && data) {
    for (const i of Object.keys(data))
      images[i] = `https://cdn.polyhaven.com/asset_img/renders/${slug}/${i}`
  }

  const click = (e) => {
    setter(e.currentTarget.title)
  }

  return (
    <div className={styles.imageRow}>
      {Object.keys(images).map((i, k) =>
        <div key={k} title={images[i]} onClick={click} className={styles.image}>
          <img src={images[i] + "?height=110"} />
        </div>
      )}
    </div>
  )
}

export default Carousel
