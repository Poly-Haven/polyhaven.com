import { useEffect } from 'react'

import styles from './Ads.module.scss'

const Ad = () => {

  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (isProduction) {
      try {
        // @ts-ignore - adsbygoogle not detected as a prop of window, since it's declared in _document.tsx
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // TODO hide for patrons
  if (!isProduction) {
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
  </>)
}

export default Ad
