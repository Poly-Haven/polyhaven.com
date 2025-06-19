import { useState, useEffect, useRef } from 'react'

import useDivSize from 'hooks/useDivSize'
import Button from 'components/UI/Button/Button'
import Heart from 'components/UI/Icons/Heart'
import Blender from 'components/UI/Icons/Blender'
import Unreal from 'components/UI/Icons/Unreal'

import { MdInfo } from 'react-icons/md'

import { titleCase } from 'utils/stringUtils'

import styles from './CollectionHeader.module.scss'

const CollectionHeader = ({ collection }) => {
  const wrapperRef = useRef(null)
  const textRef = useRef(null)
  const { width } = useDivSize(wrapperRef)
  const [imageWidth, setImageWidth] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  // Super fancy scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Set imageWidth once on load
  useEffect(() => {
    if (imageWidth === 0) {
      setImageWidth(width)
    }
  }, [width])

  const softwareIcons = {
    blender: <Blender />,
    unreal: <Unreal />,
  }

  const backgroundImage = `https://cdn.polyhaven.com/collections/${collection.id}.png?width=${imageWidth}&quality=95`

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: `center ${Math.min(100, 50 + (scrollY / 512) * 20)}%`,
      }}
    >
      <div className={styles.gradient} />
      {collection.community && (
        <div className={styles.banner}>
          <div className={styles.bannerInner}>
            <Heart /> Community Project
          </div>
        </div>
      )}
      <div
        className={styles.text}
        ref={textRef}
        style={{
          transform: `translateY(${scrollY / 2}px)`,
          opacity: Math.max(0, 1 - scrollY / 260 + 0.65),
        }}
      >
        <h1>Collection: {collection.name}</h1>
        <p>{collection.description}</p>
      </div>
      <div className={styles.buttons}>
        <Button href={collection.project_link} text="About the Project" icon={<MdInfo />} />
        {Object.keys(collection.scene).map((software, i) => (
          <Button
            text={`Download the ${Object.keys(collection.scene).length > 1 ? `${titleCase(software)} ` : ''}Scene`}
            href={collection.scene[software]}
            icon={softwareIcons[software]}
            key={i}
          />
        ))}
      </div>
    </div>
  )
}

export default CollectionHeader
