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

// Flip to false to silence the driver's behaviour/performance logging in the console.
// (Logs are filterable by the "[Tooltip]" prefix.)
const TOOLTIP_DEBUG = true
const log = (...args: unknown[]) => {
  if (TOOLTIP_DEBUG) console.log('%c[Tooltip]', 'color:#be6fff;font-weight:bold', ...args)
}

let observer: MutationObserver | null = null
let instanceCount = 0

// Debug bookkeeping: which triggers have accumulated since the last actual rebuild
// (shows how the debounce coalesces bursts), and when the last rebuild ran (frequency).
let pendingTriggers: string[] = []
let lastRebuildAt = 0
let rebuildCount = 0

// One shared, debounced rebuild so a burst of mounts / DOM changes coalesces into a
// single (relatively expensive) rebuild pass across all instances.
const rebuild = debounce(() => {
  const start = performance.now()
  ReactTooltip.rebuild()
  const dur = performance.now() - start
  if (TOOLTIP_DEBUG) {
    const tipCount = document.querySelectorAll('[data-tip]').length
    const breakdown = pendingTriggers.reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] || 0) + 1
      return acc
    }, {})
    const sinceLast = lastRebuildAt ? `${Math.round(start - lastRebuildAt)}ms since last` : 'first rebuild'
    log(
      `rebuild #${++rebuildCount}: ${pendingTriggers.length} trigger(s) coalesced`,
      breakdown,
      `· ${tipCount} [data-tip] in DOM · rebind took ${dur.toFixed(1)}ms · ${sinceLast}`
    )
    lastRebuildAt = start
    pendingTriggers = []
  }
}, 250)

// Record why a rebuild was requested (for the coalesced debug summary), then schedule it.
const triggerRebuild = (reason: string) => {
  if (TOOLTIP_DEBUG) pendingTriggers.push(reason)
  rebuild()
}

const nodeHasTip = (node: Node) =>
  node.nodeType === Node.ELEMENT_NODE &&
  ((node as Element).matches?.('[data-tip]') || (node as Element).querySelector?.('[data-tip]'))

// Returns a short reason string if a mutation affects tooltip targets, else null.
const tipMutationReason = (mutations: MutationRecord[]): string | null => {
  for (const m of mutations) {
    // A data-tip value changing in place on an existing node (e.g. the download tips
    // that depend on the selected resolution). attributeFilter limits this to data-tip.
    if (m.type === 'attributes') return 'dom:attr'
    for (const node of Array.from(m.addedNodes)) if (nodeHasTip(node)) return 'dom:added'
    for (const node of Array.from(m.removedNodes)) if (nodeHasTip(node)) return 'dom:removed'
  }
  return null
}

const onRouteChange = () => triggerRebuild('route')

const startDriver = () => {
  instanceCount += 1
  if (observer) {
    log(`instance mounted (now ${instanceCount} live) — reusing the shared observer`)
    return
  }
  observer = new MutationObserver((mutations) => {
    // Cheap guard first: ignore the constant DOM churn (recharts/SVG, grid items)
    // that carries no tooltip targets, so we only pay for rebuild() when it matters.
    const reason = tipMutationReason(mutations)
    if (reason) triggerRebuild(reason)
  })
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-tip'] })
  Router.events.on('routeChangeComplete', onRouteChange)
  log(`driver started (instance ${instanceCount}) — observing document.body for [data-tip] changes`)
}

const stopDriver = () => {
  instanceCount -= 1
  if (instanceCount > 0) {
    log(`instance unmounted (now ${instanceCount} live) — keeping the shared observer`)
    return
  }
  observer?.disconnect()
  observer = null
  Router.events.off('routeChangeComplete', onRouteChange)
  rebuild.cancel()
  log('driver stopped — observer disconnected (no instances left)')
}

const Tooltip = ({ id, place }) => {
  useEffect(() => {
    log(`mount (id=${id ?? 'default'}, place=${place ?? 'default'})`)
    // Bind targets that may have rendered in a different commit than this instance,
    // then keep them bound as the DOM and route change.
    triggerRebuild('mount')
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
