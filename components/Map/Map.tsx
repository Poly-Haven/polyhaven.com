import { useCallback, useEffect, useMemo, useRef, useState, MutableRefObject, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { createPathComponent, EventedProps } from '@react-leaflet/core'
import { getRTLTextPluginStatus, setRTLTextPlugin } from 'maplibre-gl'
import 'leaflet.markercluster'
import '@maplibre/maplibre-gl-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MdFirstPage, MdMenu, MdRefresh } from 'react-icons/md'
import dynamic from 'next/dynamic'

import styles from './Map.module.scss'
import { assetImg } from 'utils/cdn'
import { timeago } from 'utils/dateUtils'
import Avatar from 'components/UI/Avatar/Avatar'
import { MapHdri, toMapHdri } from './mapData'
import type { FilterResult } from './MapFilters'
import { MAP_HIDDEN_ATTRIBUTES } from './mapData'
import attributeData from 'constants/attributes.json'

// Search, filters and the sidebar: a separate chunk, fetched only once they're used (see MapFilters).
const MapFilters = dynamic(() => import('./MapFilters'), {
  ssr: false,
  // The chunk failed to load (e.g. a tab left open across a deploy): offer a reload rather than a
  // toggle that silently opens nothing. English only, on purpose: very rare, not worth translating.
  loading: ({ error }) =>
    error ? (
      <div className={styles.filtersFailed}>
        <p>Couldn't load the filters.</p>
        <button type="button" onClick={() => window.location.reload()}>
          <MdRefresh /> Try again
        </button>
      </div>
    ) : null,
})

// Query params that filter the map, known without loading the filtering code: the same as the
// library's (?s=, ?a=, attribute keys) plus ?c= for the category.
const FILTER_PARAMS = [
  's',
  'a',
  'c',
  ...Object.keys((attributeData as any).types.hdris).filter((key) => !MAP_HIDDEN_ATTRIBUTES.includes(key)),
]
const hasFilterParams = (query: Record<string, any>) =>
  FILTER_PARAMS.some((key) => typeof query[key] === 'string' && query[key].trim() !== '')

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
// falls through to English. Three of ours need mapping: the tiles have no pt-BR (European `pt` is
// the closest), and their plain `zh` sometimes holds both scripts ("乌克兰/烏克蘭"), so the
// simplified `zh-Hans` our `zh` locale uses comes first - but it's missing for some countries
// (Spain, Norway) that do have a `zh`, so that stays as the next choice. Hindi gets English:
// MapLibre 5 has no complex text shaping, so Devanagari draws with misplaced vowel signs and
// broken conjuncts.
const tileLanguages = (locale: string): string[] => {
  if (locale === 'zh') return ['zh-Hans', 'zh']
  if (locale === 'hi') return []
  return [locale.split('-')[0]]
}

// Point every label that shows a place name at the visitor's language, then English, then the
// tiles' Latin transliteration, then the local name as a last resort. The stock style shows
// "latin \n nonlatin" pairs, which is the local name for most of the world.
const localizeStyle = (style, langs: string[]) => {
  const textField = [
    'coalesce',
    ...langs.map((l) => ['get', `name:${l}`]),
    ['get', 'name:en'],
    ['get', 'name:latin'],
    ['get', 'name'],
  ]
  for (const layer of style.layers) {
    const field = layer.layout?.['text-field']
    if (field && JSON.stringify(field).includes('"name')) {
      layer.layout['text-field'] = textField
    }
  }
  return style
}

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const VectorBaseMap = ({ locale, attribution }: { locale: string; attribution: string }) => {
  const map = useMap()
  // Without WebGL (disabled, blocklisted GPU, hardened browsers) MapLibre can't draw at all, so
  // those visitors get the plain OSM raster tiles this page used before: local-language labels,
  // but a working map.
  const [rasterFallback, setRasterFallback] = useState(() => !hasWebGL())
  useEffect(() => {
    if (rasterFallback) return
    let layer: L.MaplibreGL | null = null
    let cancelled = false
    fetch(STYLE_URL)
      .then((res) => res.json())
      .then((style) => {
        if (cancelled) return
        const gl = L.maplibreGL({ style: localizeStyle(style, tileLanguages(locale)), attributionControl: false })
        // The plugin reads attribution from the GL style's sources, which is empty until the
        // TileJSON loads, so state it on the Leaflet layer instead.
        gl.getAttribution = () => attribution
        try {
          gl.addTo(map)
          layer = gl
        } catch (e) {
          // MapLibre threw after Leaflet had already registered the layer's move/zoom handlers,
          // which would now throw on every zoom. Detach it without the plugin's onRemove (it
          // assumes a GL map that was never made).
          console.error('Vector map failed, falling back to raster tiles', e)
          gl.onRemove = () => gl
          map.removeLayer(gl)
          gl.getContainer()?.remove()
          setRasterFallback(true)
        }
      })
      .catch((e) => console.error('Failed to load map style', e))
    return () => {
      cancelled = true
      layer?.remove()
    }
  }, [map, locale, attribution, rasterFallback])

  if (rasterFallback) {
    return (
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={`${
          attribution.split(' <a')[0]
        } Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`}
      />
    )
  }
  return null
}

const clusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount()
  const size = count < 10 ? 26 : count < 100 ? 30 : 34
  return L.divIcon({ html: `<span>${count}</span>`, className: styles.cluster, iconSize: L.point(size, size) })
}

