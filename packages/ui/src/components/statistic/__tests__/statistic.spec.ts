import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrStatistic from '../index'

describe('SrStatistic', () => {
  it('渲染标题与数值', () => {
    const wrapper = mount(SrStatistic, { props: { title: '总用户', value: 1280 } })

    expect(wrapper.find('.sr-statistic__title').text()).toBe('总用户')
    expect(wrapper.find('.sr-statistic__number').text()).toBe('1,280')
    wrapper.unmount()
  })

  it('整数默认加千分位', () => {
    const wrapper = mount(SrStatistic, { props: { value: 1234567 } })
    expect(wrapper.find('.sr-statistic__number').text()).toBe('1,234,567')
    wrapper.unmount()
  })

  it('separator 传空字符串关闭分组', () => {
    const wrapper = mount(SrStatistic, { props: { value: 1234567, separator: '' } })
    expect(wrapper.find('.sr-statistic__number').text()).toBe('1234567')
    wrapper.unmount()
  })

  it('自定义分隔符', () => {
    const wrapper = mount(SrStatistic, { props: { value: 1234567, separator: ' ' } })
    expect(wrapper.find('.sr-statistic__number').text()).toBe('1 234 567')
    wrapper.unmount()
  })

  it('precision 控制小数位', () => {
    const wrapper = mount(SrStatistic, { props: { value: 3.14159, precision: 2 } })
    expect(wrapper.find('.sr-statistic__number').text()).toBe('3.14')
    wrapper.unmount()
  })

  it('小数部分也保留千分位', () => {
    const wrapper = mount(SrStatistic, { props: { value: 1234.5, precision: 1 } })
    expect(wrapper.find('.sr-statistic__number').text()).toBe('1,234.5')
    wrapper.unmount()
  })

  it('负数正确分组', () => {
    const wrapper = mount(SrStatistic, { props: { value: -1234 } })
    expect(wrapper.find('.sr-statistic__number').text()).toBe('-1,234')
    wrapper.unmount()
  })

  it('前缀与后缀', () => {
    const wrapper = mount(SrStatistic, { props: { value: 99, prefix: '¥', suffix: '元' } })

    const affixes = wrapper.findAll('.sr-statistic__affix')
    expect(affixes[0]?.text()).toBe('¥')
    expect(affixes[1]?.text()).toBe('元')
    wrapper.unmount()
  })

  it('formatter 接管显示', () => {
    const wrapper = mount(SrStatistic, {
      props: { value: 0.856, precision: 0, formatter: (v: number) => `${(v * 100).toFixed(1)}%` },
    })

    expect(wrapper.find('.sr-statistic__number').text()).toBe('85.6%')
    wrapper.unmount()
  })

  it('loading 时显示占位不显示数字', () => {
    const wrapper = mount(SrStatistic, { props: { value: 100, loading: true } })

    expect(wrapper.find('.sr-statistic__skeleton').exists()).toBe(true)
    expect(wrapper.find('.sr-statistic__number').exists()).toBe(false)
    wrapper.unmount()
  })

  it('valueColor 作用在数值上', () => {
    const wrapper = mount(SrStatistic, { props: { value: 1, valueColor: '#d64545' } })
    expect(wrapper.find('.sr-statistic__value').attributes('style')).toContain('rgb(214, 69, 69)')
    wrapper.unmount()
  })
})
