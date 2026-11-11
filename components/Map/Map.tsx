import { useEffect, useRef, useState, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import L from 'leaflet'
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet'
import { createPathComponent } from '@react-leaflet/core'
import { getRTLTextPluginStatus, setRTLTextPlugin } from 'maplibre-gl'
import 'leaflet.markercluster'
import '@maplibre/maplibre-gl-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

import styles from './Map.module.scss'
import { assetImg } from 'utils/cdn'

// [slug, lat, lon, name, img_version]
export type MapHdri = [string, number, number, string, string | null]

// OpenFreeMap: free vector tiles of OSM data, no key or usage limits. Vector rather than raster
// so the labels can be drawn in the visitor's language - raster OSM tiles bake in each place's
// local name.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'

// Without this, Arabic, Persian and Hebrew labels draw as disconnected letters in the wrong order.
// Lazy: it is only fetched once a right-to-left label is actually on screen. (MapLibre 6 shapes RTL
// itself, but its separate worker file can't be emitted by Next 14's webpack, hence 5.x.)
if (getRTLTextPluginStatus() === 'unavailable') {
  setRTLTextPlugin('https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js', true).catch((e) =>
    console.error('Failed to load RTL text plugin', e)
  )
}

// The tiles carry `name:<lang>` for ~70 languages, covering all our locales except Burmese, which
// falls through to English. Only two of ours need mapping: the tiles have no pt-BR (European `pt`
// is the closest), and their plain `zh` sometimes holds both scripts ("乌克兰/烏克蘭"), so the
// simplified `zh-Hans` our `zh` locale uses comes first - but it's missing for some countries
// (Spain, Norway) that do have a `zh`, so that stays as the next choice.
const tileLanguages = (locale: string): string[] => {
  if (locale === 'zh') return ['zh-Hans', 'zh']
  return [locale.split('-')[0]]
}

// Point every label that shows a place name at the visitor's language, then English, then the
// local name as a last resort. The stock style shows "latin \n nonlatin" pairs, which is the
// local name for most of the world.
const localizeStyle = (style, langs: string[]) => {
  const textField = ['coalesce', ...langs.map((l) => ['get', `name:${l}`]), ['get', 'name:en'], ['get', 'name']]
  for (const layer of style.layers) {
    const field = layer.layout?.['text-field']
    if (field && JSON.stringify(field).includes('"name')) {
      layer.layout['text-field'] = textField
    }
  }
  return style
}

const VectorBaseMap = ({ locale, attribution }: { locale: string; attribution: string }) => {
  const map = useMap()
  useEffect(() => {
    let layer: L.MaplibreGL | null = null
    let cancelled = false
    fetch(STYLE_URL)
      .then((res) => res.json())
      .then((style) => {
        if (cancelled) return
        layer = L.maplibreGL({ style: localizeStyle(style, tileLanguages(locale)), attributionControl: false })
        // The plugin reads attribution from the GL style's sources, which is empty until the
        // TileJSON loads, so state it on the Leaflet layer instead.
        layer.getAttribution = () => attribution
        layer.addTo(map)
      })
      .catch((e) => console.error('Failed to load map style', e))
    return () => {
      cancelled = true
      layer?.remove()
    }
  }, [map, locale, attribution])
  return null
}

const clusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount()
  const size = count < 10 ? 32 : count < 100 ? 38 : 44
  return L.divIcon({ html: `<span>${count}</span>`, className: styles.cluster, iconSize: L.point(size, size) })
}

// 150 of our HDRIs share their exact coordinates with another, so without clustering most of
// those markers can never be clicked. At max zoom a cluster fans out ("spiderfies") instead.
const MarkerClusterGroup = createPathComponent<L.MarkerClusterGroup, L.MarkerClusterGroupOptions & { children: ReactNode }>(
  ({ children: _children, ...options }, ctx) => {
    const group = L.markerClusterGroup(options)
    return { instance: group, context: { ...ctx, layerContainer: group } }
  }
)

// `/map?asset=<slug>` (linked from each asset page) opens zoomed in on that HDRI with its popup open.
const FocusAsset = ({ slug, group, markers }) => {
  const done = useRef(false)
  useEffect(() => {
    const marker = markers.current[slug]
    if (done.current || !group || !marker) return
    done.current = true
    group.zoomToShowLayer(marker, () => marker.openPopup())
  }, [slug, group, markers])
  return null
}

const Map = ({ hdris }: { hdris: MapHdri[] }) => {
  const { t } = useTranslation('map')
  const { locale } = useRouter()
  const markers = useRef<Record<string, L.Marker>>({})
  const [group, setGroup] = useState<L.MarkerClusterGroup | null>(null)

  // This component never renders on the server (see pages/map.tsx), so window is safe here, and
  // reading it directly avoids waiting for the router's query to become ready.
  const [focus] = useState(() => {
    const slug = new URLSearchParams(window.location.search).get('asset')
    // Puresky variants aren't plotted (they'd sit on top of their source HDRI), so show that one.
    const hdri = hdris.find((h) => h[0] === slug) || hdris.find((h) => h[0] === slug?.replace(/_puresky$/, ''))
    return hdri ? { slug: hdri[0], center: [hdri[1], hdri[2]] as [number, number] } : null
  })

  return (
    <MapContainer
      center={focus ? focus.center : [20, 5]}
      zoom={focus ? 12 : 3}
      minZoom={2}
      // Markers are approximate, and HDRIs sharing a spot only fan out at max zoom - at 18 that
      // left them on a blank, featureless map.
      maxZoom={15}
      scrollWheelZoom={true}
      className={styles.mapContainer}
    >
      <VectorBaseMap locale={locale} attribution={`${t('approximate')} ${ATTRIBUTION}`} />
      <MarkerClusterGroup ref={setGroup} iconCreateFunction={clusterIcon} showCoverageOnHover={false} chunkedLoading>
        {hdris.map(([slug, lat, lon, name, version]) => (
          <Marker
            key={slug}
            position={[lat, lon]}
            ref={(m) => {
              if (m) markers.current[slug] = m
            }}
          >
            <Popup>
              <Link href={`/a/${slug}`} className={styles.popup}>
                <img
                  src={assetImg.thumb(slug, { width: 200, quality: 95, format: 'webp' }, version)}
                  width="200"
                  height="150"
                  alt={name}
                />
                <span>{name}</span>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      {focus && <FocusAsset slug={focus.slug} group={group} markers={markers} />}
    </MapContainer>
  )
}

export default Map
