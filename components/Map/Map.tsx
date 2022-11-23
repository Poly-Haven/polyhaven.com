import Link from 'next/link'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

import styles from './Map.module.scss'

const Map = ({ hdris }) => {
  return (
    <MapContainer center={[20, 5]} zoom={3} scrollWheelZoom={true} className={styles.mapContainer}>
      <TileLayer
        className={styles.tile}
        attribution='Location markers are approximate. Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Object.keys(hdris).map((slug) => (
        <Marker key={slug} position={hdris[slug].coords}>
          <Popup>
            <Link href={`/a/${slug}`}>
              <a>
                <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=200`} width="200" />
              </a>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default Map
