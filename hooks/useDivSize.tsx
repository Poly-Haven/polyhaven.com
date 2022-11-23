import { useState, useEffect } from 'react'

export default function useDivSize(ref, updaters = []) {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    function handleResize() {
      if (ref && ref.current) {
        if (ref.current.offsetWidth !== width) setWidth(ref.current.offsetWidth)
        if (ref.current.offsetHeight !== height) setHeight(ref.current.offsetHeight)
      }
    }

    handleResize() // First call

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, updaters)

  return { width, height }
}
