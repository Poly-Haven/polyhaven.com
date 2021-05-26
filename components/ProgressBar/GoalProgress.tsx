import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import ProgressBar from 'components/ProgressBar/ProgressBar'
import Tooltip from 'components/Tooltip/Tooltip'

const GoalProgress = ({ mode }) => {
  let { data, error } = useSWR(`https://api.polyhaven.com/funding_detail?tmpsxcsv`, fetcher, { revalidateOnFocus: false });
  if (error) return <ProgressBar labelValue={"ERROR"} mode={mode} />
  if (!data) {
    return (<ProgressBar labelValue={"Loading..."} mode={mode} />)
  }

  let currentGoalIndex = -1
  for (const g of data.goals) {
    currentGoalIndex += 1;
    if (data.totalFunds < g.target) {
      break
    }
  }

  const currentGoal = data.goals[currentGoalIndex]
  const progress1 = data.totalFunds / currentGoal.target * 100
  const progress2 = data.corpFunds / currentGoal.target * 100
  const label = mode === 'big' ? "Current goal:" : `$${Math.max(0, currentGoal.target - data.totalFunds)} to go`
  const description = `Goal Progress: $${data.totalFunds} of $${currentGoal.target} per month<br/>${currentGoal.description}`
  const tooltipCorp = `${data.numCorps} corporate sponsors: $${data.corpFunds}`
  const tooltipPatron = `${data.numPatrons} patrons: $${data.patronFunds}`

  return (
    <>
      <ProgressBar
        progress1={progress1}
        progress2={progress2}
        label={label}
        labelValue={currentGoal.title}
        mode={mode}
        tooltipLabel={description}
        tooltip1={tooltipPatron}
        tooltip2={tooltipCorp}
      />
      <Tooltip />
    </>
  )
}

export default GoalProgress
