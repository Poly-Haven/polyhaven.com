import { useTranslation, Trans } from 'next-i18next';

import ProgressBar from 'components/UI/ProgressBar/ProgressBar'
import Tooltip from 'components/UI/Tooltip/Tooltip'

import apiSWR from 'utils/apiSWR'

const GoalProgress = ({ mode }) => {
  const { t } = useTranslation(['common']);
  let { data, error } = apiSWR(`/funding`, { revalidateOnFocus: false });
  if (error) return <ProgressBar labelValue={"ERROR"} mode={mode} />
  if (!data) {
    return (<ProgressBar labelValue={t('common:loading')} mode={mode} />)
  }

  const goal = data.goal
  const tooltipCorp = `${data.numCorps} ${t('common:corporate-sponsor', { count: 3 })}: $${data.corpFunds}`
  const tooltipPatron = `${data.numPatrons} ${t('common:patron', { count: 3 })}: $${data.patronFunds}`

  if (!goal) {
    // goal is null if the last goal was reached
    return (
      <>
        <ProgressBar
          progress1={100}
          progress2={data.corpFunds / data.totalFunds * 100}
          label={t('common:goal.complete')}
          labelValue=""
          mode={mode}
          tooltipLabel={t('common:goal.reached')}
          tooltip1={tooltipPatron}
          tooltip2={tooltipCorp}
        />
        <Tooltip />
      </>
    )
  }
  const progress1 = data.totalFunds / goal.target * 100
  const progress2 = data.corpFunds / goal.target * 100
  const label = mode === 'big' ? t('common:goal.current') : <Trans
    i18nKey="common:goal.to-go"
    t={t}
    values={{ dollars: Math.max(0, goal.target - data.totalFunds) }}
  />
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
