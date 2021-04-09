import useSWR from 'swr';

import fetcher from 'utils/fetcher';

import GridItem from './GridItem/GridItem'

const Grid = (props) => {
  let url = `https://api.polyhaven.com/assets?t=${props.assetType}`
  if (props.categories) {
    url += "&c=" + props.categories.join(',')
  }
  const { data, error } = useSWR(url, fetcher, { revalidateOnFocus: false });

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

export default Grid;