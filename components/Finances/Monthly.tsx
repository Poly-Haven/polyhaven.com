import { useState } from "react";
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

import { sortObjByValue } from 'utils/arrayUtils'
import { getCurrency, catColor } from 'utils/finances';

import Spinner from 'components/Spinner/Spinner'
import Tooltip from 'components/Tooltip/Tooltip';

import styles from './Finances.module.scss'

const Bar = ({ label, data, total, max, currency }) => {
  if (total === 0) return null
  return (
    <div className={styles.barWrapper}>
      <p>{label}: {getCurrency(total, currency)}</p>
      <div className={styles.barContainer}>
        <div className={styles.bar}>
          {Object.keys(data).map((c, i) => {
            const percent = data[c] / max * 100;
            const percentStr = percent > 10 ? Math.round(percent) : percent.toFixed(1)
            return <div key={i} className={styles.sumCat} style={{
              width: `${percent}%`,
              background: catColor(c)
            }} data-tip={`${c}:<br/>${getCurrency(data[c], currency)} (${percentStr}%)`}>
              <p>{c}</p>
            </div>
          }
          )}
          <div className={styles.space} />
        </div>
      </div>
    </div>
  )
}

const Monthly = ({ data, currency }) => {
  const [monthState, setMonth] = useState(null);
  if (!data) return <Spinner />

  const months = Object.keys(data)

  const month = monthState || months.slice(-1).pop()

  const prevMonth = () => {
    setMonth(months[Math.max(0, months.indexOf(month) - 1)])
  }
  const nextMonth = () => {
    setMonth(months[months.indexOf(month) + 1])
  }

  const totalIncome: any = Object.values(data[month].income).reduce((a: number, b: number) => a + b, 0);
  const totalExpense: any = Object.values(data[month].expense).reduce((a: number, b: number) => a + b, 0);
  const barMax = Math.max(totalIncome, totalExpense);

  return (
    <div className={styles.barSection}>
      <div className={styles.bumperWrapper}>
        <div className={`${styles.bumper} ${months.indexOf(month) === 0 ? styles.disabled : null}`} onClick={prevMonth}>
          <MdChevronLeft />
        </div>
        <h2>{month}</h2>
        <div className={`${styles.bumper} ${months.indexOf(month) === months.length - 1 ? styles.disabled : null}`} onClick={nextMonth}>
          <MdChevronRight />
        </div>
      </div>
      <Bar label="Income" data={sortObjByValue(data[month].income)} total={totalIncome} max={barMax} currency={currency} />
      <Bar label="Expenses" data={sortObjByValue(data[month].expense)} total={totalExpense} max={barMax} currency={currency} />
      <div style={{ flexGrow: 1 }} />
      <p style={{ textAlign: 'right' }}><strong>Coming soon:</strong> Comparison of Patreon tiers; Current reserve & savings; Choose currency</p>
      <Tooltip />
    </div>
  )
}

export default Monthly
