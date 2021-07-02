import { useState } from "react";
import { MdChevronLeft, MdChevronRight, MdHelp } from 'react-icons/md'

import { sortObjByValue } from 'utils/arrayUtils'
import { getCurrency, catColor } from 'utils/finances';

import Spinner from 'components/Spinner/Spinner'
import Tooltip from 'components/Tooltip/Tooltip';

import styles from './Finances.module.scss'

const Bar = ({ label, data, total, max, currency, rates }) => {
  if (total === 0) return null
  return (
    <div className={styles.barWrapper}>
      <p>{label}: {getCurrency(total, currency, rates)}</p>
      <div className={styles.barContainer}>
        <div className={styles.bar}>
          {Object.keys(data).map((c, i) => {
            const percent = data[c] / max * 100;
            const percentStr = percent > 10 ? Math.round(percent) : percent.toFixed(1)
            return <div key={i} className={styles.sumCat} style={{
              width: `${percent}%`,
              background: catColor(c)
            }} data-tip={`${c}:<br/>${getCurrency(data[c], currency, rates)} (${percentStr}%)`}>
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

  const targetEmergencyFund = 200000
  let balance = 166501.66;  // Starting balance at 2020/11/01, transfered from the other Havens.
  for (const [m, d] of Object.entries(data)) {
    const expense: number[] = Object.values(d['expense'])
    for (const v of expense) {
      balance -= v;
    }
    const income: number[] = Object.values(d['income'])
    for (const v of income) {
      balance += v;
    }
  }
  const savings = balance - targetEmergencyFund

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

  const rates = data[month].rates
  const latestRates = data[Object.keys(data).pop()].rates

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
      <Bar label="Income" data={sortObjByValue(data[month].income)} total={totalIncome} max={barMax} currency={currency} rates={rates} />
      <Bar label="Expenses" data={sortObjByValue(data[month].expense)} total={totalExpense} max={barMax} currency={currency} rates={rates} />
      <ul>
        {currency !== 'ZAR' ? <li>
          Exchange Rate in {month}: {getCurrency(1 * rates[currency], currency, rates)} = {getCurrency(1 * rates[currency], 'ZAR', rates)}
        </li> : null}
        <li>
          Current Balance: {getCurrency(balance, currency, latestRates)}
          <MdHelp data-tip="Actual balance of our combined accounts, ignoring interest earned." />
        </li>
        <li>
          Target Emergency Savings: {getCurrency(targetEmergencyFund, currency, latestRates)}
          <MdHelp data-tip="Enough to cover our operating costs for 2 months. This is less than typically recommended, but we think this acceptable considering how stable the Patreon income is." />
        </li>
        {savings >= 0 ?
          <li>
            <strong>Usable Funds: {getCurrency(savings, currency, latestRates)}</strong>
            <MdHelp data-tip="Balance minus emergency savings." />
          </li>
          :
          <li>
            <strong>Deficit: {getCurrency(savings, currency, latestRates)}</strong>
            <MdHelp data-tip={`We need to save an additional ${getCurrency(savings, currency, latestRates)} to satisfy our emergency fund, before we can have any money to spend.`} />
          </li>
        }
      </ul>
      <div style={{ flexGrow: 1 }} />
      <p style={{ textAlign: 'right' }}><strong>Coming soon:</strong> Comparison of Patreon tiers</p>
      <Tooltip />
    </div>
  )
}

export default Monthly
