import Link from 'next/link'

import CategoryList from './CategoryList';
import { MdKeyboardArrowRight } from 'react-icons/md';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <Link href="/[...assets]" as={`/${props.assetType}`}>
          <a className={styles.cat}>
            <MdKeyboardArrowRight className={styles.caret} />
            All
          </a>
        </Link>
        <CategoryList
          assetType={props.assetType}
          categories={props.categories}
          level={-1} />
      </div>
    </div>
  );
}

export default Sidebar;