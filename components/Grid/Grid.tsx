import useSWR from 'swr';

import fetcher from 'utils/fetcher';

import GridItem from './GridItem/GridItem'

const Grid = (props) => {
  const { data, error } = useSWR(`https://api.polyhaven.com/assets?t=${props.assetType}`, fetcher, { revalidateOnFocus: false });

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
        return (<GridItem assetID={asset} key={asset}></GridItem>);
      })}
    </div>
  );
}

Grid.get

export default Grid;