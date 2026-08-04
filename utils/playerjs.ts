// Lazily load Bunny's Player.js library (the standard postMessage player API) once,
// returning the global `playerjs` object. https://docs.bunny.net/docs/playback-control-api
const SRC = 'https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js'

let promise: Promise<any> | null = null

export function loadPlayerJs(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if ((window as any).playerjs) return Promise.resolve((window as any).playerjs)
  if (promise) return promise

  promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SRC}"]`) as HTMLScriptElement | null
    const script = existing || document.createElement('script')
    script.addEventListener('load', () => resolve((window as any).playerjs))
    script.addEventListener('error', () => {
      promise = null
      reject(new Error('Failed to load Player.js'))
    })
    if (!existing) {
      script.src = SRC
      script.async = true
      document.body.appendChild(script)
    }
  })
  return promise
}
