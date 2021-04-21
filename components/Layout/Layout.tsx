import Header from 'components/Layout/Header/Header'

import styles from './Layout.module.scss'

const layout = ({ children }) => {
  return (
    <div id={styles.layout}>
      <Header />
      <div className={styles.page}>{children}</div>
    </div>
  );
}

export default layout;