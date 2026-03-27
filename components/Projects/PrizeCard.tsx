import styles from './PrizeCard.module.scss'

function breakTitle(title: string): React.ReactNode {
  if (title.length <= 30) return title
  const mid = Math.floor(title.length / 2)
  let left = mid,
    right = mid
  while (left > 0 || right < title.length) {
    if (title[left] === ' ')
      return (
        <>
          {title.slice(0, left)}
          <br />
          {title.slice(left + 1)}
        </>
      )
    if (title[right] === ' ')
      return (
        <>
          {title.slice(0, right)}
          <br />
          {title.slice(right + 1)}
        </>
      )
    left--
    right++
  }
  return title
}

const PrizeCard = ({ link, title, image, description, copiesAvailable, value, color }) => {
  const backgroundColor = `rgba(${color.join(',')}, 0.25)`
  const borderColor = `rgba(${color.join(',')}, 0.5)`

  return (
    <a href={link} className={styles.prize} target="_blank" style={{ backgroundColor, borderColor }}>
      <img src={image} />
      <div className={styles.text}>
        <h4>{breakTitle(title)}</h4>
        <p>
          {value} each × {copiesAvailable}
        </p>
      </div>
    </a>
  )
}

export default PrizeCard
