import { useEffect } from "react";
import { PanoViewer } from "@egjs/view360";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { MdFullscreen } from "react-icons/md";

import Spinner from "components/Spinner/Spinner";
import IconButton from "components/UI/Button/IconButton";

import styles from './PanoViewer.module.scss'

const Comp = ({ assetID }) => {

  const handle = useFullScreenHandle();

  useEffect(() => {
    const panoViewer = new PanoViewer(
      document.getElementById("panoViewer"),
      {
        image: `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${assetID}.jpg`,
        showPolePoint: true, // So we can look directly up & down
      }
    )

    const resize = () => {
      panoViewer.updateViewportDimensions()
    }

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    }
  }, [])

  const toggleFullscreen = () => {
    handle.active ? handle.exit() : handle.enter()
  }

  return (
    <div className={styles.wrapper}>
      <FullScreen handle={handle}>
        <div className={styles.wrapper} id="panoViewer">
          <Spinner />
        </div>
        <div className={styles.buttons}>
          <IconButton icon={<MdFullscreen />} onClick={toggleFullscreen} />
        </div>
      </FullScreen>
    </div>
  )
}

export default Comp
