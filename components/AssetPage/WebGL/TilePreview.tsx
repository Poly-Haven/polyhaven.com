import { useState, useRef, useEffect } from "react";

import useDivSize from 'hooks/useDivSize';

import { MdAdd, MdRemove, MdUndo, MdGridOn } from "react-icons/md";

import Spinner from "components/UI/Spinner/Spinner";
import IconButton from "components/UI/Button/IconButton";

import styles from './TilePreview.module.scss'

const TilePreview = ({ image, resolutions, type }) => {
  const [zoom, setZoomState] = useState(1)
  const [grid, setGrid] = useState(false)
  const [drag, setDrag] = useState(false)
  const [dragZoom, setDragZoom] = useState(false)
  const [offsetStart, setOffsetStart] = useState([0, 0])
  const [offset, setOffset] = useState([0, 0])

  const wrapperRef = useRef(null)
  const { width, height } = useDivSize(wrapperRef)
  const startRes = Math.min(width, height)

  useEffect(() => {
    setOffset([startRes / -2, startRes / -2])
  }, [startRes])

  const zoomFactor = 1.259921 // This value means we double resolution every 3 steps.

  const resList = resolutions.map(r => parseInt(r)).sort((a, b) => a - b);
  const scale = startRes / 1024 * zoom
  let displayedResolution = resList.reduce((prev, curr) => Math.abs(curr - scale) < Math.abs(prev - scale) ? curr : prev);
  const prevResolution = resList[Math.max(0, resList.indexOf(displayedResolution) - 1)]
  const bgSize = startRes * zoom
  const bgPosition = `${(width / 2) + offset[0] * zoom}px ${(height / 2) + offset[1] * zoom}px`

  const setZoom = z => {
    setZoomState(Math.min(200, Math.max(0.1, z)))
  }

  const startDrag = e => {
    if (e.button === 0) { // Left click
      setOffsetStart([e.pageX - offset[0] * zoom, e.pageY - offset[1] * zoom])
      setDrag(true)
    }
    if (e.button === 2) { // Right click
      setOffsetStart([e.pageX, e.pageY])
      setDragZoom(true)
    }
  }
  const endDrag = e => {
    setDrag(false)
    setDragZoom(false)
  }
  const mouseMove = e => {
    if (drag) {
      setOffset([(e.pageX - offsetStart[0]) / zoom, (e.pageY - offsetStart[1]) / zoom])
    }
    if (dragZoom) {
      setOffsetStart([e.pageX, e.pageY])
      const mult = (e.pageX - offsetStart[0]) * zoom
      setZoom(zoom + mult / 200)
    }
  }

  const disableContextMenu = e => {
    e.preventDefault();
  }

  const imageAtRes = (image, res) => {
    image = image.replace(/\/jpg\/1k\//g, `/jpg/${res}k/`)
    image = image.replace(/_1k\.jpg/g, `_${res}k.jpg`)
    return image
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>

      {/* Base of lower resolution image, seen when next resolution is loading */}
      <div
        className={`${styles.image} ${type !== 1 ? styles.noTile : ''}`}
        style={{
          backgroundImage: `url(${imageAtRes(image, prevResolution)})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPosition,
        }}
      />

      <div className={styles.loading}>
        <div>
          <Spinner />
          <p>Loading {displayedResolution}k resolution...</p>
        </div>
      </div>

      {/* Actual image at optimal resolution */}
      <div
        className={`${styles.image} ${type !== 1 ? styles.noTile : ''}`}
        style={{
          backgroundImage: `url(${imageAtRes(image, displayedResolution)})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPosition,
        }}
        onMouseDown={startDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onMouseMove={mouseMove}
        onContextMenu={disableContextMenu}
      />

      {/* Tiling grid */}
      {grid ?
        <div className={styles.grid} style={{
          backgroundImage: `url(/images/tile_preview_grid.png)`,
          backgroundSize: bgSize,
          backgroundPosition: bgPosition,
        }} />
        : null}

      <div className={styles.buttons}>
        {/* <p>resList:<br />{resList.join('/')}</p> */}
        {/* <p>Res:<br />{displayedResolution}</p> */}
        {/* <p>Prev Res:<br />{prevResolution}</p> */}
        {/* <p>Zoom:<br />{zoom.toFixed(2)}</p> */}
        {/* <p>Scale:<br />{(startRes / 1024 * zoom).toFixed(2)}</p> */}
        {/* <p>Size:<br />{bgSize.toFixed(2)}</p> */}
        {/* <p>{offset.map(v => v.toFixed(2)).join(', ')}</p> */}
        {grid && zoom > 1.5 ? <p>You may need to zoom out to<br />see the tiling preview grid</p> : null}
        {type === 1 ?
          <IconButton icon={<MdGridOn />} onClick={_ => setGrid(!grid)} active={grid} />
          : null}
        <IconButton icon={<MdRemove />} onClick={_ => setZoom(zoom / zoomFactor)} />
        <IconButton icon={<MdAdd />} onClick={_ => setZoom(zoom * zoomFactor)} />
        <IconButton icon={<p>1:1</p>} onClick={_ => setZoom(1 / (startRes / 1024))} />
      </div>
    </div>
  )
}

export default TilePreview
