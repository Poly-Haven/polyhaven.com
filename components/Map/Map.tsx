import Link from 'next/link'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

import styles from './Map.module.scss'
import { assetImg } from 'utils/cdn'

const Map = ({ hdris }) => {
  return (
    <MapContainer center={[20, 5]} zoom={3} scrollWheelZoom={true} className={styles.mapContainer}>
      <TileLayer
        className={styles.tile}
        attribution='Location markers are approximate. Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Object.keys(hdris).map((slug) => (
        <Marker key={slug} position={hdris[slug]}>
          <Popup>
            <Link href={`/a/${slug}`}>
              {/* No img_version here: `hdris` maps slug -> coordinates, not to the asset
                  document that carries it, so this falls back to the unversioned URL. */}
              <img src={assetImg.thumb(slug, { width: 200, quality: 95 })} width="200" />
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default Map
