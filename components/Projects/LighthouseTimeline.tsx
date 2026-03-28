import { memo, useMemo } from 'react'
import apiSWR from 'utils/apiSWR'

import Spinner from 'components/UI/Spinner/Spinner'

import styles from './LighthouseTimeline.module.scss'

type TimelineEvent = {
  date: string
  text: string
  completed?: boolean
  dateLabel?: string
  link?: string
  timestamp?: number
}

const parseTimelineDate = (date: string) => new Date(`${date}T00:00:00Z`).getTime()

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const formatDateLabel = (event: TimelineEvent) => event.dateLabel || dateFormatter.format(parseTimelineDate(event.date))

const TimelineEventContent = ({ event }: { event: TimelineEvent }) => {
  return (
    <>
      <div className={styles.date}>{formatDateLabel(event)}</div>
      <div className={styles.text}>
        {event.link ? (
          <a href={event.link} target="_blank" rel="noreferrer" className={styles.contentLink}>
            {event.text}
          </a>
        ) : (
          event.text
        )}
      </div>
    </>
  )
}

const LighthouseTimeline = () => {
  const { data, error } = apiSWR(`/timelines/project_lighthouse`, { revalidateOnFocus: false })

  const events = useMemo(
    () =>
      !data
        ? []
        : Object.keys(data)
            .map((key) => ({ date: key, ...data[key], timestamp: parseTimelineDate(key) }))
            .sort((a, b) => a.timestamp - b.timestamp),
    [data]
  )

  if (error) return <div className={styles.timeline}>Error loading timeline</div>
  if (!data || events.length === 0) {
    return (
      <div className={styles.timeline}>
        <Spinner />
      </div>
    )
  }

  const start = events[0].timestamp
  const end = events[events.length - 1].timestamp
  const span = Math.max(1, end - start)
  const now = Date.now()
  const clampedNow = Math.min(Math.max(now, start), end)
  const lastCompletedIndex = events.reduce((highestIndex, event, index) => (event.completed ? index : highestIndex), -1)
  const nextEventIndex = Math.min(lastCompletedIndex + 1, events.length - 1)
  const allCompleted = lastCompletedIndex === events.length - 1
  const previousEventIndex = allCompleted ? Math.max(lastCompletedIndex - 1, -1) : Math.max(nextEventIndex - 1, -1)

  const getPosition = (timestamp: number) => ((timestamp - start) / span) * 100

  const completedPosition = lastCompletedIndex >= 0 ? getPosition(events[lastCompletedIndex].timestamp) : 0

  let progressPosition = completedPosition
  if (allCompleted) {
    progressPosition = 100
  } else {
    const nextPosition = getPosition(events[nextEventIndex].timestamp)
    const nowPosition = getPosition(clampedNow)
    const maxAllowedPosition = Math.max(completedPosition, nextPosition - 0.5)
    progressPosition = Math.max(completedPosition, Math.min(nowPosition, maxAllowedPosition))
  }

  const statusText = allCompleted
    ? 'All milestones completed.'
    : lastCompletedIndex >= 0
    ? `Currently between ${events[lastCompletedIndex].text} and ${events[nextEventIndex].text}.`
    : `Currently progressing toward ${events[nextEventIndex].text}.`

  return (
    <div className={styles.timeline}>
      <div className={styles.barSection}>
        <div className={styles.barTrack}>
          <div className={styles.barInnerArea}>
            <div className={styles.barFill} style={{ width: `${progressPosition}%` }}>
              <div className={styles.barShine} />
            </div>

            <div className={styles.desktopEvents}>
              {events.map((event, index) => {
                const isCompleted = !!event.completed
                const isCurrent = !allCompleted && index === nextEventIndex
                const isAlwaysVisible =
                  index === 0 ||
                  index === events.length - 1 ||
                  index === nextEventIndex ||
                  (previousEventIndex >= 0 && index === previousEventIndex)

                return (
                  <div
                    key={`${event.date}-${event.text}`}
                    className={`${styles.event} ${index % 2 === 0 ? styles.above : styles.below} ${
                      isCompleted ? styles.completed : ''
                    } ${isCurrent ? styles.current : ''} ${isAlwaysVisible ? styles.alwaysVisible : ''} ${
                      index === 0 ? styles.edgeStart : ''
                    } ${index === events.length - 1 ? styles.edgeEnd : ''}`}
                    style={{
                      left:
                        index === 0
                          ? '15px'
                          : index === events.length - 1
                          ? 'calc(100% - 15px)'
                          : `${getPosition(event.timestamp)}%`,
                    }}
                  >
                    <div className={styles.connector} />
                    <div className={styles.dot} />
                    <div className={styles.content}>
                      <TimelineEventContent event={event} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mobileEvents}>
        {events.map((event, index) => {
          const isCompleted = !!event.completed
          const isCurrent = !allCompleted && index === nextEventIndex

          return (
            <div
              key={`mobile-${event.date}-${event.text}`}
              className={`${styles.mobileEvent} ${isCompleted ? styles.completed : ''} ${
                isCurrent ? styles.current : ''
              }`}
            >
              <div className={styles.mobileDot} />
              <div className={styles.mobileContent}>
                <TimelineEventContent event={event} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(LighthouseTimeline)
