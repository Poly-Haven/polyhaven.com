/*
 * Import course videos from Bunny Stream into the Firestore `courses` collection.
 *
 * Once-off importer for the Photogrammetry course. The videos are ungrouped on
 * Bunny; we derive structure from the title convention "NN_MM Title":
 *   - chapter slug = NN, lecture slug = NN_MM, display name = title minus "NN_MM ".
 *
 * Validation is ALL-OR-NOTHING: if any video title fails the convention we write
 * nothing. This is a once-off import that OVERWRITES the course doc (placeholder
 * names/descriptions included), so run it before hand-editing copy in Firestore.
 *
 * (Thumbnails are handled manually — Bunny's pull zone blocks direct file access
 * and the embed key can't sign it.)
 *
 * Usage:
 *   node scripts/importCourseVideos.js --dry-run   # validate + preview, no write
 *   node scripts/importCourseVideos.js             # write courses/photogrammetry to Firestore
 *
 * Env (loaded from polyhaven.com/.env.local, then ../api/.env for Firestore creds):
 *   BUNNY_VIDEO_API_KEY    Bunny Stream library API key (List Videos)
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 */

const path = require('path')

// Load this app's env first, then the api repo's env for Firestore credentials.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', 'api', '.env') })

// ---- Config ----
const COURSE_ID = 'photogrammetry'
const COURSE_NAME = 'Photogrammetry'
const MILESTONE_ID = 'course_photogrammetry' // placeholder — create the milestone doc later
const BUNNY_LIBRARY_ID = '689507'

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
  'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.'

const DRY_RUN = process.argv.includes('--dry-run')

// "03_07 Some title" -> { chapter:'03', lecture:'07', slug:'03_07', name:'Some title' }
const TITLE_RE = /^(\d{2})_(\d{2})\s+(.+)$/

function parseTitle(title) {
  const m = TITLE_RE.exec((title || '').trim())
  if (!m) return null
  // Many titles still carry the source ".mp4" extension — drop it for display.
  const name = m[3].trim().replace(/\.mp4$/i, '').trim()
  return { chapter: m[1], lecture: m[2], slug: `${m[1]}_${m[2]}`, name }
}

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

function buildCourse(videos) {
  // ALL-OR-NOTHING: bail if any title fails the convention.
  const bad = videos.filter((v) => !parseTitle(v.title))
  if (bad.length) {
    console.error(`\n  ${bad.length} video(s) do not match the "NN_MM Title" convention:`)
    bad.forEach((v) => console.error(`   - "${v.title}"  (${v.guid})`))
    console.error('\nNothing was written. Fix the titles on Bunny and re-run.\n')
    return null
  }

  const lectures = videos.map((v) => {
    const p = parseTitle(v.title)
    return { chapter: p.chapter, slug: p.slug, video_id: v.guid, name: p.name, duration: v.length || 0 }
  })

  const byChapter = {}
  for (const lec of lectures) {
    ;(byChapter[lec.chapter] = byChapter[lec.chapter] || []).push(lec)
  }

  const chapters = Object.keys(byChapter)
    .sort()
    .map((chap) => ({
      slug: chap,
      name: `Lorem ipsum chapter ${chap}`, // placeholder — no chapter names on Bunny
      lectures: byChapter[chap]
        .sort((a, b) => a.slug.localeCompare(b.slug))
        .map((l) => ({
          slug: l.slug,
          video_id: l.video_id,
          name: l.name,
          description: LOREM,
          duration: l.duration,
        })),
    }))

  return { name: COURSE_NAME, description: LOREM, milestone_id: MILESTONE_ID, chapters }
}

async function main() {
  console.log(`\nImporting "${COURSE_NAME}" from Bunny library ${BUNNY_LIBRARY_ID}${DRY_RUN ? '   [DRY RUN]' : ''}\n`)

  const videos = await listAllVideos()
  console.log(`Fetched ${videos.length} videos from Bunny.`)

  const course = buildCourse(videos)
  if (!course) process.exit(1)

  const totalLectures = course.chapters.reduce((n, c) => n + c.lectures.length, 0)
  console.log(`Parsed ${course.chapters.length} chapters, ${totalLectures} lectures:\n`)
  for (const ch of course.chapters) {
    console.log(`  Chapter ${ch.slug}  (${ch.lectures.length} lectures)`)
    for (const l of ch.lectures) console.log(`     ${l.slug}   ${l.duration}s   ${l.name}`)
  }

  const notReady = videos.filter((v) => v.status !== 4)
  if (notReady.length) {
    console.log(`\n! ${notReady.length} video(s) are not in "Finished" status (4); duration may be incomplete.`)
  }

  if (DRY_RUN) {
    console.log('\nDry run — no Firestore write. Full doc:\n')
    console.log(JSON.stringify({ [COURSE_ID]: course }, null, 2))
    return
  }

  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    })
  }
  await admin.firestore().collection('courses').doc(COURSE_ID).set(course)
  console.log(`\n✔ Wrote courses/${COURSE_ID} to Firestore.`)
}

main().catch((e) => {
  console.error('\nImport failed:', e.message)
  process.exit(1)
})
