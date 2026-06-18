import { useEffect } from 'react'
import Router from 'next/router'
import ReactTooltip from 'react-tooltip'
import debounce from 'lodash.debounce'

import styles from './Tooltip.module.scss'

/**
 * react-tooltip v4 binds its hover/focus listeners to matching elements only once,
 * when an instance mounts (componentDidMount -> bindListener). It never re-binds
 * elements that are added later: its internal MutationObserver watches only removed
 * nodes (to auto-hide), and the only re-bind path is the static ReactTooltip.rebuild(),
 * which nothing in this app was calling.
 *
 * Tooltip targets here are routinely rendered *after* their host mounts — async/SWR
 * data, conditional UI, `.map` lists that grow (e.g. "+N more" artists), and client-side
 * route changes. Those tooltips silently failed to appear, which is why tooltips were
 * unreliable.
 *
 * This shared driver calls rebuild() whenever a [data-tip] element enters/leaves the DOM
 * or the route changes, keeping every mounted instance bound. A single ref-counted
 * MutationObserver is shared by all <Tooltip> instances, and is created lazily inside an
 * effect (never at module scope, which would run during SSR and crash).
 */

let observer: MutationObserver | null = null
let instanceCount = 0

// One shared, debounced rebuild so a burst of mounts / DOM changes coalesces into a
// single (relatively expensive) rebuild pass across all instances.
const rebuild = debounce(() => {
  ReactTooltip.rebuild()
}, 250)

const nodeHasTip = (node: Node) =>
  node.nodeType === Node.ELEMENT_NODE &&
  ((node as Element).matches?.('[data-tip]') || (node as Element).querySelector?.('[data-tip]'))

// True if a mutation affects tooltip targets.
const mutationAffectsTips = (mutations: MutationRecord[]): boolean => {
  for (const m of mutations) {
    // A data-tip value changing in place on an existing node (e.g. the download tips
    // that depend on the selected resolution). attributeFilter limits this to data-tip.
    if (m.type === 'attributes') return true
    for (const node of Array.from(m.addedNodes)) if (nodeHasTip(node)) return true
    for (const node of Array.from(m.removedNodes)) if (nodeHasTip(node)) return true
  }
  return false
}

const onRouteChange = () => rebuild()

const startDriver = () => {
  instanceCount += 1
  if (observer) return
  observer = new MutationObserver((mutations) => {
    // Cheap guard first: ignore the constant DOM churn (recharts/SVG, grid items)
    // that carries no tooltip targets, so we only pay for rebuild() when it matters.
    if (mutationAffectsTips(mutations)) rebuild()
  })
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-tip'] })
  Router.events.on('routeChangeComplete', onRouteChange)
}

const stopDriver = () => {
  instanceCount -= 1
  if (instanceCount > 0) return
  observer?.disconnect()
  observer = null
  Router.events.off('routeChangeComplete', onRouteChange)
  rebuild.cancel()
}

const Tooltip = ({ id, place }) => {
  useEffect(() => {
    // Bind targets that may have rendered in a different commit than this instance,
    // then keep them bound as the DOM and route change.
    rebuild()
    startDriver()
    return stopDriver
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ReactTooltip
      id={id}
      place={place}
      delayShow={250}
      multiline
      border
      borderColor="rgba(190, 111, 255, 0.5)"
      backgroundColor="rgb(60, 60, 60)"
      className={styles.tooltip}
    />
  )
}

Tooltip.defaultProps = {
  id: null,
  place: null,
}

export default Tooltip
