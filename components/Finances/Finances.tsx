import { useState } from 'react'
import Link from 'next/link'

import apiSWR from 'utils/apiSWR'

import MainGraph from './MainGraph'
import Monthly from './Monthly'
import Dropdown from 'components/UI/Dropdown/Dropdown'
import CountryFlag from 'components/UI/Icons/CountryFlag'

import styles from './Finances.module.scss'

const Finances = () => {
  const [currency, setCurrency] = useState('USD')
  const [filter, setFilter] = useState([])
  const [mode, setMode] = useState('income')

  let finances = null
  const { data, error } = apiSWR(`/finances`, { revalidateOnFocus: false })
  if (!error && data) {
    finances = data
  }

  const startingBalance = 166501.66 // Starting balance at 2020/11/01, transfered from the other Havens.

  return (
    <div className={styles.page}>
      <div className={styles.textBlock}>
        <div className={styles.header}>
          <h1>Finance Reports</h1>
          <Dropdown
            value={currency}
            options={{
              ZAR: { label: 'South African Rand', icon: <CountryFlag code="ZA" /> },
              USD: { label: 'US Dollar (approx)', icon: <CountryFlag code="US" /> },
              EUR: { label: 'Euro (approx)', icon: <CountryFlag code="EU" /> },
            }}
            onChange={setCurrency}
            label="Currency"
          />
        </div>
        <p>
          Transparency is key to everything we do here at Poly Haven. That's why we have this Finance Reports page: to
          show you exactly how we operate, how much we earn from donations, ads, sponsorships, and any other source -
          and where we spend it.
        </p>
        <p>
          Absolutely <strong>all</strong> of our finances are shown here, generated directly from our bank feeds.
        </p>
        <p>
          Any excess earnings that we haven't spent yet are saved for future costs, such as travel, hardware, and
          short-term contracts to create specific assets. As a rule, we also aim to keep at least 2 months worth of
          salaries and operating costs as savings in case of a rainy day.
        </p>
        <p>
          If you have any questions or concerns, <Link href="/about-contact">we'd be happy to chat</Link>.
        </p>
      </div>
      <div className={styles.row}>
        <div className={styles.half}>
          <MainGraph
            data={finances}
            currency={currency}
            startingBalance={startingBalance}
            filter={filter}
            setFilter={setFilter}
            mode={mode}
            setMode={setMode}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.half}>
          <Monthly
            data={finances}
            currency={currency}
            startingBalance={startingBalance}
            filter={filter}
            setFilter={setFilter}
            mode={mode}
            setMode={setMode}
          />
        </div>
      </div>
    </div>
  )
}

export default Finances