// A dot in the clusters' colours instead of Leaflet's stock blue pin. Anchored at its centre; the
// popup's arrow (see the Popup offset) then points at the top of the dot.
const markerIcon = L.divIcon({ className: styles.marker, iconSize: [16, 16], popupAnchor: [0, -8] })

// 150 of our HDRIs share their exact coordinates with another, so without clustering most of
// those markers can never be clicked. At max zoom a cluster fans out ("spiderfies") instead.
const MarkerClusterGroup = createPathComponent<
  L.MarkerClusterGroup,
  L.MarkerClusterGroupOptions & EventedProps & { children: ReactNode }
>(({ children: _children, eventHandlers: _eventHandlers, ...options }, ctx) => {
  const group = L.markerClusterGroup(options)
  return { instance: group, context: { ...ctx, layerContainer: group } }
})

// Markers this close together are treated as one spot (150 HDRIs share exact coordinates with
// another): zooming in can never separate them, so they fan out where they are instead.
const SAME_SPOT_METRES = 30
const isSingleSpot = (bounds: L.LatLngBounds) =>
  bounds.getNorthEast().distanceTo(bounds.getSouthWest()) < SAME_SPOT_METRES
const sharesSpot = (hdri: MapHdri, all: MapHdri[]) => {
  const here = L.latLng(hdri[1], hdri[2])
  return all.some((h) => h[0] !== hdri[0] && here.distanceTo([h[1], h[2]]) < SAME_SPOT_METRES)
}

// markercluster's own counters, which it doesn't expose: `_inZoomAnimation` is non-zero while it
// re-clusters, and spiderfy() silently does nothing during that; Leaflet's `_animatingZoom` is
// true during a zoom animation, which collapses any fan when it ends.
type Busy = { _inZoomAnimation?: number; _animatingZoom?: boolean }

// Runs `fn` once the map has stopped zooming and markercluster has finished re-clustering. First
// checked after the next animation frame: an animated setView/fitBounds only starts (and only sets
// _animatingZoom) on the frame after it's called, so checking sooner mistook a queued zoom for an
// idle map. Then a tick later, so markercluster's own zoomend handler has had its turn.
const whenSettled = (map: L.Map, group: L.MarkerClusterGroup, fn: () => void) => {
  const check = () => {
    if ((map as L.Map & Busy)._animatingZoom) return void map.once('zoomend', () => setTimeout(check, 0))
    if ((group as L.MarkerClusterGroup & Busy)._inZoomAnimation)
      return void group.once('animationend', () => setTimeout(check, 0))
    fn()
  }
  L.Util.requestAnimFrame(() => setTimeout(check, 0))
}

// Fans out `cluster` and then runs `then` - unless markercluster declined (it does while
// animating), so a leftover 'spiderfied' listener can't fire on some later, unrelated fan.
const spiderfyThen = (group: L.MarkerClusterGroup, cluster: L.MarkerCluster, then: () => void) => {
  group.once('spiderfied', then)
  cluster.spiderfy()
  if ((group as L.MarkerClusterGroup & { _spiderfied?: unknown })._spiderfied !== cluster) group.off('spiderfied', then)
}

// Replaces markercluster's own click handling, which zooms all the way to max zoom before it
// fans out a group sharing one spot - in the countryside that lands on an empty map.
type ClusterEvent = L.LeafletEvent & { layer: L.MarkerCluster; originalEvent?: Event }

const zoomOrSpiderfy = (map: L.Map, group: L.MarkerClusterGroup, cluster: L.MarkerCluster) => {
  if (isSingleSpot(cluster.getBounds())) {
    if (map.getZoom() >= SHARED_SPOT_ZOOM) return cluster.spiderfy()
    // Fanned out at world zoom, the dots land on top of neighbouring groups; go to street level
    // first, then fan out the spot's group there - if the user hasn't zoomed elsewhere meanwhile.
    const child = cluster.getAllChildMarkers()[0]
    map.setView(cluster.getLatLng(), SHARED_SPOT_ZOOM)
    whenSettled(map, group, () => {
      if (map.getZoom() !== SHARED_SPOT_ZOOM) return
      const parent = group.getVisibleParent(child)
      if (parent && parent !== child && isSingleSpot((parent as L.MarkerCluster).getBounds())) {
        ;(parent as L.MarkerCluster).spiderfy()
      }
    })
  } else if (map.getZoom() >= map.getMaxZoom()) {
    cluster.spiderfy()
  } else {
    cluster.zoomToBounds({ padding: [40, 40] })
  }
}

// Keep ?asset= in step with the open popup, so the address bar is always a link to what's on
// screen. Router (not useRouter) so a deferred call reads the current query, not a stale one.
const setAssetParam = (slug: string | null) => {
  const { asset, ...query } = Router.query
  if ((asset ?? null) === slug) return
  Router.replace({ pathname: Router.pathname, query: slug ? { ...query, asset: slug } : query }, undefined, {
    shallow: true,
    scroll: false,
  })
}

