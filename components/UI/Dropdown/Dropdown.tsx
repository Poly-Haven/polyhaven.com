import Dropdown from 'react-dropdown';

import styles from './Dropdown.module.scss'

const WrapperDropdown = ({ value, options, onChange }) => {
  return (
    <Dropdown
      className={styles.menu}
      controlClassName={styles.control}
      menuClassName={styles.dropdown}
      placeholderClassName={styles.labelSort}
      arrowClassName={styles.arrow}
      options={options}
      value={value}
      placeholder="Select an option"
      onChange={onChange} />
  )
}

export default WrapperDropdown
