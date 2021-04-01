import React from 'react';

import styles from './Library.module.scss';

import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';

const Library = () => {
  return (
    <div id={styles.library}>
      <Sidebar />
      <Grid type='textures' />
    </div>
  );
}

export default Library;