// The popup thumbnail, at 1x and 2x so high-DPI screens get a sharp one. Shared by the <img> and
// the hover preload so both ask for exactly the same URLs.
const THUMB_WIDTH = 200
const thumbSrc = (slug: string, version: string | null, scale = 1) =>
  assetImg.thumb(slug, { width: THUMB_WIDTH * scale, quality: 95, format: 'webp' }, version)
const thumbSrcSet = (slug: string, version: string | null) =>
  `${thumbSrc(slug, version)} 1x, ${thumbSrc(slug, version, 2)} 2x`

// Start fetching a popup's thumbnail when its marker is hovered, so it's usually there by the time
// the popup opens. Same src/srcset as the popup's <img>, so the browser picks the same candidate
// and the popup reuses it from cache.
const preloaded = new Set<string>()
const preloadThumb = (slug: string, version: string | null) => {
  if (preloaded.has(slug)) return
  preloaded.add(slug)
  const img = new Image()
  img.srcset = thumbSrcSet(slug, version)
  img.src = thumbSrc(slug, version)
}

// The popup's content: thumbnail, name, then the photographer and how long ago it was captured.
// The `time` strings are written as standalone labels ("Vor 11 Jahren", "Il y a 11 ans"); after
// the photographer's name they continue a phrase, so they start lower-case. The separator follows
// the script's own comma.
// Its own element, so in right-to-left pages it lands between name and date whatever their scripts.
const BYLINE_SEPARATOR: Record<string, string> = { ar: '،', fa: '،', ja: '、', zh: '、' }

const PopupCard = ({ hdri: [slug, , , name, version, dateTaken, photographer] }: { hdri: MapHdri }) => {
  const { t, i18n } = useTranslation('time')
  const locale = i18n.language
  const firstName = photographer?.split(' ')[0]
  // How long ago it was captured.
  const ago = dateTaken ? timeago(dateTaken * 1000, t) : null
  const agoInPhrase = ago && firstName ? ago.charAt(0).toLocaleLowerCase(locale) + ago.slice(1) : ago
  return (
    // The thumbnail and avatar carry empty alt text: the link's name is already the HDRI name and
    // byline written out, and repeating them makes screen readers read everything twice.
    <Link href={`/a/${slug}`} className={styles.popup}>
      <img src={thumbSrc(slug, version)} srcSet={thumbSrcSet(slug, version)} width={THUMB_WIDTH} height="150" alt="" />
      <span className={styles.name} title={name}>
        {name}
      </span>
      {/* Always rendered, even empty, so the card keeps its size. The name and the date are
          separate so that when space runs out it's the name that gets cut, not the date. */}
      <span className={styles.meta}>
        {photographer && <Avatar id={photographer} size={40} alt="" />}
        {firstName && <span className={styles.firstName}>{firstName}</span>}
        {firstName && agoInPhrase && (
          <span className={locale === 'ja' || locale === 'zh' ? styles.separator : styles.separatorSpaced}>
            {BYLINE_SEPARATOR[locale] ?? ','}
          </span>
        )}
        {agoInPhrase && <span className={styles.ago}>{agoInPhrase}</span>}
      </span>
    </Link>
  )
}

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Opens a marker's popup wherever the view is: fanning out its group if it shares a spot (going
// to street level first, as zoomOrSpiderfy does), otherwise zooming until it's on its own. Used for
// deep links, Back/Forward to a URL with ?asset=, and keeping a popup open through filter changes.
const SHARED_SPOT_ZOOM = 15
const focusMarker = (map: L.Map, group: L.MarkerClusterGroup, marker: L.Marker, shared: boolean) =>
  whenSettled(map, group, () => {
    if (!group.hasLayer(marker)) return setAssetParam(null)
    // A shared spot is fanned out at street level. Go there unless already there: zoomToShowLayer
    // would zoom all the way to max zoom to separate markers that never separate.
    if (shared && (map.getZoom() < SHARED_SPOT_ZOOM || !map.getBounds().contains(marker.getLatLng()))) {
      map.setView(marker.getLatLng(), Math.max(map.getZoom(), SHARED_SPOT_ZOOM))
      return whenSettled(map, group, () => revealAndOpen(group, marker))
    }
    revealAndOpen(group, marker)
  })

const revealAndOpen = (group: L.MarkerClusterGroup, marker: L.Marker) => {
  // Filtered out by the sidebar while this waited (a removed marker has no cluster parent, and
  // zoomToShowLayer would throw on it): nothing to show, so drop it from the URL.
  if (!group.hasLayer(marker)) return setAssetParam(null)
  const parent = group.getVisibleParent(marker)
  if (parent === marker) {
    if (!marker.isPopupOpen()) marker.openPopup()
  } else if (parent && isSingleSpot((parent as L.MarkerCluster).getBounds())) {
    // Only ever a group on one spot: fanning out a wider cluster scattered whole regions.
    spiderfyThen(group, parent as L.MarkerCluster, () => marker.openPopup())
  } else {
    group.zoomToShowLayer(marker, () => marker.openPopup())
  }
}

