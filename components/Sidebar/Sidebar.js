import React from 'react';

import tlc from 'constants/tlc.json';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  const type = props.type ? props.type : "";

  return (
    <div id={styles.sidebar}>
      {tlc[type].map(tlc => {
        return (<div>{tlc}</div>);
      })}
    </div>
  );
}

export default Sidebar;