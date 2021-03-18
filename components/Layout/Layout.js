import React from 'react';

import Header from '../Header/Header';
import Library from '../../containers/Library/Library';
import Footer from '../Footer/Footer';

const layout = () => {
  return (
    <div>
      <Header />
      <Library />
      <Footer />
    </div>
   );
}

export default layout;