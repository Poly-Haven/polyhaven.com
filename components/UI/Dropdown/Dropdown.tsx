import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import styles from './Dropdown.module.scss'

const WrapperDropdown = ({ value, options, onChange, small }) => {
  return (
    <Dropdown
      className={small ? styles.menuSml : styles.menu}
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

WrapperDropdown.defaultProps = {
  small: false
}

export default WrapperDropdown
