import useSWR from 'swr';
import fetcher from 'utils/fetcher';
import ReactTooltip from 'react-tooltip'

import ProgressBar from 'components/ProgressBar/ProgressBar'

import styles from './ProgressBar.module.scss'

const GoalProgress = ({ mode }) => {
  let { data, error } = useSWR(`https://api.polyhaven.com/funding_detail?tmps`, fetcher, { revalidateOnFocus: false });
  if (error) return <ProgressBar progress={0} label="Current goal" labelValue={"ERROR"} />
  if (!data) {
    return (<ProgressBar progress={0} label="Current goal" labelValue={"Loading..."} />)
  }

  let currentGoalIndex = -1
  for (const g of data.goals) {
    currentGoalIndex += 1;
    if (data.totalFunds < g.target) {
      break
    }
  }

  const currentGoal = data.goals[currentGoalIndex]
  const progress = data.totalFunds / currentGoal.target * 100
  const description = `Goal Progress: $${data.totalFunds} of $${currentGoal.target}<br/>${currentGoal.description}`

  return (
    <>
      <div data-tip={description}>
        <ProgressBar progress={progress} label="Current goal" labelValue={currentGoal.title} />
      </div>
      <ReactTooltip multiline border borderColor="rgba(190, 111, 255, 0.5)" backgroundColor="rgb(60, 60, 60)" className={styles.tooltip} />
    </>
  )
}

export default GoalProgress
