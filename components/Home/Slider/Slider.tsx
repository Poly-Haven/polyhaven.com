import styles from './Slider.module.scss'

const Slider = () => {
  return (
    <div className={styles.wrapper}>
      <img src='/Logo 256.png' className={styles.logo} />
      <h1>Poly Haven</h1>
      <p>The Public 3D Asset Library</p>
    </div>
  )
}

export default Slider
