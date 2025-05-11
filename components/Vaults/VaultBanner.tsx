import React from 'react'
import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import Loader from 'components/UI/Loader/Loader'

import { IoMdUnlock } from 'react-icons/io'
import { MdArrowForward } from 'react-icons/md'

import styles from './Vaults.module.scss'

const VaultBanner = ({ vault, numPatrons, libraryPage }) => {
  const progressBarPosition = Math.min(1, numPatrons / vault.target)
  return (
    <div className={styles.vaultWrapper}>
      <div
        className={styles.vault}
        style={{
          backgroundImage: `url("https://cdn.polyhaven.com/vaults/${vault.id}.png?width=1920&sharpen=true")`,
        }}
      >
        <div className={styles.gradientL} />
        <div className={styles.gradientR} />
        <div className={styles.left}>
          <h2>{vault.name}</h2>
          <p>{vault.description}</p>
          {!libraryPage && vault.about && <Button text="About the Project" href={vault.about} />}
        </div>

        <div className={styles.right}>
          <div className={styles.row}>
            {libraryPage && vault.about && <Button text="About the Project" href={vault.about} />}
            {!libraryPage && (
              <Button text={`Browse ${vault.assets.length} ${vault.type || 'Assets'}`} href={`/vaults/${vault.id}`} />
            )}
            <Button
              text="Access Now"
              href="https://www.patreon.com/checkout/polyhaven"
              icon={<IoMdUnlock />}
              color="red"
            />
          </div>

          <div className={styles.barWrapper}>
            <div className={styles.barOuter}>
              <div className={styles.barInner} style={{ width: `${progressBarPosition * 100}%` }}>
                <div className={styles.barShine} />
                {numPatrons > 0 ? (
                  <div className={styles.barText}>{Math.max(0, vault.target - numPatrons)} patrons to go!</div>
                ) : (
                  <div className={styles.barText}>
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!libraryPage && (
        <div className={styles.assetList}>
          {vault.assets.map((slug) => (
            <Link href="/a/[id]" as={`/a/${slug}`} className={styles.asset} key={slug}>
              <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=192&height=90 `} />
            </Link>
          ))}
          <Link href={`/vaults/${vault.id}`} className={styles.arrow}>
            <MdArrowForward />
          </Link>
        </div>
      )}
    </div>
  )
}

VaultBanner.defaultProps = {
  libraryPage: false,
}

export default VaultBanner
