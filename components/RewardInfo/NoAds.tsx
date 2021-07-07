import { useState, useEffect } from "react"

import { MdVisibility, MdVisibilityOff } from "react-icons/md";

import Switch from "components/UI/Switch/Switch"

const NoAds = () => {
  const [hideAds, setHideAds] = useState(false);

  useEffect(() => {
    setHideAds(localStorage.getItem(`hideAds`) === "yes")
  }, []);

  const toggleAds = () => {
    localStorage.setItem(`hideAds`, hideAds ? "no" : "yes")
    setHideAds(!hideAds)
  }

  return (
    <div>
      <h1>No Ads</h1>
      <p>We use Google AdSense on polyhaven.com. To hide these ads, simply click the toggle below:</p>
      <div style={{ display: "flex", alignItems: 'center', gap: "0.5em" }}>
        <Switch
          on={hideAds}
          onClick={toggleAds}
          labelOff={<MdVisibility />}
          labelOn={<MdVisibilityOff />}
        />
        <p>Ads are now: <strong>{hideAds ? 'Hidden' : 'Visible'}</strong>.</p>
      </div>
    </div>
  )
}

export default NoAds
