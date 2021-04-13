import styles from './Spinner.module.scss';

const Spinner = (props) => {
  return (
    <div className={styles.spinnerWrapper}>
      <div className={styles.spinner}></div>
    </div>
  );
}

export default Spinner;