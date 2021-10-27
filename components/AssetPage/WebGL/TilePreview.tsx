import { MdAdd } from "react-icons/md";

import Spinner from "components/Spinner/Spinner";
import IconButton from "components/UI/Button/IconButton";

import styles from './TilePreview.module.scss'

const TilePreview = ({ image }) => {

  const zoomIn = () => { }

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapper} id="panoViewer">
        <Spinner />
      </div>
      <div className={styles.buttons}>
        <IconButton icon={<MdAdd />} onClick={zoomIn} />
      </div>
    </div>
  )
}

export default TilePreview
