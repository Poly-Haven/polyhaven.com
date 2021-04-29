import { MdWarning } from 'react-icons/md'
import styles from './Todo.module.scss';

const Todo = ({ raw, children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.todo}>
        <MdWarning />
        {raw ? children : <p>TODO {children}</p>}
      </div>
    </div>
  )
}

Todo.defaultProps = {
  raw: false,
  children: null
}

export default Todo
