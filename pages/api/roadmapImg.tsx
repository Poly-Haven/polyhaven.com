import { ImageResponse } from '@vercel/og'

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

export default async function handler() {
  try {
    // Image size
    const width = 1000
    const height = 366

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
            backgroundColor: 'rgb(45, 45, 45)',
            color: 'white',
          }}
        >
          <h1>Poly Haven Roadmap</h1>
          <div id="barWrapper" style={{ width: '100%', display: 'flex', margin: '60px 0' }}>
            <div
              id="barOuter"
              style={{
                display: 'flex', // Required for some reason
                position: 'relative',
                width: '100%',
                height: `${32 + 4 + 4 + 3 + 3}px`,
                padding: '4px',
                border: '3px solid rgb(190, 111, 255)',
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
                  border: '2px solid rgb(190, 111, 255)',
                  boxSizing: 'border-box',
                  borderRadius: '40px',
                  backgroundColor: 'rgba(190, 111, 255, 0.2)',
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
                  backgroundColor: 'rgb(190, 111, 255)',
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
                        opacity: i === 0 || m.text === 'Free the Add-on' ? 1 : 0.33,
                      }}
                    >
                      <div
                        className="text"
                        style={{
                          position: 'relative',
                          right: '52px',
                          top: i % 2 ? '-50px' : 0,
                          textAlign: 'right',
                          color: 'white',
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
                          marginTop: i % 2 ? '-58px' : '-5px',
                          marginBottom: i % 2 ? '8px' : '-12px',
                          right: '26px',
                          width: '8px',
                          height: '60px',
                          background: 'rgb(180, 180, 180)',
                          border: '3px solid rgb(45, 45, 45)',
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
                          backgroundColor: 'white',
                          border: '4px solid rgb(45, 45, 45)',
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
