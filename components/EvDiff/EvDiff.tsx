import { useState, useEffect } from 'react'

import styles from './EvDiff.module.scss'

const EvDiff = () => {
  const [shutterA, set_shutterA] = useState('')
  const [shutterB, set_shutterB] = useState('')
  const [apertureA, set_apertureA] = useState('')
  const [apertureB, set_apertureB] = useState('')
  const [isoA, set_isoA] = useState('')
  const [isoB, set_isoB] = useState('')
  const [filterA, set_filterA] = useState('')
  const [filterB, set_filterB] = useState('')
  const [message, setMessage] = useState('Fill in the fields above, the result will be shown here.')
  const [result, setResult] = useState(0)

  const calcEvs = () => {
    // Calculate EV diff on every state change.

    const getBaseLog = (n, base) => {
      return Math.log(n) / (base ? Math.log(base) : 1)
    }

    const decimals = (i, d) => {
      i = i * Math.pow(10, d)
      i = Math.round(i)
      i = i / Math.pow(10, d)
      return i
    }

    let a_shutter: string | number = shutterA
    let b_shutter: string | number = shutterB
    let a_aperture: string | number = apertureA
    let b_aperture: string | number = apertureB
    let a_iso: string | number = isoA
    let b_iso: string | number = isoB
    let a_filter: string | number = filterA
    let b_filter: string | number = filterB

    const shouldnt_be_empty = [a_shutter, b_shutter, a_aperture, b_aperture, a_iso, b_iso]
    for (let i = 0; i < shouldnt_be_empty.length; i++) {
      if (shouldnt_be_empty[i] == '') {
        return 'Fill in the fields above, the result will be shown here.'
      }
    }

    // Sanity checks
    if (!/^\d+(\/\d+)?(.\d+)?$/.test(a_shutter)) {
      return 'Error: Invalid input for shutter speed A.'
    }
    if (!/^\d+(\/\d+)?(.\d+)?$/.test(b_shutter)) {
      return 'Error: Invalid input for shutter speed B.'
    }
    if (!/^\d*\.?\d+$/.test(a_aperture)) {
      return 'Error: Invalid input for aperture A.'
    }
    if (!/^\d*\.?\d+$/.test(b_aperture)) {
      return 'Error: Invalid input for aperture B.'
    }
    if (!/^\d+$/.test(a_iso)) {
      return 'Error: Invalid input for ISO A.'
    }
    if (!/^\d+$/.test(b_iso)) {
      return 'Error: Invalid input for ISO B.'
    }
    if (!/^\d*\.?\d+$/.test(a_filter)) {
      if (a_filter != '') {
        return 'Error: Invalid input for filter A.'
      } else {
        a_filter = '0'
      }
    }
    if (!/^\d*\.?\d+$/.test(b_filter)) {
      if (b_filter != '') {
        return 'Error: Invalid input for filter B.'
      } else {
        b_filter = '0'
      }
    }

    if (a_shutter.includes('/')) {
      const f = a_shutter.split('/')
      const n = parseFloat(f[0])
      const d = parseFloat(f[1])
      a_shutter = n / d
    } else {
      a_shutter = parseFloat(a_shutter)
    }
    if (b_shutter.includes('/')) {
      const f = b_shutter.split('/')
      const n = parseFloat(f[0])
      const d = parseFloat(f[1])
      b_shutter = n / d
    } else {
      b_shutter = parseFloat(b_shutter)
    }
    a_aperture = parseFloat(a_aperture)
    b_aperture = parseFloat(b_aperture)
    a_iso = parseFloat(a_iso)
    b_iso = parseFloat(b_iso)
    a_filter = parseFloat(a_filter)
    b_filter = parseFloat(b_filter)

    const dr_shutter = getBaseLog(b_shutter / a_shutter, 2)
    const dr_aperture = getBaseLog(a_aperture / b_aperture, Math.sqrt(2))
    const dr_iso = getBaseLog(b_iso / a_iso, 2)
    const dr_filter = a_filter - b_filter

    let dr_total = dr_shutter + dr_aperture + dr_iso + dr_filter

    dr_total = decimals(dr_total, 3)

    setResult(dr_total)
    return 'Complete'
    if (dr_total >= 0) {
      return 'Image A is <strong>' + Math.abs(dr_total) + 'EVs darker</strong> than Image B.'
    } else {
      return 'Image A is <strong>' + Math.abs(dr_total) + 'EVs brighter</strong> than Image B.'
    }
  }

  useEffect(() => {
    setMessage(calcEvs())
  })

  return (
    <div className={styles.wrapper}>
      <h1>EV Difference Calculator</h1>
      <p>
        Use this page to calculate the exposure difference in stops/EVs between two images by inputting the shutter
        speed, aperture, ISO and ND filter reduction (if any).
      </p>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formItem}>
          <h2>Image A: </h2>
          <input
            type="text"
            value={shutterA}
            onChange={(e) => set_shutterA(e.target.value)}
            placeholder="Shutter Speed"
          />
          <input type="text" value={apertureA} onChange={(e) => set_apertureA(e.target.value)} placeholder="Aperture" />
          <input type="text" value={isoA} onChange={(e) => set_isoA(e.target.value)} placeholder="ISO" />
          <input
            type="text"
            value={filterA}
            onChange={(e) => set_filterA(e.target.value)}
            placeholder="ND Filter EVs"
          />
          <br />
        </div>
        <div className={styles.formItem}>
          <h2>Image B:</h2>
          <input
            type="text"
            value={shutterB}
            onChange={(e) => set_shutterB(e.target.value)}
            placeholder="Shutter Speed"
          />
          <input type="text" value={apertureB} onChange={(e) => set_apertureB(e.target.value)} placeholder="Aperture" />
          <input type="text" value={isoB} onChange={(e) => set_isoB(e.target.value)} placeholder="ISO" />
          <input
            type="text"
            value={filterB}
            onChange={(e) => set_filterB(e.target.value)}
            placeholder="ND Filter EVs"
          />
        </div>
        <div className={styles.formItem}>
          {message === 'Complete' ? (
            result >= 0 ? (
              <h2>
                Image A is <pre>{Math.abs(result)}</pre> EVs darker than Image B.
              </h2>
            ) : (
              <h2>
                Image A is <pre>{Math.abs(result)}</pre> EVs brighter than Image B.
              </h2>
            )
          ) : (
            <h2>{message}</h2>
          )}
        </div>
      </form>

      <ul className={styles.info}>
        <li>
          <b>Shutter Speed</b> is in seconds, and supports fractions. E.g. <pre>1/4000</pre> for 1/4000th of a second,
          or <pre>30</pre> for 30 seconds.
        </li>
        <li>
          <b>Aperture</b> should be without the "F/". E.g. <pre>8</pre> for F/8, or <pre>2.2</pre> for F/2.2.
        </li>
        <li>
          <b>ISO</b> is as you'd expect. If left blank, will default to <pre>100</pre>.
        </li>
        <li>
          In the <b>Filter</b> box, type the number of EVs/stops that your filter darkens an image. E.g. for a 3-stop
          filter (AKA "ND8") type <pre>3</pre>, or a 12-stop filter (AKA "ND4096") type <pre>12</pre>. If no filter was
          used, leave it blank or type <pre>0</pre>.
        </li>
      </ul>
    </div>
  )
}

export default EvDiff
