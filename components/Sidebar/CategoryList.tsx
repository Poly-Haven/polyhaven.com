import Link from 'next/link'
import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import tlc from 'constants/top_level_categories.json';

import Spinner from 'components/Spinner/Spinner';
import { MdKeyboardArrowRight } from 'react-icons/md';

import styles from './Sidebar.module.scss';

const CategoryList = (props) => {
  if (props.level >= 3) {
    return <></>
  }
  const activeCat = props.categories[props.level + 1];
  let url = `https://api.polyhaven.com/categories/${props.assetType}`;
  const in_cats = props.categories.slice(0, Math.max(0, props.level + 1))
  if (in_cats.length) {
    url += `?in=${[...in_cats].sort().join(',')}`
  }
  const { data, error } = useSWR(url, fetcher, { revalidateOnFocus: false });

  const level = props.level + 1;

  if (error) {
    return <div>Error</div>;
  }

  if (!data) {
    return (
      <div className={`${level > 0 ? styles.subCat : ""}`}>
        <Spinner />
      </div>
    )
  }

  const wholeList = props.level === -1 ? tlc[props.assetType] : Object.keys(data);
  const list = wholeList.filter(cat => (
    data[cat] > 2
  ))

  return (
    <div className={`${level > 0 ? styles.subCat : ""}`}>
      {list.map(cat => (
        <>{props.numInParent != data[cat] ?
          <div key={cat}>
            <Link href="/[...assets]" as={`/${props.assetType}/${in_cats.length ? in_cats.join('/') + '/' : ''}${cat}`} >
              <a className={`
            ${styles.cat}
            ${cat === activeCat ? styles.catSemiActive : ""}
            ${cat === activeCat && level === props.categories.length - 1 ? styles.catActive : ""}
            `}>
                {level === 0 ?
                  <MdKeyboardArrowRight className={styles.caret} /> :
                  <MdKeyboardArrowRight className={styles.smallCaret} />}
                {cat}
                <div className={styles.num}>
                  {data[cat] ? data[cat] : 0}
                </div>
              </a>
            </Link>
            {cat === activeCat ?
              <CategoryList
                assetType={props.assetType}
                categories={props.categories}
                level={level}
                numInParent={data[cat] ? data[cat] : 0} />
              : ""}
          </div>
          : ""}</>
      ))}
    </div>
  );
}

export default CategoryList


