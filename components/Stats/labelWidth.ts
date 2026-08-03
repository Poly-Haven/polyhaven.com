/**
 * How wide the category axis of a horizontal bar chart needs to be, in pixels.
 *
 * Recharts wants that width as a fixed number and silently clips any tick longer than it, so the
 * alternative to measuring is a guess - and a guess that fits today truncates "Substance Designer"
 * the first time someone submits one. Canvas text metrics need no layout and no reflow, so this is
 * both cheap and exact.
 *
 * Returns a clamped value: too narrow and short labels leave the bars floating away from their
 * names, too wide and a long one eats the plot. Anything past `max` is on the caller to shorten.
 */
let ctx: CanvasRenderingContext2D | null | undefined

export const axisWidthFor = (labels: string[], em: number, min = 60, max = 150) => {
  if (ctx === undefined) {
    ctx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d')
  }

  let widest = 0
  if (ctx) {
    const body = getComputedStyle(document.body)
    ctx.font = `${(em * parseFloat(body.fontSize)).toFixed(2)}px ${body.fontFamily}`
    for (const label of labels) widest = Math.max(widest, ctx.measureText(label).width)
  } else {
    // No canvas - only reachable in a server or test render, where these charts draw nothing
    // anyway. Roughly the average glyph width of the site's body font at this size.
    const px = em * 16 * 0.58
    for (const label of labels) widest = Math.max(widest, label.length * px)
  }

  // Plus the gap recharts leaves between the tick text and the axis.
  return Math.round(Math.min(max, Math.max(min, widest + 10)))
}
