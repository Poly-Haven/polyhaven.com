import Link from 'next/link'
import { useTranslation, Trans } from 'next-i18next'

import tlc from 'constants/top_level_categories.json'
import { assetTypeName } from 'utils/assetTypeName'
import apiSWR from 'utils/apiSWR'

import Spinner from 'components/UI/Spinner/Spinner'
import { MdKeyboardArrowRight } from 'react-icons/md'

import styles from './Sidebar.module.scss'

const CategoryList = (props) => {
  const { t: tc } = useTranslation('common')
  const { t } = useTranslation('categories')

  if (props.level >= 3) {
    return <></>
  }
  const activeCat = props.categories[props.level + 1]
  let url = `/categories/${props.assetType}?future=true`
  const in_cats = props.categories.slice(0, Math.max(0, props.level + 1))
  if (in_cats.length) {
    url += `&in=${[...in_cats].sort().join(',')}`
  }
  const { data, error } = apiSWR(url, { revalidateOnFocus: false })

  const level = props.level + 1

  if (error) {
    return <div>Error</div>
  }

  if (!data) {
    return (
      <div className={`${level > 0 ? styles.subCat : ''}`}>
        <Spinner />
      </div>
    )
  }

  const wholeList = props.level === -1 ? tlc[props.assetType] : Object.keys(data)
  const list = wholeList.filter((cat) => data[cat] > 1)

  return (
    <div className={`${level > 0 ? styles.subCat : ''}`}>
      {list.map((cat) => (
        <div key={cat}>
          {props.numInParent != data[cat] ? (
            <div>
              <Link
                href="/[...assets]"
                as={`${props.assetType === 'all' ? (cat === 'all' ? 'all' : '') : `/${props.assetType}`}/${
                  in_cats.length ? in_cats.join('/') + '/' : ''
                }${cat !== 'all' ? cat : ''}`}
                className={`
          ${styles.cat}
          ${cat === activeCat ? styles.catSemiActive : ''}
          ${cat === activeCat && level === props.categories.length - 1 ? styles.catActive : ''}
          `}>

                {level === 0 ? (
                  <MdKeyboardArrowRight className={styles.caret} />
                ) : (
                  <MdKeyboardArrowRight className={styles.smallCaret} />
                )}
                {props.assetType === 'all' ? tc(assetTypeName(cat)) : t(cat)}
                <div className={styles.num}>{data[cat] ? data[cat] : 0}</div>

              </Link>
              {cat === activeCat ? (
                <CategoryList
                  assetType={props.assetType}
                  categories={props.categories}
                  level={level}
                  numInParent={data[cat] ? data[cat] : 0}
                />
              ) : (
                ''
              )}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default CategoryList
