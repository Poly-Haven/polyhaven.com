import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

import apiSWR from 'utils/apiSWR'

const AssetDlGraph = ({ slug, dateFrom, dateTo }: { slug: string; dateFrom: string; dateTo: string }) => {
  const { data, error } = apiSWR(`/stats/downloads?type=ASSET&slug=${slug}&date_from=${dateFrom}&date_to=${dateTo}`, {
    revalidateOnFocus: false,
  })
  if (error || !data) {
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <Tooltip
          label="day"
          position={{ x: 0, y: 25 }}
          contentStyle={{
            backgroundColor: 'rgba(30,30,30,0.3)',
            padding: '0.5em',
          }}
          itemStyle={{
            padding: 0,
            margin: '-0.5em',
            fontSize: '0.8em',
          }}
          labelStyle={{
            textAlign: 'center',
            marginTop: '-0.5em',
          }}
          labelFormatter={(value) => data[value].day}
          formatter={(value, name) => [value, 'Unique Downloads']}
        />
        <Area type="monotone" dataKey="unique" stroke="rgb(190, 111, 255)" fill="rgba(190, 111, 255,0.5)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
AssetDlGraph.defaultProps = {
  dateTo: new Date().toISOString().split('T')[0],
}

export default AssetDlGraph
