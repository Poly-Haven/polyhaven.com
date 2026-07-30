import React from 'react'
import fs from 'fs'

import { removeExtension } from 'utils/stringUtils'
import taxonomy from 'constants/taxonomy.json'

const Sitemap = () => {}

export const getServerSideProps = async ({ res }) => {
  const baseUrl = 'https://polyhaven.com'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  const staticPages = [
    '', // Home
    'collections',
    'about-contact',
    'contribute',
    'faq',
    'finance-reports',
    'license',
    'logo',
    'map',
    'our-api',
    'privacy',
    'stats',
    'vaults',
    'tools/ev-diff',
  ].map((page) => {
    return `${baseUrl}/${page}`
  })

  let dynamicPages = {}
  // Assets
  await fetch(`${apiUrl}/assets`)
    .then((response) => response.json())
    .then((resdata) => {
      for (const [slug, info] of Object.entries(resdata)) {
        dynamicPages[`https://polyhaven.com/a/${slug}`] = {
          lastmod: new Date(info['date_published'] * 1000).toISOString(),
          changefreq: 'monthly',
          priority: '1.0',
          img: [
            `https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=630`,
            `https://cdn.polyhaven.com/asset_img/primary/${slug}.png?height=760`,
          ],
        }
      }
    })

  // Course landing pages (the lecture pages themselves are gated, so they stay out).
  await fetch(`${apiUrl}/courses`)
    .then((response) => response.json())
    .then((resdata) => {
      for (const id of Object.keys(resdata)) {
        dynamicPages[`${baseUrl}/learn/${id}`] = {
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: '0.8',
        }
      }
    })
    .catch(() => {}) // a courses hiccup shouldn't take down the whole sitemap

  // Categories - the single-path taxonomy, straight from the bundled tree. Deeper categories get a
  // slightly lower priority so the broad landing pages stay the strongest entry points.
  for (const type of Object.keys(taxonomy.types)) {
    dynamicPages[`${baseUrl}/${type}`] = {
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0',
    }
    const walk = (nodes, depth) => {
      for (const node of nodes) {
        dynamicPages[`${baseUrl}/${type}/${node.slugPath}`] = {
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: depth === 0 ? '0.7' : depth === 1 ? '0.5' : '0.3',
        }
        walk(node.children, depth + 1)
      }
    }
    walk(taxonomy.types[type], 0)
  }

  // Compile sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      ${staticPages
        .map((url) => {
          return `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.5</priority>
            </url>
          `
        })
        .join('')}
      ${Object.keys(dynamicPages)
        .map((url) => {
          return `
            <url>
              <loc>${url}</loc>
              <lastmod>${dynamicPages[url].lastmod}</lastmod>
              <changefreq>${dynamicPages[url].changefreq}</changefreq>
              <priority>${dynamicPages[url].priority}</priority>
              ${
                // Ternary, not `&&` — a bare `&&` renders the literal string
                // "undefined" into every <url> that has no images.
                dynamicPages[url].img
                  ? dynamicPages[url].img.map((u) => `<image:image><image:loc>${u}</image:loc></image:image>`).join('')
                  : ''
              }
            </url>
          `
        })
        .join('')}
    </urlset>
  `

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default Sitemap
