import { useState, useEffect } from 'react'
import Link from 'next/link';
import { MdChevronLeft, MdChevronRight, MdWarning, MdHelp } from 'react-icons/md'

import { getCurrency } from 'utils/finances';
import apiSWR from 'utils/apiSWR'

import AssetDlGraph from 'components/Stats/AssetDlGraph';
import Avatar from 'components/Avatar/Avatar'
import Spinner from 'components/Spinner/Spinner';

import styles from './Popularity.module.scss'

const money = (v: number) => getCurrency(v, 'ZAR', {})

const getShareAmount = (data, month) => {
  let income = 0
  const sharePercent = 0.25
  const sharedIncomeTypes = ['Patreon', 'Ad Revenue']
  for (const i of sharedIncomeTypes) {
    if (data[month].income[i]) {
      income += data[month].income[i]
    }
  }
  const total = income * sharePercent
  const upFront = data[month].hdri_upfront
  const share = upFront ? total - upFront : 0
  return [total, share]
}

const Popularity = ({ data }) => {
  const months = Object.keys(data).filter(m => m >= "2021-07")
  const [month, setMonth] = useState(months.slice(-1).pop());

  const [budget, share] = getShareAmount(data, month)

  let popDataJSX = <Spinner />
  const { data: popData, error } = apiSWR(`/popularity/${month}?share_amount=${share}`, { revalidateOnFocus: false });
  if (error) {
    popDataJSX = <h2>There was an error loading popularity data.</h2>
  }
  if (popData) {
    popDataJSX = <>
      <table>
        <tr>
          <th></th>
          <th>HDRI</th>
          <th>28d Graph</th>
          <th>Date Published</th>
          <th>Author</th>
          <th>Downloads***</th>
          <th>Popularity*</th>
          {share ? <th>Bonus (ZAR)</th> : null}
        </tr>
        {popData.hdris.map((pop, i) => <tr>
          <td>
            <Link href={`/a/${pop.slug}`}><a>
              <img src={`https://cdn.polyhaven.com/asset_img/primary/${pop.slug}.png?height=50`} />
            </a></Link>
          </td>
          <td>
            <Link href={`/a/${pop.slug}`}>{pop.name}</Link>
            {pop.backplates ? <abbr title='Includes backplates (+40% popularity)'> +B</abbr> : null}
          </td>
          <td>
            <div className={styles.dlGraph}>
              <AssetDlGraph
                slug={pop.slug}
                dateFrom={new Date(pop.date_published * 1000).toISOString().split('T')[0]}
                dateTo={new Date(pop.date_published * 1000 + 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
          </td>
          <td>
            {new Date(pop.date_published * 1000).toISOString().split('T')[0]}
            {pop.warning ? <abbr title='This HDRI is less than 28 days old, popularity has not yet stabilized.'>
              <MdWarning style={{ fontSize: '1.5em', verticalAlign: 'bottom', color: '#F96854' }} />
            </abbr> : null}
          </td>
          <td style={{ lineHeight: 1 }}><Avatar id={pop.author} size={24} /> {pop.author}</td>
          <td>{pop.unique_downloads}</td>
          <td>{(pop.popularity * 100).toFixed(2)}%</td>
          {share ? <td>{money(pop.bonus)}</td> : null}
        </tr>
        )}

      </table>

      {share ?
        <table>
          <tr>
            <th>Author</th>
            <th>Bonus (ZAR)</th>
            {data[month].bonus_usd_rate ?
              <th>Bonus (USD) <abbr title={`Using exchange rate on date of bonus payment: $1 = ${money(data[month].bonus_usd_rate)}`}><MdHelp /></abbr></th>
              : null}
          </tr>
          {Object.keys(popData.author_totals).map((author, i) => <tr>
            <td>
              <div className={styles.author}>
                <Avatar id={author} size={24} />
                <span>{author}</span>
              </div>
            </td>
            <td>
              {money(popData.author_totals[author])}
            </td>
            {data[month].bonus_usd_rate ?
              <td>
                {getCurrency(popData.author_totals[author], 'USD', { USD: data[month].bonus_usd_rate })}
              </td>
              : null}
          </tr>
          )}
        </table>
        : null}
    </>
  }

  const prevMonth = () => {
    setMonth(months[Math.max(0, months.indexOf(month) - 1)])
  }
  const nextMonth = () => {
    setMonth(months[Math.min(months.length - 1, months.indexOf(month) + 1)])
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.bumperWrapper}>
        <h1>HDRI Popularity Ratings</h1>
        <div className={styles.spacer} />
        <div className={`${styles.bumper} ${months.indexOf(month) === 0 ? styles.disabled : null}`} onClick={prevMonth}>
          <MdChevronLeft />
        </div>
        <h2>{month}</h2>
        <div className={`${styles.bumper} ${months.indexOf(month) === months.length - 1 ? styles.disabled : null}`} onClick={nextMonth}>
          <MdChevronRight />
        </div>
      </div>

      <p>This page shows the popularity rating of HDRIs published in {new Date(month).toLocaleString('en-us', { month: 'long' })} {month.split('-')[0]}.</p>

      <p>The popularity rating* is used to determine the bonus earnings for the author of each HDRI. More popular HDRIs earn the author more income (on top of the base rate).</p>

      <p>The purpose of rewarding more popular HDRIs is to encourage HDRI contributions that are more useful or more wanted by users.</p>

      <p>The total budget allocation for HDRIs this month is: <strong>{money(budget)}</strong> (25% of Patreon + Advertising <Link href="/finance-reports">income</Link>).</p>

      <p>After subtracting the up-front payments** for these HDRIs, the remainder to share for bonus earnings is: <strong>{share ? money(share) : "TBD"}</strong></p>

      {popDataJSX}

      <div className={styles.footnotes}>
        <p>
          * Popularity rating is determined by unique downloads over the first 28 days of the HDRI's publication, with some basic statistical maniplulation to lower the influence of large spikes and troughs in downloads.<br />
          This is to account for inconsistent social media influence, public holidays, and server instabilities, and thus attempt to provide a fairer comparison of quality and usefulness between HDRIs.<br />
          Details about the exact calculations can be found in the <a href="https://github.com/Poly-Haven/Public-API/blob/master/routes/popularity.js">source code</a> for this page.
        </p>

        <p>** $100 per HDRI, or $140 if it includes backplates (max 1 per author). Only one HDRI per month may earn a 40% bonus for including backplates - if more than one includes backplates, the most popular HDRI is preferred.</p>

        <p>*** Total downloads, counting each user ID only once, over the first 28 days of the HDRI's publication.</p>
      </div>
    </div>
  )
}

export default Popularity
