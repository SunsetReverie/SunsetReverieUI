import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrChinaMap from '../index'
import {
  boundsOf,
  bubbleRadius,
  createProjection,
  gradeIndex,
  mercatorY,
  normalizeName,
  regionPath,
  SOUTH_SEA_ADCODE,
  type ChinaMapGeo,
} from '../src/china-map-utils'
import { CHINA_PROVINCES } from '../data/china-provinces'

describe('china-map-utils', () => {
  it('省名归一：短名、全名、多段后缀都能对上', () => {
    expect(normalizeName('广东')).toBe('广东')
    expect(normalizeName('广东省')).toBe('广东')
    expect(normalizeName('内蒙古自治区')).toBe('内蒙古')
    expect(normalizeName('广西壮族自治区')).toBe('广西')
    expect(normalizeName('新疆维吾尔自治区')).toBe('新疆')
    expect(normalizeName('香港特别行政区')).toBe('香港')
    expect(normalizeName('  北京市 ')).toBe('北京')
    expect(normalizeName('')).toBe('')
  })

  it('墨卡托 y 随纬度单调递增，且夹住极值', () => {
    expect(mercatorY(0)).toBeCloseTo(0, 6)
    expect(mercatorY(40)).toBeGreaterThan(mercatorY(20))
    expect(Number.isFinite(mercatorY(89))).toBe(true)
  })

  it('分级档位落在 0..steps-1，无数据为 -1', () => {
    expect(gradeIndex(0, 0, 100, 5)).toBe(0)
    expect(gradeIndex(99, 0, 100, 5)).toBe(4)
    expect(gradeIndex(100, 0, 100, 5)).toBe(4)
    expect(gradeIndex(Number.NaN, 0, 100, 5)).toBe(-1)
    // 最大值等于最小值时应取最高档，避免除零
    expect(gradeIndex(5, 5, 5, 5)).toBe(4)
  })

  it('气泡半径随数值增大，0 与负数不出圆', () => {
    expect(bubbleRadius(0, 100, 26)).toBe(0)
    expect(bubbleRadius(-1, 100, 26)).toBe(0)
    expect(bubbleRadius(100, 100, 26)).toBeGreaterThan(bubbleRadius(25, 100, 26))
  })

  it('包围盒可排除南海诸岛，投影把点落进画布', () => {
    const onlySouthSea = CHINA_PROVINCES.filter((item) => item.adcode === SOUTH_SEA_ADCODE)
    expect(onlySouthSea).toHaveLength(1)

    const mainBounds = boundsOf(CHINA_PROVINCES, SOUTH_SEA_ADCODE)
    expect(mainBounds).not.toBeNull()

    const project = createProjection(mainBounds!, { width: 600, height: 400, padding: 10 })
    const [x, y] = project(116.4, 39.9)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(600)
    expect(y).toBeGreaterThanOrEqual(0)
    expect(y).toBeLessThanOrEqual(400)
  })

  it('区域路径以 M 开头、以 Z 闭合', () => {
    const project = createProjection(boundsOf(CHINA_PROVINCES, SOUTH_SEA_ADCODE)!, {
      width: 600,
      height: 400,
      padding: 10,
    })
    const guangdong = CHINA_PROVINCES.find((item) => item.name === '广东') as ChinaMapGeo
    const path = regionPath(guangdong, project)

    expect(path.startsWith('M')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
    expect(path.length).toBeGreaterThan(50)
  })
})

describe('SrChinaMap', () => {
  it('渲染 34 个省级区域与南海诸岛小图', () => {
    const wrapper = mount(SrChinaMap, { props: { data: [{ name: '广东', value: 120 }] } })

    // 34 个省级行政区（南海诸岛单独画，不算在里面）+ 1 条小图路径
    expect(wrapper.findAll('.sr-china-map__region').length).toBe(CHINA_PROVINCES.length)
    expect(wrapper.find('.sr-china-map__south-sea').exists()).toBe(true)
  })

  it('悬停省份时提示显示归一后的数值', async () => {
    const wrapper = mount(SrChinaMap, {
      props: {
        data: [{ name: '广东省', value: 120 }],
      },
    })

    await wrapper.findAll('.sr-china-map__region').at(10)!.trigger('mousemove', {
      clientX: 100,
      clientY: 100,
    })

    const tip = wrapper.find('.sr-china-map__tooltip')
    expect(tip.exists()).toBe(true)
    expect(tip.text().length).toBeGreaterThan(0)
  })

  it('点击省份抛出 select 事件', async () => {
    const wrapper = mount(SrChinaMap, { props: { data: [{ name: '广东', value: 120 }] } })

    await wrapper.findAll('.sr-china-map__region').at(10)!.trigger('click')

    const events = wrapper.emitted('select')
    expect(events).toBeTruthy()
    expect(typeof (events![0] as [{ name: string }])[0].name).toBe('string')
  })

  it('气泡模式按有数据的省份打点', () => {
    const wrapper = mount(SrChinaMap, {
      props: {
        mode: 'bubble',
        data: [
          { name: '广东', value: 120 },
          { name: '北京', value: 80 },
        ],
      },
    })

    expect(wrapper.findAll('.sr-china-map__bubble')).toHaveLength(2)
  })

  it('无数据时显示空态但仍画出轮廓', () => {
    const wrapper = mount(SrChinaMap, { props: { data: [] } })

    expect(wrapper.find('.sr-china-map__empty').text()).toBe('暂无数据')
    expect(wrapper.findAll('.sr-china-map__region').length).toBe(CHINA_PROVINCES.length)
  })

  it('关闭标签后不渲染名称', () => {
    const wrapper = mount(SrChinaMap, {
      props: { data: [{ name: '广东', value: 1 }], showLabel: false },
    })

    expect(wrapper.find('.sr-china-map__labels').exists()).toBe(false)
  })
})
