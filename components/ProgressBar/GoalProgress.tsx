import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import ProgressBar from 'components/ProgressBar/ProgressBar'
import Tooltip from 'components/Tooltip/Tooltip'

const GoalProgress = ({ mode }) => {
  let { data, error } = useSWR(`https://api.polyhaven.com/funding`, fetcher, { revalidateOnFocus: false });
  if (error) return <ProgressBar labelValue={"ERROR"} mode={mode} />
  if (!data) {
    return (<ProgressBar labelValue={"Loading..."} mode={mode} />)
  }

  const goal = data.goal
  const tooltipCorp = `${data.numCorps} corporate sponsors: $${data.corpFunds}`
  const tooltipPatron = `${data.numPatrons} patrons: $${data.patronFunds}`

  if (!goal) {
    // goal is null if the last goal was reached
    return (
      <>
        <ProgressBar
          progress1={100}
          progress2={data.corpFunds / data.totalFunds * 100}
          label="Complete!"
          labelValue=""
          mode={mode}
          tooltipLabel="We reached our last goal!<br/>Something new should appear here soon :)"
          tooltip1={tooltipPatron}
          tooltip2={tooltipCorp}
        />
        <Tooltip />
      </>
    )
  }
  const progress1 = data.totalFunds / goal.target * 100
  const progress2 = data.corpFunds / goal.target * 100
  const label = mode === 'big' ? "Current goal:" : `$${Math.max(0, goal.target - data.totalFunds)} to go`
  const description = `Goal Progress: $${data.totalFunds} of $${goal.target} per month<br/>${goal.description}`

  return (
    <>
      <ProgressBar
        progress1={progress1}
        progress2={progress2}
        label={label}
        labelValue={goal.title}
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
