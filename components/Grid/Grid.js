import React from 'react';
import useSWR from 'swr';

import fetcher from 'utils/fetcher';

import GridItem from './GridItem/GridItem'

const Grid = (props) => {
  const type = props.type ? props.type : "";

  const { data, error } = useSWR(`https://api.polyhaven.com/assets?t=textures`, fetcher, { revalidateOnFocus: false });

  if (error) {
    return (
      <div>Error</div>
    )
  }

  if (!data) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <div>
      {Object.keys(data).map(asset => {
        return (<GridItem id={asset} key={asset}></GridItem>);
      })}
    </div>
  );
}

Grid.get

export default Grid;