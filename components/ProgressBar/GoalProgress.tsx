import useSWR from 'swr';
import fetcher from 'utils/fetcher';
import ProgressBar from 'components/ProgressBar/ProgressBar'

const GoalProgress = ({ mode }) => {
  let { data, error } = useSWR(`https://api.polyhaven.com/funding_detail?tmps`, fetcher, { revalidateOnFocus: false });
  if (error) return <ProgressBar progress={0} label="Error loading goal progress" labelValue={"ERROR"} />
  if (!data) {
    return (<ProgressBar progress={0} label="Loading goal progress..." labelValue={"Loading..."} />)
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

  return (
    <ProgressBar progress={progress} label="Current goal" labelValue={currentGoal.title} />
  )
}

export default GoalProgress
