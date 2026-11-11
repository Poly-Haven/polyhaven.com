// The render gallery's "fair mosaic" layout.
//
// Justified rows give every render the same height, so a landscape gets far more of the page than a
// portrait; columns give every render the same width, which does the reverse. This gives every
// render about the same area whatever its shape, without cropping.
//
// Bands span the width like justified rows, but a band holds cells, and a cell is either one
// render or a small stack: two or three on top of each other, a pair over one, or two pairs. A
// stack lets two landscapes share the height a portrait gets on its own.
//
//  1. Cells are built left to right. The first unplaced render anchors a cell, and its partners
//     may come from the next few unplaced renders, so a lone landscape between portraits waits for
//     another landscape instead of being shown huge. Each shape is scored by how far its renders'
//     areas are from the target, plus a small cost for each render jumped over.
//  2. Cells are broken into bands, again keeping each render's area close to the target.
//  3. Every node's width is linear in its height (w = al * h + be, gaps included), so the exact
//     rectangles come out of one pass.
//
// See info/gallery_layout_plan.md for the measurements behind the constants.

export type Rect = { i: number; x: number; y: number; w: number; h: number }
export type Band = { y: number; h: number; rects: Rect[]; partial: boolean }
export type Mosaic = { width: number; height: number; bands: Band[] }

type Node = { i: number } | { k: 'h' | 'v'; c: Node[] }
type Template = number | { k: 'h' | 'v'; c: Template[] }

export const GAP = 8
const LOOKAHEAD = 4 // how far ahead a cell may pull its partners from
const MOVE_COST = 0.03 // per render jumped over
const MAX_CELLS_PER_BAND = 12

const V = (...c: Template[]): Template => ({ k: 'v', c })
const H = (...c: Template[]): Template => ({ k: 'h', c })
const TEMPLATES: { n: number; t: Template }[] = [
  { n: 1, t: 0 },
  { n: 2, t: V(0, 1) },
  { n: 3, t: V(0, 1, 2) },
  { n: 3, t: V(H(0, 1), 2) },
  { n: 3, t: V(0, H(1, 2)) },
  { n: 4, t: V(H(0, 1), H(2, 3)) },
]

const isLeaf = (n: Node): n is { i: number } => (n as any).i !== undefined
const fill = (t: Template, ids: number[]): Node =>
  typeof t === 'number' ? { i: ids[t] } : { k: t.k, c: t.c.map((x) => fill(x, ids)) }

// Width as a function of height: w = al * h + be
const lin = (node: Node, A: number[]): { al: number; be: number } => {
  if (isLeaf(node)) return { al: A[node.i], be: 0 }
  const cs = node.c.map((c) => lin(c, A))
  if (node.k === 'h') {
    return { al: cs.reduce((s, c) => s + c.al, 0), be: cs.reduce((s, c) => s + c.be, 0) + GAP * (cs.length - 1) }
  }
  const al = 1 / cs.reduce((s, c) => s + 1 / c.al, 0)
  return { al, be: al * (cs.reduce((s, c) => s + c.be / c.al, 0) - GAP * (cs.length - 1)) }
}

const place = (node: Node, A: number[], x: number, y: number, w: number, h: number, out: Rect[]) => {
  if (isLeaf(node)) {
    out.push({ i: node.i, x, y, w, h })
    return
  }
  for (const c of node.c) {
    const L = lin(c, A)
    if (node.k === 'h') {
      const cw = L.al * h + L.be
      place(c, A, x, y, cw, h, out)
      x += cw + GAP
    } else {
      const ch = (w - L.be) / L.al
      place(c, A, x, y, w, ch, out)
      y += ch + GAP
    }
  }
}

const cellRects = (cell: Node, A: number[], h: number): Rect[] => {
  const L = lin(cell, A)
  const out: Rect[] = []
  place(cell, A, 0, 0, L.al * h + L.be, h, out)
  return out
}

const choose = (arr: number[], k: number): number[][] => {
  const out: number[][] = []
  const go = (start: number, cur: number[]) => {
    if (cur.length === k) return void out.push(cur.slice())
    for (let x = start; x < arr.length; x++) {
      cur.push(arr[x])
      go(x + 1, cur)
      cur.pop()
    }
  }
  go(0, [])
  return out
}

