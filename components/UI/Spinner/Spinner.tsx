import styles from './Spinner.module.scss'

const Spinner = (props) => {
  return (
    <div className={`${styles.spinnerWrapper} ${props.className || ''}`}>
      <svg
        className={styles.spinner}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeMiterlimit: 1.5,
        }}
      >
        <g>
          <path
            d="M92,50c0,-13.934 -6.889,-26.347 -17.427,-34"
            style={{ fill: 'none', stroke: '#3abbd9', strokeWidth: '16px' }}
          />
        </g>
        <g>
          <path
            d="M50,92c13.934,0 26.347,-6.889 34,-17.427"
            style={{ fill: 'none', stroke: '#f28237', strokeWidth: '16px' }}
          />
        </g>
        <g>
          <path
            d="M8,50c0,13.934 6.889,26.347 17.427,34"
            style={{ fill: 'none', stroke: '#a1d04d', strokeWidth: '16px' }}
          />
        </g>
        <g>
          <path
            d="M50,8c-13.934,0 -26.347,6.889 -34,17.427"
            style={{ fill: 'none', stroke: '#be6ffd', strokeWidth: '16px' }}
          />
        </g>
      </svg>
    </div>
  )
}

export default Spinner
