import styles from './Ads.module.scss'

const Ad = () => {
  // TODO hide for patrons
  if (process.env.NODE_ENV !== "production") {
    return (
      <img src="https://via.placeholder.com/468x60" className={styles.placeholder} />
    )
  }

  return (<>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <ins className="adsbygoogle"
      style={{ display: "inline-block", width: "468px", height: "60px" }}
      data-ad-client="ca-pub-2284751191864068"
      data-ad-slot="9488083725"></ins>
    <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({ });` }} />
  </>)
}

export default Ad
