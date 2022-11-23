import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type') || 'all'
    const categories = searchParams.get('categories')

    // Image size & content
    const width = 1200
    const height = 630
    const numImages = {
      hdris: 6,
      textures: 8,
      models: 12,
      all: 15,
    }
    const columns = {
      hdris: 3,
      textures: 4,
      models: 5,
      all: 5,
    }
    const thumbWidth = (width - 20) / columns[type] - 20
    const thumbHeight = (height - 20) / 2 - 20

    // Get assets
    let url = `https://api.polyhaven.com/assets?t=${type}&future=true`
    if (categories) {
      url += `&c=${categories}`
    }
    const data = await fetch(url).then((response) => (response.ok ? response.json() : {}))
    const sortedKeys = Object.keys(data)
      .sort(function (a, b) {
        return data[b].download_count - data[a].download_count
      })
      .slice(0, numImages[type])

    if (sortedKeys.length === 0) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: 0,
              padding: '10px',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgb(45, 45, 45)',
            }}
          >
            <h1
              style={{
                color: 'white',
                fontSize: '72px',
                fontFamily: "'Open Sans', sans-serif",
                textAlign: 'center',
              }}
            >
              No assets found
            </h1>
          </div>
        ),
        {
          width: width,
          height: height,
        }
      )
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            fontSize: 0,
            padding: '10px',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgb(45, 45, 45)',
          }}
        >
          $
          {sortedKeys.map((key) => (
            <img
              key={key}
              src={`https://cdn.polyhaven.com/asset_img/thumbs/${key}.png?width=371&height=278`}
              style={{
                margin: '10px',
                width: `${thumbWidth}px}`,
                maxHeight: `${thumbHeight}px`,
              }}
            />
          ))}
        </div>
      ),
      {
        width: width,
        height: height,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
