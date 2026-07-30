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
