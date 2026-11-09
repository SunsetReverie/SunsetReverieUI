import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SrStatistic from '../index'

/**
 * 把 rAF 换成「一帧到终点」
 *
 * 真实 rAF 要等 16ms 一帧、1200ms 才滚完，测试里没法等。
 * 这里让回调立刻收到一个远超时长的绝对时间，progress 直接是 1。
 */
function stubFrame(): void {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(performance.now() + 999_999)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

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

  it('挂载时（未动画）就显示最终值，保证 SSR 一致', () => {
    const wrapper = mount(SrStatistic, { props: { value: 1280 } })
    expect(wrapper.find('.sr-statistic__number').text()).toBe('1,280')
    wrapper.unmount()
  })

  it('countUp 挂载后从 0 滚到目标值', async () => {
    stubFrame()
    const wrapper = mount(SrStatistic, { props: { value: 1280, countUp: true } })

    await nextTick()
    await nextTick()

    expect(wrapper.find('.sr-statistic__number').text()).toBe('1,280')
    wrapper.unmount()
  })

  it('duration 为 0 时直接到最终值', async () => {
    stubFrame()
    const wrapper = mount(SrStatistic, {
      props: { value: 500, countUp: true, duration: 0 },
    })

    await nextTick()
    expect(wrapper.find('.sr-statistic__number').text()).toBe('500')
    wrapper.unmount()
  })

  it('value 变化时滚动到新值', async () => {
    stubFrame()
    const wrapper = mount(SrStatistic, { props: { value: 100, countUp: true } })
    await nextTick()

    await wrapper.setProps({ value: 300 })
    await nextTick()
    await nextTick()

    expect(wrapper.find('.sr-statistic__number').text()).toBe('300')
    wrapper.unmount()
  })

  it('动画跟随 precision 与千分位', async () => {
    stubFrame()
    const wrapper = mount(SrStatistic, {
      props: { value: 1234.56, precision: 2, countUp: true },
    })

    await nextTick()
    await nextTick()

    expect(wrapper.find('.sr-statistic__number').text()).toBe('1,234.56')
    wrapper.unmount()
  })

  it('formatter 收到的是当前显示值', async () => {
    stubFrame()
    const formatter = vi.fn((v: number) => `${Math.round(v)}%`)
    const wrapper = mount(SrStatistic, { props: { value: 88, formatter, countUp: true } })

    await nextTick()
    await nextTick()

    // 每帧都会调 formatter，最后一次是目标值
    expect(formatter).toHaveBeenCalled()
    expect(formatter).toHaveBeenLastCalledWith(88)
    wrapper.unmount()
  })

  it('未开启 countUp 时 value 变化直接更新', async () => {
    const wrapper = mount(SrStatistic, { props: { value: 100 } })

    await wrapper.setProps({ value: 250 })
    await nextTick()

    expect(wrapper.find('.sr-statistic__number').text()).toBe('250')
    wrapper.unmount()
  })

  it('卸载时不会因未取消的动画报错', async () => {
    stubFrame()
    const wrapper = mount(SrStatistic, { props: { value: 999, countUp: true } })
    await nextTick()

    expect(() => wrapper.unmount()).not.toThrow()
  })

  it('valueColor 作用在数值上', () => {
    const wrapper = mount(SrStatistic, { props: { value: 1, valueColor: '#d64545' } })
    expect(wrapper.find('.sr-statistic__value').attributes('style')).toContain('rgb(214, 69, 69)')
    wrapper.unmount()
  })
})