const buildCells = (seq: number[], A: number[], H0: number, target: number, W: number): Node[] => {
  const used = new Set<number>()
  const cells: Node[] = []
  for (let p = 0; p < seq.length; p++) {
    if (used.has(seq[p])) continue
    const pool: number[] = []
    for (let q = p + 1; q < seq.length && pool.length < LOOKAHEAD; q++) if (!used.has(seq[q])) pool.push(q)
    let best: { cost: number; cell: Node; ids: number[] } | null = null
    for (const T of TEMPLATES) {
      if (T.n - 1 > pool.length) continue
      for (const combo of choose(pool, T.n - 1)) {
        const ids = [seq[p], ...combo.map((q) => seq[q])]
        const cell = fill(T.t, ids)
        const L = lin(cell, A)
        if (L.al * H0 + L.be > W) continue // wider than the page
        let cost = 0
        for (const r of cellRects(cell, A, H0)) cost += Math.log((r.w * r.h) / target) ** 2
        cost /= T.n
        combo.forEach((q, k) => (cost += MOVE_COST * (q - p - 1 - k)))
        if (!best || cost < best.cost) best = { cost, cell, ids }
      }
    }
    if (!best) best = { cost: 0, cell: { i: seq[p] }, ids: [seq[p]] }
    best.ids.forEach((x) => used.add(x))
    cells.push(best.cell)
  }
  return cells
}

type RawBand = { cells: Node[]; h: number; partial: boolean; al: number; be: number }

// Each band's cost is how far its renders' areas are from the target - the same measure the cells
// were chosen by - so a band is never squeezed thin just to keep it near a nominal height.
const breakBands = (cells: Node[], A: number[], W: number, H0: number, target: number): RawBand[] => {
  const n = cells.length
  const Ls = cells.map((c) => lin(c, A))
  const best = new Array(n + 1).fill(Infinity)
  const next = new Array(n + 1).fill(n)
  best[n] = 0
  for (let i = n - 1; i >= 0; i--) {
    let al = 0
    let be = 0
    for (let j = i + 1; j <= Math.min(n, i + MAX_CELLS_PER_BAND); j++) {
      al += Ls[j - 1].al
      be += Ls[j - 1].be
      const h = (W - GAP * (j - i - 1) - be) / al
      if (h <= 0) break
      // The last band may stop short of the edge at the target height rather than stretch.
      const bandH = j === n && h >= H0 ? H0 : h
      let cost = 0
      for (let k = i; k < j; k++) {
        for (const r of cellRects(cells[k], A, bandH)) cost += Math.log((r.w * r.h) / target) ** 2
      }
      if (cost + best[j] < best[i]) {
        best[i] = cost + best[j]
        next[i] = j
      }
    }
    if (best[i] === Infinity) {
      // Even one cell is wider than the page at any height: give it a band of its own.
      best[i] = 100 + best[i + 1]
      next[i] = i + 1
    }
  }
  const bands: RawBand[] = []
  for (let i = 0; i < n; i = next[i]) {
    let al = 0
    let be = 0
    for (let k = i; k < next[i]; k++) {
      al += Ls[k].al
      be += Ls[k].be
    }
    const full = (W - GAP * (next[i] - i - 1) - be) / al
    const partial = next[i] === n && full >= H0
    bands.push({ cells: cells.slice(i, next[i]), h: partial ? H0 : full, partial, al, be })
  }
  return bands
}