// `/map?asset=<slug>` (linked from each asset page) opens zoomed in on that HDRI with its popup open.
// One that shares its spot opens at SHARED_SPOT_ZOOM with its group fanned out (see zoomOrSpiderfy).
const FocusAsset = ({ slug, shared, group, markers }) => {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    const marker: L.Marker = markers.current[slug]
    // Not in the group: hidden by the sidebar's filters.
    if (done.current || !group || !marker || !group.hasLayer(marker)) return
    done.current = true
    focusMarker(map, group, marker, shared)
  }, [map, slug, shared, group, markers])
  return null
}

// `_source` is the layer a popup is bound to; Leaflet sets it but doesn't document it.
const popupSource = (popup: L.Popup) => (popup as L.Popup & { _source?: L.Marker })._source

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

// Popup behaviour that belongs to the map as a whole. Its own component, rendered ahead of the
// markers, because React runs a child's effects before its parent's: as an effect on Map it was
// attached only after FocusAsset had already opened a deep-linked popup, which then missed it.
const PopupSync = ({
  slugs,
  group,
  closeLabel,
}: {
  slugs: MutableRefObject<WeakMap<L.Marker, string>>
  group: L.MarkerClusterGroup | null
  closeLabel: string
}) => {
  const map = useMap()
  useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout> | undefined
    let focusTimer: ReturnType<typeof setTimeout> | undefined
    let zooming = false
    // A popup closed by a zoom, to reopen once the zoom is over (see onClose).
    let pendingRestore: L.Marker | null = null
    // Bumped by anything that should cancel a restore in flight: a popup opening, a new zoom
    // (which re-queues it), the effect being torn down.
    let restoreId = 0
    let restoring: L.Marker | null = null

    // On the map rather than the cluster group: when markercluster re-clusters or culls a marker
    // (zooming out, panning away) it detaches the marker from the group's events before removing
    // it, so that popup's close never reaches the group and ?asset= would outlive the popup.
    const onOpen = (e: L.PopupEvent) => {
      clearTimeout(clearTimer)
      clearTimeout(focusTimer)
      restoreId++
      restoring = null
      pendingRestore = null
      const element = e.popup.getElement()
      const marker = popupSource(e.popup)
      // Leaflet hard-codes this label in English.
      element?.querySelector('.leaflet-popup-close-button')?.setAttribute('aria-label', closeLabel)

      // Move focus into the popup when it was opened from its marker (Enter, or a click, which
      // focuses the marker), so the next Tab is the close button rather than the next of hundreds
      // of markers. Not otherwise: on a deep link's page load Chrome would draw a focus ring round
      // the card for every visitor, and a zoom button or the map itself should keep focus
      // (blurring the map ends Leaflet's arrow-key panning). The content renders a moment after
      // the popup opens (react-leaflet mounts it from this event), so keep trying.
      const active = document.activeElement
      if (active && active === marker?.getElement()) {
        let tries = 0
        const attempt = () => {
          const link = element?.querySelector<HTMLElement>(`.${styles.popup}`)
          link?.focus({ preventScroll: true })
          if ((!link || document.activeElement !== link) && ++tries < 20) focusTimer = setTimeout(attempt, 50)
        }
        focusTimer = setTimeout(attempt, 0)
      }

      const slug = slugs.current.get(marker)
      if (slug) setAssetParam(slug)
    }

    const onClose = (e: L.PopupEvent) => {
      clearTimeout(focusTimer)
      const marker = popupSource(e.popup)
      // A fanned-out group collapses on any zoom, closing its popup, and markers on one spot never
      // separate - so the popup could never survive a zoom. Reopen it once the zoom is over
      // (fanning the group out again), unless the zoom merged it into a wider group.
      if (zooming && marker && group) {
        pendingRestore = marker
      } else {
        // Opening a popup closes the previous one first; deferring the clear lets that open
        // cancel it, rather than racing two replaces.
        clearTimer = setTimeout(() => setAssetParam(null), 0)
      }
      // If focus is inside the closing popup it drops to <body> when Leaflet removes it (after its
      // 200ms fade), sending the next Tab back to the page header. Return it to the marker now, or
      // to the map if the marker isn't on screen.
      const active = document.activeElement
      if (!zooming && (!active || active === document.body || e.popup.getElement()?.contains(active))) {
        ;(marker?.getElement() ?? map.getContainer()).focus({ preventScroll: true })
      }
    }

    const restore = () => {
      const marker = pendingRestore
      pendingRestore = null
      if (!marker || !group) return
      const id = ++restoreId
      restoring = marker
      whenSettled(map, group, () => {
        if (id !== restoreId) return
        restoring = null
        const parent = group.getVisibleParent(marker)
        if (parent === marker) {
          marker.openPopup()
        } else if (parent && isSingleSpot((parent as L.MarkerCluster).getBounds())) {
          spiderfyThen(group, parent as L.MarkerCluster, () => {
            if (id === restoreId) marker.openPopup()
          })
        } else {
          setAssetParam(null)
        }
      })
    }

    const onZoomStart = () => {
      zooming = true
      // A restore still waiting from the previous zoom would act mid-zoom and be undone when this
      // one ends; hand it to this zoom's end instead.
      if (restoring) {
        pendingRestore = restoring
        restoring = null
        restoreId++
      }
    }
    const onZoomEnd = () => {
      zooming = false
      restore()
    }

    // Leaflet only closes a popup on Escape while the map itself has keyboard focus, which it
    // doesn't after a deep link or clicking a marker. Not while typing (site search, IME input) or
    // when something else already handled the key (a dropdown).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing || isTyping(e.target)) return
      map.closePopup()
    }

    map.on({ popupopen: onOpen, popupclose: onClose, zoomstart: onZoomStart, zoomend: onZoomEnd })
    document.addEventListener('keydown', onKey)
    return () => {
      map.off({ popupopen: onOpen, popupclose: onClose, zoomstart: onZoomStart, zoomend: onZoomEnd })
      document.removeEventListener('keydown', onKey)
      clearTimeout(clearTimer)
      clearTimeout(focusTimer)
      restoreId++
    }
  }, [map, slugs, group, closeLabel])
  return null
}

