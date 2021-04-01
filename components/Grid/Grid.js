import React from 'react';
import useSWR from 'swr';

import GridItem from './GridItem/GridItem'

const fetcher = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

const Grid = (props) => {
  const type = props.type ? props.type : "";

  const { data, error } = useSWR(`https://api.polyhaven.com/assets?t=textures&test`, fetcher, { revalidateOnFocus: false });

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