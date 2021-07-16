import { useState, useEffect } from 'react'

export default function useDivWidth(ref) {
  const [width, setWidth] = useState(0)

  useEffect(() => {

    function handleResize() {
      setWidth(ref.current.offsetWidth)
    }

    handleResize() // First call

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width
}
