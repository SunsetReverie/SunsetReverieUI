import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import SrCalendar from '../index'

/**
 * 挂载日历
 * @param props 组件 props
 * @returns 包装器
 */
function mountCalendar(props: Record<string, unknown> = {}) {
  return mount(SrCalendar, {
    props: { modelValue: '2026-11-09', ...props },
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrCalendar', () => {
  it('渲染 42 个格子', () => {
    const wrapper = mountCalendar()
    expect(wrapper.findAll('.sr-calendar__cell')).toHaveLength(42)
    wrapper.unmount()
  })

  it('标题显示年月', () => {
    const wrapper = mountCalendar()
    expect(wrapper.find('.sr-calendar__title').text()).toBe('2026 年 11 月')
    wrapper.unmount()
  })

  it('渲染 7 个星期表头', () => {
    const wrapper = mountCalendar()
    expect(wrapper.findAll('.sr-calendar__weekday')).toHaveLength(7)
    wrapper.unmount()
  })

  it('选中日期带 is-selected', () => {
    const wrapper = mountCalendar()
    const selected = wrapper.findAll('.sr-calendar__cell.is-selected')

    expect(selected).toHaveLength(1)
    expect(selected[0]?.text()).toBe('9')
    wrapper.unmount()
  })

  it('非本月日期带 is-out', () => {
    const wrapper = mountCalendar()
    expect(wrapper.findAll('.sr-calendar__cell.is-out').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('点日期派发 update:modelValue 与 change', async () => {
    const wrapper = mountCalendar()

    const cell = wrapper.findAll('.sr-calendar__cell').find((c) => c.text() === '15')
    await cell?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-11-15'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['2026-11-15'])
    wrapper.unmount()
  })

  it('切到上一月', async () => {
    const wrapper = mountCalendar()

    await wrapper.find('.sr-calendar__nav').trigger('click')

    expect(wrapper.find('.sr-calendar__title').text()).toBe('2026 年 10 月')
    wrapper.unmount()
  })

  it('切到下一月', async () => {
    const wrapper = mountCalendar()

    await wrapper.findAll('.sr-calendar__nav')[1]?.trigger('click')

    expect(wrapper.find('.sr-calendar__title').text()).toBe('2026 年 12 月')
    wrapper.unmount()
  })

  it('跨年切换正确', async () => {
    const wrapper = mountCalendar({ modelValue: '2026-12-15' })

    await wrapper.findAll('.sr-calendar__nav')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.find('.sr-calendar__title').text()).toBe('2027 年 1 月')
    wrapper.unmount()
  })

  it('回到今天', async () => {
    const wrapper = mountCalendar()

    await wrapper.findAll('.sr-calendar__nav')[1]?.trigger('click')
    await wrapper.find('.sr-calendar__today').trigger('click')

    const now = new Date()
    expect(wrapper.find('.sr-calendar__title').text()).toBe(
      `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`,
    )
    wrapper.unmount()
  })

  it('showToday=false 隐藏今天按钮', () => {
    const wrapper = mountCalendar({ showToday: false })
    expect(wrapper.find('.sr-calendar__today').exists()).toBe(false)
    wrapper.unmount()
  })

  it('超出 min/max 的日期禁用', () => {
    const wrapper = mountCalendar({ min: '2026-11-10', max: '2026-11-20' })

    const cells = wrapper.findAll('.sr-calendar__cell')
    const before = cells.find((c) => c.text() === '9')
    const inside = cells.find((c) => c.text() === '15')

    // 9 号在 min 之前（也是选中项），应禁用
    expect(before?.classes()).toContain('is-disabled')
    expect(inside?.classes()).not.toContain('is-disabled')
    wrapper.unmount()
  })

  it('禁用的日期点了没反应', async () => {
    const wrapper = mountCalendar({ min: '2026-11-10' })

    const cell = wrapper.findAll('.sr-calendar__cell').find((c) => c.text() === '5')
    await cell?.trigger('click')

    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })

  it('marks 标记对应日期', () => {
    const wrapper = mountCalendar({ marks: ['2026-11-18', '2026-11-25'] })
    expect(wrapper.findAll('.sr-calendar__cell.is-marked')).toHaveLength(2)
    wrapper.unmount()
  })

  it('格子高度可配置', () => {
    const wrapper = mountCalendar({ cellHeight: 56 })
    expect(wrapper.find('.sr-calendar__cell').attributes('style')).toContain('56px')
    wrapper.unmount()
  })

  it('切换月份派发 month-change', async () => {
    const wrapper = mountCalendar()

    await wrapper.findAll('.sr-calendar__nav')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('month-change')?.at(-1)).toEqual([2026, 12])
    wrapper.unmount()
  })
})
