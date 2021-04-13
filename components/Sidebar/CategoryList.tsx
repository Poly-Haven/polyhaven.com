import Link from 'next/link'
import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import tlc from 'constants/top_level_categories.json';

import Spinner from 'components/Spinner/Spinner';

import styles from './Sidebar.module.scss';

const CategoryList = (props) => {
  if (props.level > 2) {
    return <></>
  }
  const activeCat = props.categories[props.level + 1];
  let url = `https://api.polyhaven.com/categories/${props.assetType}`;
  const in_cats = props.categories.slice(0, Math.max(0, props.level + 1))
  if (in_cats.length) {
    url += `?in=${in_cats.join(',')}`
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
        <div key={cat}>
          <Link href={`/${props.assetType}/${in_cats.length ? in_cats.join('/') + '/' : ''}${cat}`} >
            <div className={` ${styles.cat} ${cat === activeCat ? styles.catActive : ""}`}>{cat}
              <div className={styles.num}>
                {data[cat] ? data[cat] : 0}
              </div>
            </div>
          </Link>
          {cat === activeCat ?
            <CategoryList
              assetType={props.assetType}
              categories={props.categories}
              level={level} />
            : ""}
        </div>
      ))}
    </div>
  );
}

export default CategoryList