// The hamburger above the zoom buttons that opens the sidebar. A Leaflet control (so it sits in
// the same corner stack as the zoom buttons, added first so it's on top) with React rendered into it.
const SidebarToggle = ({ open, active, label, onToggle }) => {
  const map = useMap()
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const Control = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', `leaflet-bar ${styles.toggle}`)
        L.DomEvent.disableClickPropagation(div)
        return div
      },
    })
    const control = new Control({ position: 'topleft' }).addTo(map)
    setContainer(control.getContainer())
    return () => {
      control.remove()
    }
  }, [map])
  if (!container) return null
  return createPortal(
    <a
      href="#"
      role="button"
      title={label}
      aria-label={label}
      aria-expanded={open}
      onClick={(e) => {
        e.preventDefault()
        // React handles this at the control (the portal's container), before the click reaches the
        // map, and re-renders at once - swapping the icon removes the clicked element. Leaflet then
        // can't tell the click came from a control, takes it as a click on the map, and closes the
        // open popup. So the click stops here.
        e.stopPropagation()
        // detail is 0 for a click made with the keyboard (Enter on the focused button).
        onToggle(e.detail === 0)
      }}
      // role="button" promises Space as well as Enter.
      onKeyDown={(e) => {
        if (e.key !== ' ') return
        e.preventDefault()
        e.stopPropagation()
        onToggle(true)
      }}
    >
      {open ? <MdFirstPage /> : <MdMenu />}
      {/* Filters are narrowing the map while the panel is closed. */}
      {active && !open ? <span className={styles.toggleDot} /> : null}
    </a>,
    container
  )
}

// Shows only the markers the sidebar's search and filters leave (all of them when `visible` is
// null). Done on the cluster group directly, in batches - removeLayers/addLayers re-cluster once,
// where unmounting hundreds of <Marker>s would re-cluster per marker - and the markers stay mounted.
// Fits the view to what's left whenever the filtering changes.
//
// Applied only once the map has settled, and only the latest change: markers added while a zoom
// animation is still running (e.g. clearing two filters in quick succession, the second landing
// mid-fit) were put in the group but never drawn - Bergen, Shudu Lake, Orbita and others simply
// went missing until a reload.
const sameMembers = (a: Set<string> | null, b: Set<string> | null) =>
  a === b || (a !== null && b !== null && a.size === b.size && Array.from(a).every((slug) => b.has(slug)))

