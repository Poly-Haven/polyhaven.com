import { useState } from 'react'
import Link from 'next/link'
import { MdChevronLeft, MdChevronRight, MdWarning } from 'react-icons/md'

import { getCurrency } from 'utils/finances'
import apiSWR from 'utils/apiSWR'

import AssetDlGraph from 'components/Stats/AssetDlGraph'
import Avatar from 'components/UI/Avatar/Avatar'
import Spinner from 'components/UI/Spinner/Spinner'

import styles from './Popularity.module.scss'

const money = (v: number) => getCurrency(v, 'USD', {})

const Popularity = ({ data }) => {
  const months = Object.keys(data).filter((m) => m >= '2022-07')
  const [month, setMonth] = useState(months.slice(-1).pop())

  let popDataJSX = <Spinner />
  const { data: popData, error } = apiSWR(`/popularity/tex/${month}`, { revalidateOnFocus: false })
  if (error) {
    popDataJSX = <h2>There was an error loading popularity data.</h2>
  }
  if (popData) {
    popDataJSX = (
      <>
        <div className={styles.tableWrapper}>
          <table>
            <tr>
              <th></th>
              <th>Texture</th>
              <th>28d Graph</th>
              <th>Date Published</th>
              <th>Author</th>
              <th>Downloads**</th>
              <th>Popularity*</th>
              <th>Bonus (USD)</th>
            </tr>
            {popData.textures.map((pop, i) => (
              <tr>
                <td>
                  <Link href={`/a/${pop.slug}`}>

                    <img src={`https://cdn.polyhaven.com/asset_img/primary/${pop.slug}.png?height=50`} />

                  </Link>
                </td>
                <td>
                  <Link href={`/a/${pop.slug}`} legacyBehavior>{pop.name}</Link>
                  {pop.backplates ? <abbr title="Includes backplates (+40% popularity)"> +B</abbr> : null}
                </td>
                <td>
                  <div className={styles.dlGraph}>
                    <AssetDlGraph
                      slug={pop.slug}
                      dateFrom={new Date(pop.date_published * 1000).toISOString().split('T')[0]}
                      dateTo={
                        new Date(pop.date_published * 1000 + 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      }
                    />
                  </div>
                </td>
                <td>
                  {new Date(pop.date_published * 1000).toISOString().split('T')[0]}
                  {pop.warning ? (
                    <abbr title="This texture is less than 28 days old, popularity has not yet stabilized.">
                      <MdWarning style={{ fontSize: '1.5em', verticalAlign: 'bottom', color: '#F96854' }} />
                    </abbr>
                  ) : null}
                </td>
                <td style={{ lineHeight: 1 }}>
                  <Avatar id={pop.author} size={24} /> {pop.author}
                </td>
                <td>{pop.unique_downloads}</td>
                <td>{(pop.popularity * 100).toFixed(2)}%</td>
                <td>{money(pop.bonus)}</td>
              </tr>
            ))}
          </table>
        </div>

        <div className={styles.tableWrapper}>
          <table>
            <tr>
              <th>Author</th>
              <th>Bonus (USD)</th>
            </tr>
            {Object.keys(popData.author_totals).map((author, i) => (
              <tr>
                <td>
                  <div className={styles.author}>
                    <Avatar id={author} size={24} />
                    <span>{author}</span>
                  </div>
                </td>
                <td>{money(popData.author_totals[author])}</td>
              </tr>
            ))}
          </table>
        </div>
      </>
    )
  }

  const prevMonth = () => {
    setMonth(months[Math.max(0, months.indexOf(month) - 1)])
  }
  const nextMonth = () => {
    setMonth(months[Math.min(months.length - 1, months.indexOf(month) + 1)])
  }

  const poolContribution = month >= '2022-11' ? 100 : 50

  return (
    <div className={styles.wrapper}>
      <div className={styles.bumperWrapper}>
        <h1>Texture Popularity Ratings</h1>
        <div className={styles.spacer} />
        <div className={`${styles.bumper} ${months.indexOf(month) === 0 ? styles.disabled : null}`} onClick={prevMonth}>
          <MdChevronLeft />
        </div>
        <h2>{month}</h2>
        <div
          className={`${styles.bumper} ${months.indexOf(month) === months.length - 1 ? styles.disabled : null}`}
          onClick={nextMonth}
        >
          <MdChevronRight />
        </div>
      </div>

      <p>
        This page shows the popularity rating of textures published in{' '}
        {new Date(month).toLocaleString('en-us', { month: 'long' })} {month.split('-')[0]}.
      </p>

      <p>
        The popularity rating* is used to determine the bonus earnings for the author of each texture. More popular
        textures earn the author more income (on top of the base rate).
      </p>

      <p>
        The purpose of rewarding more popular textures is to encourage contributions that are more useful or more wanted
        by users.
      </p>

      <p>The total amount to share for bonus earnings is comprised of a pool of ${poolContribution} per asset.</p>

      {popDataJSX}

      <div className={styles.footnotes}>
        <p>
          * Popularity rating is determined by unique downloads over the first 28 days of the texture's publication,
          with some basic statistical maniplulation to lower the influence of large spikes and troughs in downloads.
          <br />
          This is to account for inconsistent social media influence, public holidays, and server instabilities, and
          thus attempt to provide a fairer comparison of quality and usefulness.
          <br />
          Details about the exact calculations can be found in the{' '}
          <a href="https://github.com/Poly-Haven/Public-API/blob/master/routes/popularity.js">source code</a> for this
          page.
        </p>

        <p>** Total downloads, counting each user ID only once, over the first 28 days of the texture's publication.</p>
      </div>
    </div>
  )
}

export default Popularity
