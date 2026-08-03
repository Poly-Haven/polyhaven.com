/** The per-asset-type palette the stats charts share, so a colour always means the same type. */
export const typeColors: Record<string, string> = {
  hdris: 'rgb(65, 187, 217)',
  textures: 'rgb(243, 130, 55)',
  models: 'rgb(161, 208, 77)',
}

export const typeColorsTransp: Record<string, string> = {
  hdris: 'rgba(65, 187, 217, 0.2)',
  textures: 'rgba(243, 130, 55, 0.2)',
  models: 'rgba(161, 208, 77, 0.2)',
}

export const typeNames: Record<string, string> = {
  hdris: 'HDRI',
  textures: 'Texture',
  models: 'Model',
}

/** The second series on the attribute chart, kept off the type palette so it never reads as a type. */
export const demandColor = 'rgb(190, 111, 255)'

/**
 * Categorical palette for charts whose series are arbitrary things rather than asset types - the
 * software charts, currently. Assigned in this fixed order and never cycled, so a colour identifies
 * a series rather than its position; anything past the seventh has to fold into an "other" bucket
 * instead of getting a generated hue.
 *
 * These are stepped for this site's dark surface (#2d2d2d) rather than picked by eye, and the whole
 * ordering was checked as a set: every adjacent pair clears the colour-blind separation floor under
 * protanopia, deuteranopia and tritanopia, and all seven clear 3:1 contrast against the page. The
 * asset-type palette above is deliberately not reused - three colours is not enough, and those
 * hues already mean "HDRI", "texture" and "model" everywhere else on this page.
 */
export const seriesColors = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#9085e9', '#e66767']

/** Single-series bars, where colour carries no identity and the axis labels do all the naming. */
export const barColor = '#9085e9'

/**
 * The "everything else" band on a stacked chart. Deliberately off the palette and near-grey: it is
 * a remainder rather than a thing, and giving it a hue would let it read as the seventh product.
 */
export const otherColor = '#7c7b74'

/** Shared recharts <Tooltip> chrome, matching the other graphs on the page. */
export const tooltipStyles = {
  contentStyle: {
    backgroundColor: 'rgba(30,30,30,0.85)',
    border: 'none',
    borderRadius: '0.25em',
    padding: '0.5em 0.7em',
  },
  itemStyle: {
    padding: 0,
    margin: 0,
    fontSize: '0.8em',
    color: 'rgba(255,255,255,0.8)',
  },
  labelStyle: {
    margin: '0 0 0.2em 0',
    fontSize: '0.85em',
    fontWeight: 'bold' as const,
  },
}