// How big renders are. The old column masonry gave a render (column width)² / aspect, so its page
// total depended on the mix of shapes: a page of landscapes was small, a page of portraits big.
// The target here is that old average for the renders being laid out, so on desktop each page
// shows the same total amount of image it used to, only shared fairly between shapes. (On phones
// the old layout was one full-width column; no stack fits there, so phones come out the same.)
// The column count is the old one's: one column up to 590px, then ceil(W / 468).
export const columnsFor = (W: number): number => (W <= 590 ? 1 : Math.ceil(W / (460 + GAP)))
// SIZE_FIT: renders spread either side of the target and the average lands above it, so the
// target is set a little lower. Calibrated on the live top 60 and the ten busiest asset pages:
// median page 0.98x the old size, 80% within 0.83-1.10x. A one-band page has no spread, so it
// uses the old size as is.
const SIZE_FIT = 0.9
export const targetArea = (W: number, aspects: number[]): number => {
  const columns = columnsFor(W)
  const column = (W - GAP * (columns - 1)) / columns
  const meanInverse = aspects.length ? aspects.reduce((s, a) => s + 1 / a, 0) / aspects.length : 1
  return SIZE_FIT * column * column * meanInverse
}
// The band height that gives a portrait-ish cell about the target area. Bands are tall because
// many cells are stacks.
export const targetBandHeight = (W: number, aspects: number[]): number => Math.sqrt(targetArea(W, aspects) / 0.45)

const layoutFrom = (seq: number[], A: number[], W: number, y0: number, first: boolean): Band[] => {
  const shapes = seq.map((i) => A[i])
  const H0 = targetBandHeight(W, shapes)
  const target = targetArea(W, shapes)
  const cells = buildCells(seq, A, H0, target, W)
  let raw = breakBands(cells, A, W, H0, target)
  let center = false

  // Everything fits in one band (most asset pages). Size it so the average render gets the target
  // area, like everywhere else, rather than stretching a lone render to the band height, and centre
  // it. Stacks matter less with this much room, so also try the renders side by side and keep
  // whichever arrangement gives the smallest render the most area. (At the same average that's the
  // more even one; it also loses an arrangement the page width squeezes below the target.)
  if (first && raw.length === 1) {
    const areas = (b: RawBand, h: number) => b.cells.flatMap((c) => cellRects(c, A, h).map((r) => r.w * r.h))
    const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
    const sized = (b: RawBand) => {
      const full = (W - GAP * (b.cells.length - 1) - b.be) / b.al
      const h = Math.min(full, 100 * Math.sqrt(target / SIZE_FIT / mean(areas(b, 100)))) // area grows with h^2
      return { band: { ...b, h, partial: false }, smallest: Math.min(...areas(b, h)) }
    }
    let best = sized(raw[0])
    if (cells.length < seq.length) {
      const flat = breakBands(
        seq.map((i) => ({ i })),
        A,
        W,
        H0,
        target
      )
      if (flat.length === 1) {
        const alt = sized(flat[0])
        if (alt.smallest > best.smallest) best = alt
      }
    }
    raw = [best.band]
    center = true
  }

  let y = y0
  return raw.map((b) => {
    const widths = b.cells.map((c) => {
      const L = lin(c, A)
      return L.al * b.h + L.be
    })
    const total = widths.reduce((s, w) => s + w, 0) + GAP * (b.cells.length - 1)
    let x = center ? Math.max(0, (W - total) / 2) : 0
    const rects: Rect[] = []
    b.cells.forEach((c, k) => {
      place(c, A, x, y, widths[k], b.h, rects)
      x += widths[k] + GAP
    })
    const band = { y, h: b.h, rects, partial: b.partial }
    y += b.h + GAP
    return band
  })
}

const finish = (width: number, bands: Band[]): Mosaic => {
  const last = bands[bands.length - 1]
  return { width, height: last ? last.y + last.h : 0, bands }
}

export const layoutMosaic = (aspects: number[], W: number): Mosaic =>
  finish(
    W,
    layoutFrom(
      aspects.map((_, i) => i),
      aspects,
      W,
      0,
      true
    )
  )

// Infinite scroll: `prev` was laid out for the first renders of `aspects`, at the same width. Every
// band but its last stays exactly where it is; the last is rebuilt together with the new renders.
export const extendMosaic = (prev: Mosaic, aspects: number[]): Mosaic => {
  if (!prev.bands.length) return layoutMosaic(aspects, prev.width)
  const frozen = prev.bands.slice(0, -1)
  const used = new Set(frozen.flatMap((b) => b.rects.map((r) => r.i)))
  const seq = aspects.map((_, i) => i).filter((i) => !used.has(i))
  const y0 = frozen.length ? prev.bands[prev.bands.length - 1].y : 0
  return finish(prev.width, [...frozen, ...layoutFrom(seq, aspects, prev.width, y0, !frozen.length)])
}
