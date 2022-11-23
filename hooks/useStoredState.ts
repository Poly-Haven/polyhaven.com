import { useState, useEffect } from 'react'

export default function useStoredState(key: string, defaultValue) {
  /*
    An alternative to useState that remembers the value for next time using localStorage.
  */

  const [val, setVal] = useState(defaultValue)

  const extSetVal = (v) => {
    setVal(v)
    localStorage.setItem(key, JSON.stringify(v))
  }

  useEffect(() => {
    const storedValue = JSON.parse(localStorage.getItem(key))
    const v = storedValue !== null ? storedValue : defaultValue
    setVal(v)
  }, [])

  return [val, extSetVal]
}
