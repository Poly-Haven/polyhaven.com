import styles from './InfoBlock.module.scss'

const InfoBlock = ({ title, image, imageStyle, children }) => {
  return (
    <div className={styles.info}>
      {image && <div className={styles.image} style={imageStyle}>{image}</div>}
      <h2>{title}</h2>
      {children}
    </div>
  )
}
InfoBlock.defaultProps = {
  image: null,
  imageStyle: null
}

export default InfoBlock
