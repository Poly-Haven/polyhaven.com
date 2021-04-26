import { MdWarning } from 'react-icons/md'
import styles from './Todo.module.scss';

const Todo = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.todo}>
        <MdWarning />
        {children}
      </div>
    </div>
  )
}

Todo.defaultProps = {
  children: (<p>TODO</p>)
}

export default Todo
