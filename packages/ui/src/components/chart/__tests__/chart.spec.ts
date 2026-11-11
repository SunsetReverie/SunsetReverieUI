import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrChart from '../index'
import { arcPath, areaPath, clamp, formatTick, linePath, niceTicks } from '../src/chart-utils'

describe('chart-utils', () => {
  it('刻度从 0 开始且覆盖最大值', () => {
    const ticks = niceTicks(97)

    expect(ticks[0]).toBe(0)
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(97)
    expect(ticks.length).toBeGreaterThan(1)
  })

  it('最大值非正数时回退到 0-1', () => {
    expect(niceTicks(0)).toEqual([0, 1])
    expect(niceTicks(-5)).toEqual([0, 1])
    expect(niceTicks(Number.NaN)).toEqual([0, 1])
  })

  it('折线路径以 M 开头，单点时只有一段', () => {
    expect(linePath([])).toBe('')
    expect(linePath([{ x: 10, y: 20 }])).toBe('M 10 20')
    expect(
      linePath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        false,
      ),
    ).toBe('M 0 0 L 10 10')
  })

  it('平滑与非平滑产生不同路径', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ]

    expect(linePath(points, true)).toContain('C')
    expect(linePath(points, false)).not.toContain('C')
  })

  it('面积路径闭合到基线', () => {
    const path = areaPath(
      [
        { x: 0, y: 10 },
        { x: 10, y: 5 },
      ],
      40,
    )

    expect(path.endsWith('Z')).toBe(true)
    expect(path).toContain('L 10 40')
    expect(path).toContain('L 0 40')
  })

  it('实心扇形与环形路径不同，且都闭合', () => {
    const slice = arcPath(50, 50, 40, 0, 0, Math.PI / 2)
    const ring = arcPath(50, 50, 40, 20, 0, Math.PI / 2)

    expect(slice.startsWith('M 50 50')).toBe(true)
    expect(ring).not.toBe(slice)
    expect(ring.endsWith('Z')).toBe(true)
  })

  it('刻度文字过千折算 k', () => {
    expect(formatTick(120)).toBe('120')
    expect(formatTick(1200)).toBe('1.2k')
    expect(formatTick(12000)).toBe('12k')
  })

  it('clamp 夹取区间', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
    expect(clamp(5, 0, 10)).toBe(5)
  })
})

describe('SrChart', () => {
  it('柱状图按「分类 × 系列」渲染柱子', () => {
    const wrapper = mount(SrChart, {
      props: {
        type: 'bar',
        categories: ['一月', '二月'],
        series: [{ name: '收入', data: [10, 20] }],
      },
    })

    expect(wrapper.findAll('.sr-chart__bar')).toHaveLength(2)
  })

  it('折线图渲染一条线，面积图填充区域', () => {
    const line = mount(SrChart, {
      props: {
        categories: ['一', '二', '三'],
        series: [{ name: '访问量', data: [1, 2, 3] }],
      },
    })
    expect(line.findAll('.sr-chart__line')).toHaveLength(1)
    expect(line.findAll('.sr-chart__area')).toHaveLength(0)

    const area = mount(SrChart, {
      props: {
        type: 'area',
        categories: ['一', '二', '三'],
        series: [{ name: '访问量', data: [1, 2, 3] }],
      },
    })
    expect(area.findAll('.sr-chart__area')).toHaveLength(1)
  })

  it('饼图按数据项渲染扇区，图例显示分类名', () => {
    const wrapper = mount(SrChart, {
      props: {
        type: 'pie',
        categories: ['直接访问', '搜索引擎'],
        series: [{ name: '来源', data: [60, 40] }],
      },
    })

    expect(wrapper.findAll('.sr-chart__slice')).toHaveLength(2)
    expect(wrapper.find('.sr-chart__legend').text()).toContain('直接访问')
  })

  it('无数据时显示空态，不渲染图形', () => {
    const wrapper = mount(SrChart, { props: { series: [] } })

    expect(wrapper.find('.sr-chart__empty').text()).toBe('暂无数据')
    expect(wrapper.findAll('.sr-chart__line')).toHaveLength(0)
  })

  it('关闭图例后不渲染图例', () => {
    const wrapper = mount(SrChart, {
      props: {
        categories: ['一'],
        series: [{ name: 'A', data: [1] }],
        showLegend: false,
      },
    })

    expect(wrapper.find('.sr-chart__legend').exists()).toBe(false)
  })
})
