import { isoDuration } from 'utils/formatDuration'

/* ---------------------------------------------------------------------------
 * SEO metadata for course landing pages.
 *
 * Anything the API already knows (name, description, chapters, durations) is
 * derived from the `course` object so a new course gets baseline structured
 * data for free. COURSE_SEO only carries what the API doesn't have: the social
 * image, pricing, and the marketing "what you'll learn" list.
 * ------------------------------------------------------------------------- */

const SITE = 'https://polyhaven.com'
const PROMO = 'https://cdn.polyhaven.com/site_images/courses/photogrammetry/promo'

type CourseSeo = {
  // 1200px wide — og:image / twitter:summary_large_image want ~1200x630.
  image?: string
  keywords?: string
  // schema.org `teaches`, and the on-page "What you'll walk away able to do" list.
  teaches?: string[]
  // schema.org `about` — the subject matter, for topical relevance.
  about?: string[]
  offers?: { price: string; url: string; category?: string }[]
  // The freely-viewable promo video, for video rich results. Must stay in sync
  // with the player actually rendered on the page (same video, same thumbnail).
  trailer?: {
    name: string
    description: string
    embedUrl: string
    thumbnailUrl: string[]
    uploadDate: string
    duration: string
  }
}

export const COURSE_SEO: Record<string, CourseSeo> = {
  photogrammetry: {
    image: `${PROMO}/Video Thumbnail 01.jpg?width=1200&quality=90`,
    keywords:
      'photogrammetry,photogrammetry course,3d scanning,photoscanning,RealityScan,Blender,PBR materials,tileable textures,retopology,environment art,scan textures,game-ready models',
    teaches: [
      'Capture texture scans on location',
      'Scan objects into game-ready models',
      'Develop RAW files with accurate colour',
      'Build seamless tileable PBR materials',
      'Reconstruct scans in RealityScan',
      'Retopology and UV mapping',
      'Bake and repair scan textures',
      'Build, light and dress a full environment',
    ],
    about: ['Photogrammetry', '3D scanning', 'Blender', 'Environment art', 'PBR texturing'],
    offers: [
      // Mirrors the prices rendered by CourseCallToAction in Photogrammetry.tsx.
      {
        price: '7',
        url: 'https://www.patreon.com/checkout/polyhaven?rid=29202719&cadence=12',
        category: 'Subscription',
      },
      {
        price: '39',
        url: 'https://superhivemarket.com/products/polyhaven-production-photogrammetry?ref=3841',
        category: 'Paid',
      },
    ],
    trailer: {
      // Matches the video's own title on YouTube.
      name: 'Turn the real world into production-ready 3D assets',
      description:
        'A look inside the Production Photogrammetry course: scanning textures and objects on location at an abandoned factory, processing them into PBR materials and game-ready models, and building a finished environment in Blender.',
      embedUrl: 'https://www.youtube-nocookie.com/embed/YdYgZsjqoQw',
      // YouTube's own thumbnails — that's what the embed actually shows.
      thumbnailUrl: [
        'https://i.ytimg.com/vi/YdYgZsjqoQw/maxresdefault.jpg',
        'https://i.ytimg.com/vi/YdYgZsjqoQw/hqdefault.jpg',
      ],
      uploadDate: '2026-08-04T07:16:46-07:00',
      duration: 'PT1M19S', // 79s, per YouTube
    },
  },
}

const PROVIDER = {
  '@type': 'Organization',
  name: 'Poly Haven',
  url: SITE,
  logo: `${SITE}/Logo%20256.png`,
  sameAs: ['https://www.patreon.com/polyhaven', 'https://twitter.com/polyhaven', 'https://github.com/Poly-Haven'],
}

// Everything a crawler needs about the course, as a @graph so the Course and the
// breadcrumb trail ship in a single <script> tag.
export function buildCourseJsonLd(course: any) {
  const seo = COURSE_SEO[course.id] || {}
  const url = `${SITE}/learn/${course.id}`
  const chapters = course.chapters || []
  const lectures = chapters.flatMap((c: any) => c.lectures || [])
  const totalSeconds = lectures.reduce((s: number, l: any) => s + (l.duration || 0), 0)

  const courseNode: Record<string, any> = {
    '@type': 'Course',
    '@id': `${url}#course`,
    name: course.name,
    description: course.description,
    url,
    inLanguage: 'en',
    provider: PROVIDER,
    // The lectures sit behind a Patreon/Superhive purchase.
    isAccessibleForFree: false,
    educationalLevel: 'Beginner to intermediate',
    learningResourceType: 'Video course',
  }

  if (seo.image) courseNode.image = seo.image
  if (seo.keywords) courseNode.keywords = seo.keywords
  if (seo.teaches?.length) courseNode.teaches = seo.teaches
  if (seo.about?.length) courseNode.about = seo.about

  if (seo.offers?.length) {
    courseNode.offers = seo.offers.map((o) => ({
      '@type': 'Offer',
      price: o.price,
      priceCurrency: 'USD',
      url: o.url,
      category: o.category,
      availability: 'https://schema.org/InStock',
    }))
  }

  // Required for Google's course-list rich result: an instance with a mode and
  // a workload. Self-paced video, so there's no start/end date to give.
  if (totalSeconds > 0) {
    courseNode.hasCourseInstance = [
      {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: isoDuration(totalSeconds),
      },
    ]
  }

  // Chapters as syllabus sections — lets Google understand the curriculum
  // without us listing all 62 gated lectures.
  if (chapters.length) {
    courseNode.syllabusSections = chapters.map((c: any, i: number) => {
      const secs = (c.lectures || []).reduce((s: number, l: any) => s + (l.duration || 0), 0)
      const section: Record<string, any> = {
        '@type': 'Syllabus',
        position: i + 1,
        name: c.name,
      }
      if (secs > 0) section.timeRequired = isoDuration(secs)
      return section
    })
  }

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Poly Haven', item: SITE },
      { '@type': 'ListItem', position: 2, name: course.name, item: url },
    ],
  }

  const graph: Record<string, any>[] = [courseNode, breadcrumb]

  // The trailer plays on the page for anyone, unlike the course itself — so it's
  // eligible for video rich results on its own.
  if (seo.trailer) {
    const t = seo.trailer
    courseNode.video = { '@id': `${url}#trailer` }
    graph.push({
      '@type': 'VideoObject',
      '@id': `${url}#trailer`,
      name: t.name,
      description: t.description,
      thumbnailUrl: t.thumbnailUrl,
      uploadDate: t.uploadDate,
      duration: t.duration,
      embedUrl: t.embedUrl,
      // Watchable in-page without signing in or paying.
      isAccessibleForFree: true,
      inLanguage: 'en',
      publisher: PROVIDER,
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
