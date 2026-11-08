import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrTransfer from '../index'

/** 演示数据 */
const data = [
  { value: 'a', label: '苹果' },
  { value: 'b', label: '香蕉' },
  { value: 'c', label: '樱桃', disabled: true },
  { value: 'd', label: '芒果' },
]

/**
 * 挂载穿梭框
 * @param props 组件 props
 * @returns 包装器
 */
function mountTransfer(props: Record<string, unknown> = {}) {
  return mount(SrTransfer, {
    props: { data, ...props },
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrTransfer', () => {
  it('默认全部在左侧', () => {
    const wrapper = mountTransfer()
    const panels = wrapper.findAll('.sr-transfer__panel')

    expect(panels[0]?.findAll('.sr-transfer__item')).toHaveLength(4)
    expect(panels[1]?.findAll('.sr-transfer__item')).toHaveLength(0)
    wrapper.unmount()
  })

  it('按 modelValue 分到右侧', () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'] })
    const panels = wrapper.findAll('.sr-transfer__panel')

    expect(panels[0]?.findAll('.sr-transfer__item')).toHaveLength(2)
    expect(panels[1]?.findAll('.sr-transfer__item')).toHaveLength(2)
    wrapper.unmount()
  })

  it('勾选后右移', async () => {
    const wrapper = mountTransfer()
    const leftItems = wrapper.findAll('.sr-transfer__panel')[0]?.findAll('.sr-transfer__item')

    await leftItems?.[0]?.find('input').trigger('change')
    await wrapper.findAll('.sr-transfer__btn')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']])
    expect(wrapper.emitted('change')?.[0]?.[1]).toBe('right')
    wrapper.unmount()
  })

  it('右移结果按 data 顺序', async () => {
    const wrapper = mountTransfer({ modelValue: ['d'] })

    // 先选 b 再选 a，结果仍应按数据顺序 a, b, d
    const leftItems = wrapper.findAll('.sr-transfer__panel')[0]?.findAll('.sr-transfer__item')
    await leftItems?.[0]?.find('input').trigger('change')
    await wrapper.findAll('.sr-transfer__btn')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'd']])
    wrapper.unmount()
  })

  it('勾选后左移', async () => {
    const wrapper = mountTransfer({ modelValue: ['a', 'b'] })
    const rightItems = wrapper.findAll('.sr-transfer__panel')[1]?.findAll('.sr-transfer__item')

    await rightItems?.[0]?.find('input').trigger('change')
    await wrapper.findAll('.sr-transfer__btn')[1]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])
    expect(wrapper.emitted('change')?.[0]?.[1]).toBe('left')
    wrapper.unmount()
  })

  it('没勾选时按钮禁用', () => {
    const wrapper = mountTransfer()
    const buttons = wrapper.findAll('.sr-transfer__btn')

    expect(buttons[0]?.attributes('disabled')).toBeDefined()
    expect(buttons[1]?.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('全选后可以右移', async () => {
    const wrapper = mountTransfer()
    const leftHeader = wrapper.findAll('.sr-transfer__panel')[0]?.find('.sr-transfer__header input')

    await leftHeader?.trigger('change')
    await wrapper.findAll('.sr-transfer__btn')[0]?.trigger('click')

    // c 是禁用的，不会被带上
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b', 'd']])
    wrapper.unmount()
  })

  it('禁用的项不会被移动', async () => {
    const wrapper = mountTransfer({ modelValue: [] })
    const leftItems = wrapper.findAll('.sr-transfer__panel')[0]?.findAll('.sr-transfer__item')

    // 第 3 项是禁用的「樱桃」
    await leftItems?.[2]?.find('input').trigger('change')
    await wrapper.findAll('.sr-transfer__btn')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('搜索过滤左侧列表', async () => {
    const wrapper = mountTransfer({ filterable: true })
    const input = wrapper.findAll('.sr-transfer__panel')[0]?.find('.sr-transfer__input')

    await input?.setValue('苹')

    const leftItems = wrapper.findAll('.sr-transfer__panel')[0]?.findAll('.sr-transfer__item')
    expect(leftItems).toHaveLength(1)
    expect(leftItems?.[0]?.text()).toContain('苹果')
    wrapper.unmount()
  })

  it('搜索无结果时显示空状态', async () => {
    const wrapper = mountTransfer({ filterable: true, emptyText: '没找到' })
    const input = wrapper.findAll('.sr-transfer__panel')[0]?.find('.sr-transfer__input')

    await input?.setValue('不存在')

    expect(wrapper.find('.sr-transfer__empty').text()).toBe('没找到')
    wrapper.unmount()
  })

  it('整体禁用时按钮不可用', () => {
    const wrapper = mountTransfer({ disabled: true, modelValue: ['a'] })

    expect(wrapper.find('.sr-transfer').classes()).toContain('is-disabled')
    wrapper.findAll('.sr-transfer__btn').forEach((btn) => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
    wrapper.unmount()
  })

  it('自定义标题', () => {
    const wrapper = mountTransfer({ titles: ['可选', '已选'] })
    const titles = wrapper.findAll('.sr-transfer__title')

    expect(titles[0]?.text()).toBe('可选')
    expect(titles[1]?.text()).toBe('已选')
    wrapper.unmount()
  })

  it('计数显示已勾选与总数', () => {
    const wrapper = mountTransfer({ modelValue: ['a'] })
    const counts = wrapper.findAll('.sr-transfer__count')

    expect(counts[0]?.text()).toBe('0 / 3')
    expect(counts[1]?.text()).toBe('0 / 1')
    wrapper.unmount()
  })

  it('列表高度可配置', () => {
    const wrapper = mountTransfer({ height: 400 })
    const list = wrapper.find('.sr-transfer__list')

    expect(list.attributes('style')).toContain('400px')
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mountTransfer({ size: 'small' })
    expect(wrapper.find('.sr-transfer').classes()).toContain('sr-transfer--small')
    wrapper.unmount()
  })
})
