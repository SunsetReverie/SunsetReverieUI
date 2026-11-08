import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SrDatePicker from '../index'

/**
 * 挂载日期选择器
 * @param props 覆盖的 props
 * @returns 挂载结果
 */
function mountPicker(props: Record<string, unknown> = {}) {
  return mount(SrDatePicker, {
    props,
    global: {
      // 面板用 Teleport 到 body，测试里直接内联渲染更好断言
      stubs: { teleport: true, SrIcon: true },
    },
    attachTo: document.body,
  })
}

describe('SrDatePicker', () => {
  it('默认不渲染快捷区', async () => {
    const wrapper = mountPicker()
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    expect(wrapper.find('.sr-date-picker__shortcuts').exists()).toBe(false)
    wrapper.unmount()
  })

  it('未选中时显示占位文案', () => {
    const wrapper = mountPicker()

    expect(wrapper.find('.sr-date-picker__placeholder').text()).toContain('选择日期')
    wrapper.unmount()
  })

  it('有值时显示格式化后的日期', () => {
    const wrapper = mountPicker({ modelValue: new Date(2026, 10, 8) })

    expect(wrapper.find('.sr-date-picker__value').text()).toBe('2026-11-08')
    wrapper.unmount()
  })

  it('点击触发器展开面板', async () => {
    const wrapper = mountPicker()

    expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(false)
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })
    wrapper.unmount()
  })

  it('选择日期后派发 v-model 并关闭', async () => {
    const wrapper = mountPicker({ modelValue: new Date(2026, 10, 8) })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    // 选中当月第 15 天
    const target = wrapper
      .findAll('.sr-date-picker__day')
      .find((btn) => btn.text() === '15' && !btn.classes('is-out'))
    await target?.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as Date
    expect(emitted.getDate()).toBe(15)
    wrapper.unmount()
  })

  it('区间模式点两次才提交', async () => {
    const wrapper = mountPicker({ type: 'daterange' })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    const days = wrapper.findAll('.sr-date-picker__day').filter((btn) => !btn.classes('is-out'))
    await days[4]?.trigger('click')
    // 第一次点只设起点，不派发
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('.sr-date-picker__hint').exists()).toBe(true)

    await days[9]?.trigger('click')
    const range = wrapper.emitted('update:modelValue')?.[0]?.[0] as [Date, Date]
    expect(range).toHaveLength(2)
    expect(range[0] <= range[1]).toBe(true)
    wrapper.unmount()
  })

  it('反向选择时自动交换起止', async () => {
    const wrapper = mountPicker({ type: 'daterange' })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    const days = wrapper.findAll('.sr-date-picker__day').filter((btn) => !btn.classes('is-out'))
    await days[12]?.trigger('click')
    await days[3]?.trigger('click')

    const range = wrapper.emitted('update:modelValue')?.[0]?.[0] as [Date, Date]
    expect(range[0].getDate()).toBeLessThan(range[1].getDate())
    wrapper.unmount()
  })

  it('快捷项一键填充区间', async () => {
    const wrapper = mountPicker({
      type: 'daterange',
      // 快捷区不是默认形态，需要显式传
      shortcuts: [
        {
          label: '近 7 天',
          value: () => {
            const today = new Date()
            return [new Date(today.getTime() - 6 * 86400000), today]
          },
        },
      ],
    })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    const shortcut = wrapper.findAll('.sr-date-picker__shortcut').find((btn) => btn.text() === '近 7 天')
    await shortcut?.trigger('click')

    const range = wrapper.emitted('update:modelValue')?.[0]?.[0] as [Date, Date]
    expect(range).toHaveLength(2)
    // 近 7 天跨度为 6 天
    const span = Math.round((range[1].getTime() - range[0].getTime()) / 86400000)
    expect(span).toBeGreaterThanOrEqual(6)
    wrapper.unmount()
  })

  it('disabledDate 让日期不可点', async () => {
    const wrapper = mountPicker({
      modelValue: new Date(2026, 10, 8),
      disabledDate: (date: Date) => date.getDate() === 15,
    })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    const target = wrapper
      .findAll('.sr-date-picker__day')
      .find((btn) => btn.text() === '15' && !btn.classes('is-out'))
    expect(target?.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('超出自定义范围时不显示清除按钮之外的内容', () => {
    const wrapper = mountPicker({
      modelValue: new Date(2026, 10, 8),
      min: new Date(2026, 10, 10),
    })

    // 值仍会显示，但面板里 8 号应该是禁用态（这里只验证渲染不报错）
    expect(wrapper.find('.sr-date-picker__value').text()).toBe('2026-11-08')
    wrapper.unmount()
  })

  it('清空会派发 null', async () => {
    const wrapper = mountPicker({ modelValue: new Date(2026, 10, 8) })

    await wrapper.find('.sr-date-picker__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    wrapper.unmount()
  })

  it('disabled 时不展开面板', async () => {
    const wrapper = mountPicker({ disabled: true })

    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(false)
    wrapper.unmount()
  })

  it('valueFormat 输出字符串', async () => {
    const wrapper = mountPicker({ modelValue: new Date(2026, 10, 8), valueFormat: 'YYYY/MM/DD' })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    const target = wrapper
      .findAll('.sr-date-picker__day')
      .find((btn) => btn.text() === '20' && !btn.classes('is-out'))
    await target?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('2026/11/20')
    wrapper.unmount()
  })

  it('时间可直接输入并提交', async () => {
    const wrapper = mountPicker({ type: 'datetime', modelValue: new Date(2026, 10, 8, 9, 30, 0) })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    const inputs = wrapper.findAll('.sr-date-picker__time-input')
    await inputs[0]?.setValue('15')
    await inputs[1]?.setValue('45')

    // 点确定提交，小时应是输入的 15
    await wrapper.find('.sr-date-picker__confirm').trigger('click')
    const value = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date
    expect(value.getHours()).toBe(15)
    expect(value.getMinutes()).toBe(45)
    wrapper.unmount()
  })

  it('showSeconds=false 时只有两个输入框', async () => {
    const wrapper = mountPicker({
      type: 'datetime',
      modelValue: new Date(2026, 10, 8, 9, 30),
      showSeconds: false,
    })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    expect(wrapper.findAll('.sr-date-picker__time-input')).toHaveLength(2)
    wrapper.unmount()
  })

  it('showSeconds=false 时显示格式不带秒', () => {
    const wrapper = mountPicker({
      type: 'datetime',
      modelValue: new Date(2026, 10, 8, 9, 30, 15),
      showSeconds: false,
    })

    expect(wrapper.find('.sr-date-picker__value').text()).toBe('2026-11-08 09:30')
    wrapper.unmount()
  })

  it('datetime 模式渲染时间选择区', async () => {
    const wrapper = mountPicker({ type: 'datetime', modelValue: new Date(2026, 10, 8, 9, 30) })
    await wrapper.find('.sr-date-picker__trigger').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.sr-date-picker__panel').exists()).toBe(true)
    })

    expect(wrapper.find('.sr-date-picker__time').exists()).toBe(true)
    // 时分秒三个输入框
    expect(wrapper.findAll('.sr-date-picker__time-input')).toHaveLength(3)
    wrapper.unmount()
  })
})
