import React from 'react'
import ReactECharts from 'echarts-for-react'

function RadarChart({ data = {}, style = {} }) {
  const {
    indicators = [],
    values = [],
    title = '',
    max = 5,
  } = data

  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#1E293B',
      },
    },
    tooltip: {
      trigger: 'item',
    },
    radar: {
      indicator: indicators.map((name) => ({
        name,
        max,
      })),
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#64748B',
        fontSize: 13,
      },
      splitLine: {
        lineStyle: {
          color: '#E2E8F0',
        },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(79, 70, 229, 0.02)', 'rgba(79, 70, 229, 0.05)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#E2E8F0',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: values,
            name: title || '能力值',
            areaStyle: {
              color: 'rgba(79, 70, 229, 0.2)',
            },
            lineStyle: {
              color: '#4F46E5',
              width: 2,
            },
            itemStyle: {
              color: '#4F46E5',
            },
          },
        ],
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ width: '100%', height: 400, ...style }}
      notMerge={true}
    />
  )
}

export default RadarChart
