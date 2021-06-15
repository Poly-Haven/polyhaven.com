import TextPage from 'components/Layout/TextPage/TextPage'

const MapPage = () => {
  return (
    <TextPage
      title="Map"
      description="Map of all asset capture locations."
      url="/map"
    >
      <h1>Coming Soon!</h1>
      <p>We haven't yet ported the map to polyhaven.com, but you can still find the old one here: <a href="https://hdrihaven.com/p/map.php">https://hdrihaven.com/p/map.php</a></p>
    </TextPage>
  )
}

export default MapPage