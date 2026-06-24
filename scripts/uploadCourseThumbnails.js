/*
 * Upload custom thumbnails to Bunny Stream for each course video.
 *
 * Reads local thumbnail files and POSTs them to Bunny's Set-Thumbnail endpoint
 * (raw binary). Maps each video by the "NN_MM Title" convention -> slug -> file.
 *
 * Usage:
 *   node scripts/uploadCourseThumbnails.js --dry-run   # list what would upload
 *   node scripts/uploadCourseThumbnails.js             # upload to Bunny
 *
 * Env: BUNNY_VIDEO_API_KEY (Stream library API key, in .env.local)
 */

const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })

const BUNNY_LIBRARY_ID = '689507'
const THUMB_ROOT = 'C:/Users/gregz/Poly Haven Dropbox/Work/Rob/Photoscan_Course/Lectures'
const DRY_RUN = process.argv.includes('--dry-run')
const TITLE_RE = /^(\d{2})_(\d{2})\s+(.+)$/

async function listAllVideos() {
  const key = process.env.BUNNY_VIDEO_API_KEY
  if (!key) throw new Error('BUNNY_VIDEO_API_KEY is missing (expected in .env.local)')
  const itemsPerPage = 100
  let page = 1
  let all = []
  while (true) {
    const url = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${itemsPerPage}&orderBy=date`
    const res = await fetch(url, { headers: { AccessKey: key, accept: 'application/json' } })
    if (!res.ok) throw new Error(`Bunny List Videos failed: ${res.status} ${res.statusText}`)
    const data = await res.json()
    all = all.concat(data.items || [])
    if (!(data.items || []).length || all.length >= data.totalItems) break
    page++
  }
  return all
}

function localThumbPath(slug) {
  const chapter = slug.split('_')[0] // "05_08" -> "05"
  return path.join(THUMB_ROOT, `chapter_${chapter}`, 'thumbnails', `${slug}.jpg`)
}

async function setThumbnail(guid, filePath) {
  const body = fs.readFileSync(filePath)
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}/thumbnail`,
    {
      method: 'POST',
      headers: { AccessKey: process.env.BUNNY_VIDEO_API_KEY, 'Content-Type': 'application/octet-stream' },
      body,
    }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`)
}

async function main() {
  console.log(`\nSetting Bunny thumbnails for library ${BUNNY_LIBRARY_ID}${DRY_RUN ? '   [DRY RUN]' : ''}\n`)
  const videos = await listAllVideos()
  console.log(`Fetched ${videos.length} videos from Bunny.\n`)

  let ok = 0
  let fail = 0
  let missing = 0
  for (const v of videos) {
    const m = TITLE_RE.exec((v.title || '').trim())
    if (!m) {
      console.log(`  ? skipping non-conforming title: "${v.title}"`)
      continue
    }
    const slug = `${m[1]}_${m[2]}`
    const fp = localThumbPath(slug)
    if (!fs.existsSync(fp)) {
      console.log(`  ! missing local thumbnail for ${slug}: ${fp}`)
      missing++
      continue
    }
    if (DRY_RUN) {
      console.log(`  would upload ${slug}  ->  ${v.guid}`)
      continue
    }
    try {
      await setThumbnail(v.guid, fp)
      console.log(`  ✔ ${slug}`)
      ok++
    } catch (e) {
      console.log(`  ✖ ${slug}: ${e.message}`)
      fail++
    }
  }
  console.log(`\nDone: ${ok} uploaded, ${fail} failed, ${missing} missing local files.`)
}

main().catch((e) => {
  console.error('\nFailed:', e.message)
  process.exit(1)
})
