import { useState, useEffect, useRef } from 'react'

import { MdExpandMore } from 'react-icons/md'

import Tooltip from 'components/UI/Tooltip/Tooltip'

import styles from './Dropdown.module.scss'

const Dropdown = ({ value, options, label, onChange, small, tooltipSide, tooltipID }) => {
  const [expand, setExpand] = useState(false)
  const ref = useRef(null)

  const toggle = () => {
    setExpand(!expand)
  }

  const handleClickOutside = (event) => {
    if (expand && ref.current && !ref.current.contains(event.target)) {
      setExpand(false)
    }
  }

  const setValue = (e) => {
    setExpand(false)
    onChange(e.target.dataset.value)
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  })

  let buttonValue = <>{Object.keys(options)[0]}</>
  if (Object.keys(options).includes(value)) {
    buttonValue = small ? (
      <>{options[value].icon || options[value].label}</>
    ) : (
      <>
        {options[value].icon ? options[value].icon : null}
        {options[value].label}
      </>
    )
  }

  return (
    <div className={small ? styles.wrapperSmall : styles.wrapper} ref={ref}>
      <div className={small ? styles.buttonSmall : styles.button} onClick={toggle}>
        {label ? `${label}:` : null}
        <div className={styles.buttonValue}>{buttonValue}</div>
        <div className={styles.arrow}>
          <MdExpandMore />
        </div>
      </div>
      <div className={`${styles.menu} ${expand ? styles.show : null}`}>
        {Object.keys(options).map((k, i) => (
          <div
            key={i}
            data-value={k}
            data-tip={options[k].tooltip || null}
            data-for={tooltipID}
            className={`${styles.option} ${k === value ? styles.active : null}`}
            onClick={setValue}
          >
            {options[k].icon ? options[k].icon : null}
            {options[k].label}
          </div>
        ))}
      </div>
      <Tooltip id={tooltipID} place={tooltipSide} />
    </div>
  )
}

Dropdown.defaultProps = {
  label: null,
  small: false,
  tooltipSide: 'right',
  tooltipID: 'dropdown',
}

export default Dropdown
