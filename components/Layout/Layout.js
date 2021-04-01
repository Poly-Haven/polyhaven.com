import React from 'react';

import styles from './Layout.module.scss';

import Header from 'components/Header/Header';
import Library from 'containers/Library/Library';
import Footer from 'components/Footer/Footer';

const layout = () => {
  return (
    <div id={styles.layout}>
      <Header />
      <Library />
      <Footer />
    </div>
  );
}

export default layout;