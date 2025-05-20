import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
}

// Define types for the roadmap data
type Milestone = {
  text: string
  target: number
  achieved?: string
  link: string
  key: string
  img?: string
}

type RoadmapData = {
  milestones: Milestone[]
  numPatrons: number
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('m') || 'dark'

    // Image size
    const width = mode === 'light' ? 832 : 960
    const height = 280

    // Get roadmap data
    const url = `https://api.polyhaven.com/milestones`
    const data: RoadmapData = await fetch(url).then((response) =>
      response.ok ? response.json() : { milestones: [], numPatrons: 0 }
    )

    const numPatrons = data.numPatrons

    const milestones: Milestone[] = [
      {
        text: 'Dummy milestone to make math easier',
        target: 1,
        achieved: '2000-01-01',
        link: '#',
        img: undefined,
        key: 'dummy',
      },
      ...data.milestones,
    ]

    let highestAchievedGoalIndex = 0
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i]?.achieved) {
        highestAchievedGoalIndex = i
      }
    }
    const activeMilestoneIndex = highestAchievedGoalIndex + 1

    const maxTarget = milestones[milestones.length - 1]?.target || 1
    const step = 80
    const progressBarPosition =
      highestAchievedGoalIndex > 1
        ? Math.max(
            Math.min(
              numPatrons,
              milestones[highestAchievedGoalIndex + 1]?.target
                ? milestones[highestAchievedGoalIndex + 1].target - step
                : milestones[highestAchievedGoalIndex]?.target || 0
            ),
            milestones[highestAchievedGoalIndex]?.target || 0
          ) / maxTarget
        : 0
    const targetBarPosition = activeMilestoneIndex > 1 ? (milestones[activeMilestoneIndex]?.target || 0) / maxTarget : 0

    const numPatronsToGo = milestones[highestAchievedGoalIndex + 1].target - numPatrons

    const c = {
      background: '#333333',
      text: 'white',
      faded: 'rgb(130, 130, 130)',
      accent: 'rgb(190, 111, 255)',
      target: 'rgba(190, 111, 255, 0.2)',
    }
    if (mode === 'light') {
      c.background = 'white'
      c.text = '#333333'
      c.faded = 'rgb(150, 150, 150)'
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '16px',
            padding: '10px',
            width: '100%',
            height: '100%',
            backgroundColor: c.background,
            color: c.text,
          }}
        >
          <h1 style={{ marginTop: 0 }}>Poly Haven Roadmap</h1>
          <div id="barWrapper" style={{ width: '100%', display: 'flex', margin: `35px 0` }}>
            <div
              id="barOuter"
              style={{
                display: 'flex', // Required for some reason
                position: 'relative',
                width: '100%',
                height: `${32 + 4 + 4 + 3 + 3}px`,
                padding: '4px',
                border: `3px solid ${c.accent}`,
                borderRadius: '40px',
              }}
            >
              <div
                id="barTarget"
                style={{
                  width: `${targetBarPosition * 100}%`,
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  height: '32px',
                  border: `2px solid ${c.accent}`,
                  boxSizing: 'border-box',
                  borderRadius: '40px',
                  backgroundColor: c.target,
                  opacity: 0.5,
                }}
              />
              <div
                id="barInner"
                style={{
                  width: `${progressBarPosition * 100}%`,
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  height: '32px',
                  borderRadius: '40px',
                  backgroundColor: c.accent,
                }}
              />
              <div
                id="milestones"
                style={{ display: 'flex', position: 'absolute', top: '4px', left: '4px', width: '100%' }}
              >
                {milestones
                  .slice(1)
                  .filter((m) => !m.achieved)
                  .map((m, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: i % 2 ? 'column' : 'column-reverse',
                        right: `${100 - (m.target / maxTarget) * 100}%`,
                        margin: `${32 / 2 - 9}px`,
                      }}
                    >
                      <div
                        className="text"
                        style={{
                          position: 'relative',
                          right: '52px',
                          top: i % 2 ? '-54px' : 0,
                          textAlign: 'right',
                          color: i === 0 || m.text === 'Free the Add-on' ? c.text : c.faded,
                          display: m.text === '???' ? 'none' : 'block',
                        }}
                      >
                        {m.text}
                      </div>
                      <div
                        className="arrow"
                        style={{
                          position: 'relative',
                          marginLeft: 'auto',
                          marginTop: i % 2 ? '-64px' : '0px',
                          marginBottom: i % 2 ? '8px' : '-10px',
                          right: '30px',
                          width: '8px',
                          height: '58px',
                          background: i === 0 || m.text === 'Free the Add-on' ? c.text : c.faded,
                          border: `3px solid ${c.background}`,
                          borderRadius: '20px',
                          transform: i % 2 ? 'rotate(-45deg)' : 'rotate(45deg)',
                          display: m.text === '???' ? 'none' : 'block',
                        }}
                      />
                      <div
                        className="dot"
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '18px',
                          height: '18px',
                          backgroundColor: i === 0 || m.text === 'Free the Add-on' ? c.text : c.faded,
                          border: `4px solid ${c.background}`,
                          borderRadius: '50%',
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <h2 style={{ marginBottom: 0 }}>{Math.max(0, numPatronsToGo)} patrons to next goal!</h2>
          <p style={{ margin: 0, opacity: 0.5 }}>
            {numPatrons} / {milestones[activeMilestoneIndex]?.target}
          </p>
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