const MarkerVisibility = ({ visible, pending, markers, markerCount, group, allBounds, focusSlug, sharedSlugs }) => {
  const map = useMap()
  const previous = useRef<Set<string> | null | undefined>(undefined)
  useEffect(() => {
    // Nothing to apply until the filters have an answer - and the first answer must not be spent on
    // the "everything" shown while loading, or a deep link's popup gets fitted away when it lands.
    if (!group || pending) return
    let cancelled = false
    whenSettled(map, group, () => {
      if (cancelled) return
      const toRemove: L.Marker[] = []
      const toAdd: L.Marker[] = []
      // The open popup, if the new set keeps its marker: removing the rest of a fanned group
      // collapses the fan and closes it, so it's reopened below - and the view stays on it.
      let keep: [string, L.Marker] | null = null
      for (const [slug, marker] of Object.entries(markers.current) as [string, L.Marker][]) {
        if (marker.isPopupOpen() && (!visible || visible.has(slug))) keep = [slug, marker]
        const want = !visible || visible.has(slug)
        const has = group.hasLayer(marker)
        if (want && !has) toAdd.push(marker)
        else if (!want && has) toRemove.push(marker)
      }
      if (toRemove.length) {
        if (toRemove.some((m) => m.isPopupOpen())) map.closePopup()
        group.removeLayers(toRemove)
      }
      if (toAdd.length) group.addLayers(toAdd)
      if (keep && !keep[1].isPopupOpen()) focusMarker(map, group, keep[1], sharedSlugs.has(keep[0]))

      // Fit only when what's shown actually changed. Opening a popup re-renders everything (it
      // writes ?asset=), and re-fitting then zoomed away from the marker just clicked.
      const first = previous.current === undefined
      const changed = !first && !sameMembers(previous.current, visible)
      previous.current = visible
      if (keep) return
      // A deep link keeps its own view - unless the filters hide the HDRI it points at, which would
      // leave an empty, zoomed-in map.
      const deepLinked = focusSlug && (!visible || visible.has(focusSlug))
      if (first ? deepLinked || !visible : !changed) return
      if (visible && !visible.size) return
      const bounds = visible
        ? L.latLngBounds(
            Array.from(visible as Set<string>)
              .map((slug) => markers.current[slug]?.getLatLng())
              .filter(Boolean)
          )
        : allBounds
      if (bounds?.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    })
    return () => {
      cancelled = true
    }
    // markerCount: a marker added later (a looked-up ?asset=) has to be filtered too.
  }, [visible, pending, markerCount, group, map, markers, allBounds, focusSlug, sharedSlugs])
  return null
}

// The zoom floor for a map of `width` x `height` px: 2, or lower if that's what it takes to fit
// every HDRI (a phone needs about 0.5). Worked out directly rather than with map.getBoundsZoom,
// which never answers below the map's current minZoom - so the floor could rise but never fall.
const zoomFloor = (bounds: L.LatLngBounds, width: number, height: number) => {
  const crs = L.CRS.EPSG3857
  const nw = crs.latLngToPoint(bounds.getNorthWest(), 0)
  const se = crs.latLngToPoint(bounds.getSouthEast(), 0)
  // max(1, ...): a window smaller than the padding would take the log of a negative (NaN).
  const fit = Math.log2(Math.min(Math.max(1, width - 80) / (se.x - nw.x), Math.max(1, height - 80) / (se.y - nw.y)))
  // A whole number, though zooms snap to 0.5: with a fractional floor (0.5, 1.5) markercluster drew
  // some filtered markers nowhere - a filter showing 1 HDRI could draw 0 - and lost a few for good
  // once the filter was cleared.
  return Math.min(2, Math.max(0, Math.floor(fit)))
}

const windowZoomFloor = (bounds: L.LatLngBounds) => zoomFloor(bounds, window.innerWidth, window.innerHeight - 53) // 53: the site header

// Leaflet only notices window resizes; the sidebar opening or closing resizes the map's container
// without one.
const ResizeWatcher = () => {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

const Map = ({ hdris }: { hdris: MapHdri[] }) => {
  const { t } = useTranslation('map')
  const router = useRouter()
  const { locale } = router
  const markers = useRef<Record<string, L.Marker>>({})
  const slugs = useRef(new WeakMap<L.Marker, string>())
  const positions = useRef<Record<string, L.LatLngTuple>>({})
  const [group, setGroup] = useState<L.MarkerClusterGroup | null>(null)
  const [map, setMap] = useState<L.Map | null>(null)

  // Without a deep link, open on every HDRI rather than a fixed centre and zoom, which at desktop
  // widths cut off North America's and Japan's markers while showing empty polar sea.
  const [allBounds] = useState(() => (hdris.length ? L.latLngBounds(hdris.map((h) => [h[1], h[2]])) : null))

  // The floor is zoom 2, lowered only as far as a narrow screen needs to fit every HDRI (a phone
  // needs about 0.5). Recomputed when the window resizes, e.g. a phone rotated from landscape to
  // portrait - from the window's size rather than the map's, so the sidebar opening and closing
  // (which only resizes the map, and over an animation) never triggers the rebuild below.
  //
  // markercluster builds its per-zoom levels from the map's minZoom when it's added, and files every
  // marker added later against the map's minZoom *at that time*. So the floor must be right before
  // the cluster group exists (see initialMinZoom), and whenever it does change, the group has to be
  // rebuilt - otherwise markers re-added by the sidebar's filters land on levels that were never
  // built, and the lone, unclustered ones (Bergen, Amphitheatre Zanzibar Fort, ...) stop being drawn.
  useEffect(() => {
    if (!map || !group || !allBounds) return
    const update = () => {
      const floor = windowZoomFloor(allBounds)
      if (floor === map.getMinZoom()) return
      map.setMinZoom(floor)
      const layers = group.getLayers() as L.Marker[]
      const open = layers.find((m) => m.isPopupOpen())
      group.clearLayers()
      group.addLayers(layers)
      // clearLayers collapses a fanned group too, so reopen through it (as after a zoom).
      if (open)
        whenSettled(map, group, () => {
          const parent = group.getVisibleParent(open)
          if (parent === open) open.openPopup()
          else if (parent && isSingleSpot((parent as L.MarkerCluster).getBounds()))
            spiderfyThen(group, parent as L.MarkerCluster, () => open.openPopup())
        })
    }
    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
    }
  }, [map, group, allBounds])

  // This component never renders on the server (see pages/map.tsx), so window is safe here, and
  // reading it directly avoids waiting for the router's query to become ready.
  const [linkedSlug] = useState(() => new URLSearchParams(window.location.search).get('asset'))
  const [focus, setFocus] = useState(() => {
    // Puresky variants aren't plotted (they'd sit on top of their source HDRI), so show that one.
    const hdri =
      hdris.find((h) => h[0] === linkedSlug) || hdris.find((h) => h[0] === linkedSlug?.replace(/_puresky$/, ''))
    if (!hdri) return null
    return { slug: hdri[0], shared: sharesSpot(hdri, hdris), center: [hdri[1], hdri[2]] as [number, number] }
  })

  // A slug this page's data doesn't know yet: /map only regenerates every few hours, so a newly
  // published HDRI's GPS link would otherwise land on the world map. Ask the API for it and add
  // its marker; only a slug the API doesn't know (or that has no GPS) is dropped from the URL.
  const [extra, setExtra] = useState<MapHdri | null>(null)
  const lookedUp = useRef(false)
  useEffect(() => {
    if (!map || focus || !linkedSlug || lookedUp.current) return
    lookedUp.current = true
    // If the visitor starts using the map before the answer arrives, don't yank the view away
    // from them: just add the marker.
    let interacted = false
    const onInteract = () => {
      interacted = true
    }
    map.on('popupopen dragstart zoomstart', onInteract)
    const controller = new AbortController()
    const clearIfStillLinked = () => {
      if (Router.query.asset === linkedSlug) setAssetParam(null)
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
    fetch(`${baseUrl}/info/${encodeURIComponent(linkedSlug)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((info) => {
        map.off('popupopen dragstart zoomstart', onInteract)
        if (!info?.coords || info.type !== 0) return clearIfStillLinked()
        const hdri = toMapHdri(linkedSlug, info)
        setExtra(hdri)
        if (interacted) return
        const center: [number, number] = [hdri[1], hdri[2]]
        const shared = sharesSpot(hdri, hdris)
        map.setView(center, shared ? SHARED_SPOT_ZOOM : 12)
        setFocus({ slug: linkedSlug, shared, center })
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') clearIfStillLinked()
      })
    return () => {
      // Aborted before it answered (or React's dev double-mount): let the next run try again.
      controller.abort()
      lookedUp.current = false
      map.off('popupopen dragstart zoomstart', onInteract)
    }
  }, [map, focus, linkedSlug, hdris])
  const allHdris = useMemo(() => (extra ? [...hdris, extra] : hdris), [hdris, extra])

  // --- sidebar: search and filters ---------------------------------------------------------------
  // Whether the URL filters the map is known without the filtering code; MapFilters (loaded on first
  // use) works out which HDRIs that leaves. Read from window until the router's query is ready.
  const query = router.isReady ? router.query : Object.fromEntries(new URLSearchParams(window.location.search))
  const filtering = hasFilterParams(query)
  // Opens by itself when a link arrives with filters, so it's clear why markers are missing.
  const [sidebarOpen, setSidebarOpen] = useState(filtering)
  // Opened with the keyboard: move focus into the panel, where Tab would otherwise take ages to reach.
  const [focusSearch, setFocusSearch] = useState(false)
  // Escape in the panel: close it and put focus back on its toggle.
  const closeFromPanel = useCallback(() => {
    setSidebarOpen(false)
    document.querySelector<HTMLElement>(`.${styles.toggle} a`)?.focus()
  }, [])
  // Once loaded, MapFilters stays mounted (it holds the sidebar), even with the sidebar closed.
  const [filtersLoaded, setFiltersLoaded] = useState(filtering)
  useEffect(() => {
    if (sidebarOpen || filtering) setFiltersLoaded(true)
  }, [sidebarOpen, filtering])
  const [filterResult, setFilterResult] = useState<FilterResult>({ visible: null, pending: filtering })
  const onFilterResult = useCallback((result: FilterResult) => setFilterResult(result), [])
  // Pending while the URL filters but MapFilters hasn't answered yet, e.g. its chunk is loading.
  const filterPending = filtering && (!filtersLoaded || filterResult.pending)
  const slugList = useMemo(() => allHdris.map((h) => h[0]), [allHdris])

  // HDRIs within SAME_SPOT_METRES of another, whose popups open by fanning their group out.
  const sharedSlugs = useMemo(
    () => new Set(allHdris.filter((h) => sharesSpot(h, allHdris)).map((h) => h[0])),
    [allHdris]
  )

  // Back/Forward: the popup follows ?asset= - opening the one it names, or closing the open one when
  // it names none. Only for history navigation: the page's own writes (opening a popup) arrive a
  // few ms late, and acting on them reopened a popup the visitor had already moved on from.
  // The first value is the deep link, which FocusAsset handles.
  const assetParam = typeof query.asset === 'string' ? query.asset : null
  const lastAssetParam = useRef(assetParam)
  const historyNavAt = useRef(0)
  useEffect(() => {
    const onPopState = () => (historyNavAt.current = Date.now())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    const previous = lastAssetParam.current
    lastAssetParam.current = assetParam
    if (!map || !group || assetParam === previous || Date.now() - historyNavAt.current > 2000) return
    if (!assetParam) return void map.closePopup()
    const marker = markers.current[assetParam]
    if (!marker || marker.isPopupOpen()) return
    focusMarker(map, group, marker, sharedSlugs.has(assetParam))
  }, [assetParam, map, group, sharedSlugs])

  // The zoom floor the map starts with: what Leaflet's getBoundsZoom would give for this screen,
  // worked out before the map exists so markercluster is built with it (see the minZoom effect).
  const [initialMinZoom] = useState(() => (allBounds ? windowZoomFloor(allBounds) : 2))

  // react-leaflet compares `position` by identity and answers a new array with setLatLng, which
  // markercluster handles by removing and re-adding the marker - closing and reopening its popup.
  // A rebuilt list (new props on a locale switch) would do that to all ~800 at once, so each
  // marker keeps the same array for as long as its coordinates don't change.
  const positionOf = (slug: string, lat: number, lon: number): L.LatLngTuple => {
    const known = positions.current[slug]
    if (known && known[0] === lat && known[1] === lon) return known
    return (positions.current[slug] = [lat, lon])
  }

  // Built once per set of props: opening a popup updates ?asset=, which re-renders this component.
  const markerList = useMemo(
    () =>
      allHdris.map((hdri) => {
        const [slug, lat, lon, name, version] = hdri
        return (
          <Marker
            key={slug}
            position={positionOf(slug, lat, lon)}
            icon={markerIcon}
            // The marker's accessible name; without it a screen reader announces only "button".
            title={name}
            ref={(m) => {
              if (!m) return
              markers.current[slug] = m
              slugs.current.set(m, slug)
            }}
            eventHandlers={{ mouseover: () => preloadThumb(slug, version) }}
          >
            {/* Pinned to the thumbnail's width: Leaflet otherwise sizes the popup to its widest
              content, so a long name stretched it past the image. The offset makes up for the
              shorter arrow, so its point lands where Leaflet's did. */}
            <Popup
              className={styles.popupShell}
              minWidth={200}
              maxWidth={200}
              offset={[0, 11]}
              // Auto-pan stops it short of the zoom buttons in the top-left corner.
              autoPanPaddingTopLeft={[56, 10]}
            >
              <PopupCard hdri={hdri} />
            </Popup>
          </Marker>
        )
      }),
    [allHdris]
  )

  return (
    <div className={`${styles.layout} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
      {filtersLoaded && (
        <MapFilters
          open={sidebarOpen}
          focusSearch={focusSearch}
          onEscape={closeFromPanel}
          slugs={slugList}
          onResult={onFilterResult}
        />
      )}
      <MapContainer
        ref={setMap}
        {...(focus || !allBounds
          ? { center: focus ? focus.center : [20, 5], zoom: focus ? (focus.shared ? SHARED_SPOT_ZOOM : 12) : 3 }
          : { bounds: allBounds, boundsOptions: { padding: [20, 20] } })}
        // Half steps, so fitting every HDRI on a wide screen isn't rounded down to a much smaller map.
        zoomSnap={0.5}
        minZoom={initialMinZoom}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom={true}
        className={styles.mapContainer}
      >
        <PopupSync slugs={slugs} group={group} closeLabel={t('close')} />
        <ResizeWatcher />
        <SidebarToggle
          open={sidebarOpen}
          active={filtering}
          label={t('filter-hdris')}
          onToggle={(viaKeyboard: boolean) => {
            setFocusSearch(viaKeyboard && !sidebarOpen)
            setSidebarOpen((open) => !open)
          }}
        />
        <ZoomControl position="topleft" zoomInTitle={t('zoom-in')} zoomOutTitle={t('zoom-out')} />
        {/* Leaflet writes attribution as HTML, so the translated text is escaped. */}
        <VectorBaseMap locale={locale} attribution={`${escapeHtml(t('approximate'))} ${ATTRIBUTION}`} />
        <MarkerClusterGroup
          ref={setGroup}
          iconCreateFunction={clusterIcon}
          // Pixels within which markers merge. The default of 80 swallowed whole regions; raise
          // this to group more eagerly, lower it to group less.
          maxClusterRadius={30}
          showCoverageOnHover={false}
          // Both handled by zoomOrSpiderfy instead.
          zoomToBoundsOnClick={false}
          spiderfyOnMaxZoom={false}
          eventHandlers={{
            // markercluster's events, which Leaflet's own event map doesn't list.
            ...({
              clusterclick: (e: ClusterEvent) => map && group && zoomOrSpiderfy(map, group, e.layer),
              clusterkeypress: (e: ClusterEvent) => {
                if (!map || (e.originalEvent as KeyboardEvent)?.key !== 'Enter') return
                if (group) zoomOrSpiderfy(map, group, e.layer)
                // The focused cluster icon may be gone after the zoom; keep focus on the map so
                // arrow-key panning still works (what markercluster's own handler does).
                map.getContainer().focus()
              },
            } as L.LeafletEventHandlerFnMap),
          }}
        >
          {markerList}
        </MarkerClusterGroup>
        <MarkerVisibility
          visible={filtering ? filterResult.visible : null}
          pending={filterPending}
          markers={markers}
          markerCount={allHdris.length}
          group={group}
          allBounds={allBounds}
          focusSlug={focus?.slug ?? null}
          sharedSlugs={sharedSlugs}
        />
        {focus && <FocusAsset slug={focus.slug} shared={focus.shared} group={group} markers={markers} />}
      </MapContainer>
    </div>
  )
}

export default Map
