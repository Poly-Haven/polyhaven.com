import { useEffect, useMemo, useState } from 'react'

import { add, differenceInMilliseconds, intervalToDuration } from 'date-fns'

import styles from './Countdown.module.scss'

type CountdownTimeInput = Date | number | string

export type CountdownIntervalKey = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds'

interface CountdownProps {
  targetDate: CountdownTimeInput
  maxInterval?: CountdownIntervalKey
}

interface CountdownValues {
  years: number
  months: number
  weeks: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const INTERVAL_ORDER: CountdownIntervalKey[] = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds']

const INTERVAL_LABELS: Record<CountdownIntervalKey, string> = {
  years: 'Years',
  months: 'Months',
  weeks: 'Weeks',
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
}

const INTERVAL_SINGULAR_LABELS: Record<CountdownIntervalKey, string> = {
  years: 'Year',
  months: 'Month',
  weeks: 'Week',
  days: 'Day',
  hours: 'Hour',
  minutes: 'Minute',
  seconds: 'Second',
}

const ZERO_VALUES: CountdownValues = {
  years: 0,
  months: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
}

const MS_IN_SECOND = 1000
const MS_IN_MINUTE = 60 * MS_IN_SECOND
const MS_IN_HOUR = 60 * MS_IN_MINUTE
const MS_IN_DAY = 24 * MS_IN_HOUR
const MS_IN_WEEK = 7 * MS_IN_DAY

const FIXED_BREAKDOWN_INTERVALS: CountdownIntervalKey[] = ['weeks', 'days', 'hours', 'minutes', 'seconds']

const normalizeTimeInput = (value: CountdownTimeInput): Date => (value instanceof Date ? value : new Date(value))

const getFixedBreakdownValues = (remainingMs: number, startInterval: CountdownIntervalKey): CountdownValues => {
  const values: CountdownValues = { ...ZERO_VALUES }
  let remainderMs = remainingMs

  const startIndex = FIXED_BREAKDOWN_INTERVALS.indexOf(startInterval)
  const intervals = FIXED_BREAKDOWN_INTERVALS.slice(startIndex)

  intervals.forEach((interval) => {
    if (interval === 'weeks') {
      values.weeks = Math.floor(remainderMs / MS_IN_WEEK)
      remainderMs %= MS_IN_WEEK
      return
    }

    if (interval === 'days') {
      values.days = Math.floor(remainderMs / MS_IN_DAY)
      remainderMs %= MS_IN_DAY
      return
    }

    if (interval === 'hours') {
      values.hours = Math.floor(remainderMs / MS_IN_HOUR)
      remainderMs %= MS_IN_HOUR
      return
    }

    if (interval === 'minutes') {
      values.minutes = Math.floor(remainderMs / MS_IN_MINUTE)
      remainderMs %= MS_IN_MINUTE
      return
    }

    values.seconds = Math.max(0, remainderMs / MS_IN_SECOND)
  })

  return values
}

const getCountdownValues = (
  currentDate: Date,
  targetDate: Date,
  maxInterval?: CountdownIntervalKey
): CountdownValues => {
  const remainingMs = Math.max(0, differenceInMilliseconds(targetDate, currentDate))

  if (remainingMs <= 0) {
    return ZERO_VALUES
  }

  if (maxInterval && FIXED_BREAKDOWN_INTERVALS.includes(maxInterval)) {
    return getFixedBreakdownValues(remainingMs, maxInterval)
  }

  const duration = intervalToDuration({
    start: currentDate,
    end: targetDate,
  })

  const years = Math.max(0, duration.years ?? 0)
  const rawMonths = Math.max(0, duration.months ?? 0)
  const months = maxInterval === 'months' ? years * 12 + rawMonths : rawMonths
  const dayTotal = Math.max(0, duration.days ?? 0)
  const weeks = Math.floor(dayTotal / 7)
  const days = dayTotal % 7
  const hours = Math.max(0, duration.hours ?? 0)
  const minutes = Math.max(0, duration.minutes ?? 0)
  const wholeSeconds = Math.max(0, duration.seconds ?? 0)

  const upToWholeSeconds = add(currentDate, {
    years: maxInterval === 'months' ? 0 : years,
    months,
    days: dayTotal,
    hours,
    minutes,
    seconds: wholeSeconds,
  })
  const fractionalMs = Math.max(0, differenceInMilliseconds(targetDate, upToWholeSeconds))
  const seconds = wholeSeconds + fractionalMs / 1000

  return {
    years: maxInterval === 'months' ? 0 : years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
  }
}

const getStartInterval = (
  values: CountdownValues,
  maxInterval?: CountdownIntervalKey,
  targetReached?: boolean
): CountdownIntervalKey => {
  if (maxInterval) {
    return maxInterval
  }

  if (targetReached) {
    return 'years'
  }

  return INTERVAL_ORDER.find((interval) => values[interval] > 0) ?? 'seconds'
}

const formatIntervalValue = (interval: CountdownIntervalKey, value: number): string => {
  const safeValue = Math.max(0, value)

  if (interval !== 'seconds') {
    return Math.floor(safeValue).toString()
  }

  if (safeValue < 10) {
    return safeValue.toFixed(1)
  }

  return Math.floor(safeValue).toString()
}

const formatIntervalLabel = (interval: CountdownIntervalKey, value: number): string => {
  if (interval === 'seconds') {
    // Don't do pluralization for seconds to avoid distraction
    return INTERVAL_LABELS.seconds
  }

  const safeValue = Math.max(0, value)
  const isSingular = Math.floor(safeValue) === 1

  if (isSingular) {
    return INTERVAL_SINGULAR_LABELS[interval]
  }

  return INTERVAL_LABELS[interval]
}

const Countdown = ({ targetDate, maxInterval }: CountdownProps) => {
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTimestamp(Date.now())
    }, 100)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const displayData = useMemo(() => {
    const currentDate = new Date(currentTimestamp)
    const target = normalizeTimeInput(targetDate)
    const targetReached = target.valueOf() <= currentDate.valueOf()
    const values = getCountdownValues(currentDate, target, maxInterval)
    const startInterval = getStartInterval(values, maxInterval, targetReached)
    const startIndex = INTERVAL_ORDER.indexOf(startInterval)
    const intervals = INTERVAL_ORDER.slice(startIndex)

    return intervals.map((interval) => ({
      interval,
      value: values[interval],
      label: formatIntervalLabel(interval, values[interval]),
    }))
  }, [currentTimestamp, targetDate, maxInterval])

  return (
    <div className={styles.wrapper}>
      {displayData.map(({ interval, value, label }) => (
        <div key={interval} className={styles.block}>
          <div className={styles.value}>{formatIntervalValue(interval, value)}</div>
          <div className={styles.label}>{label}</div>
        </div>
      ))}
    </div>
  )
}

export default Countdown
