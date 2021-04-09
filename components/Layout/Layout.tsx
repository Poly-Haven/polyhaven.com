import Header from 'components/Header/Header'
import Footer from 'components/Footer/Footer'

import styles from './Layout.module.scss'

const layout = ({ children }) => {
  return (
    <div id={styles.layout}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default layout;