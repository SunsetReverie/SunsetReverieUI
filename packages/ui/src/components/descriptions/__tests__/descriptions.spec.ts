import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrDescriptions, { type SrDescriptionItem } from '../index'

/** 演示字段 */
const items = [
  { label: '姓名', value: '林深' },
  { label: '公司', value: '夕梦科技' },
  { label: '城市', value: '杭州' },
  { label: '地址', value: '西湖区文三路 100 号', span: 2 },
]

/**
 * 挂载描述列表
 * @param props 组件 props
 * @returns 包装器
 */
function mountDescriptions(props: Record<string, unknown> = {}) {
  return mount(SrDescriptions, { props: { items, ...props } })
}

describe('SrDescriptions', () => {
  it('渲染字段名与值', () => {
    const wrapper = mountDescriptions()
    const labels = wrapper.findAll('.sr-descriptions__label')
    const values = wrapper.findAll('.sr-descriptions__value')

    expect(labels).toHaveLength(4)
    expect(labels[0]?.text()).toBe('姓名')
    expect(values[0]?.text()).toBe('林深')
    wrapper.unmount()
  })

  it('没有值时显示占位破折号', () => {
    const wrapper = mount(SrDescriptions, {
      props: { items: [{ label: '备注' }] },
    })

    expect(wrapper.find('.sr-descriptions__value').text()).toBe('—')
    wrapper.unmount()
  })

  it('span 生成栅格跨度', () => {
    const wrapper = mountDescriptions()
    const cells = wrapper.findAll('.sr-descriptions__item')

    // 第 4 项 span=2
    expect(cells[3]?.attributes('style')).toContain('span 2')
    // 前 3 项没有 span
    expect(cells[0]?.attributes('style')).toBeUndefined()
    wrapper.unmount()
  })

  it('span 超过列数时被夹到列数', () => {
    const wrapper = mount(SrDescriptions, {
      props: { items: [{ label: '地址', value: 'x', span: 9 }], column: 2 },
    })

    expect(wrapper.find('.sr-descriptions__item').attributes('style')).toContain('span 2')
    wrapper.unmount()
  })

  it('column 写入 CSS 变量', () => {
    const wrapper = mountDescriptions({ column: 4 })

    expect(wrapper.attributes('style')).toContain('--sr-desc-column: 4')
    wrapper.unmount()
  })

  it('border 生成对应类名', () => {
    const wrapper = mountDescriptions({ border: true })
    expect(wrapper.classes()).toContain('is-bordered')
    wrapper.unmount()
  })

  it('direction 生成对应类名', () => {
    const horizontal = mountDescriptions()
    expect(horizontal.classes()).toContain('sr-descriptions--horizontal')
    horizontal.unmount()

    const vertical = mountDescriptions({ direction: 'vertical' })
    expect(vertical.classes()).toContain('sr-descriptions--vertical')
    vertical.unmount()
  })

  it('labelWidth 只在 horizontal 下生效', () => {
    const horizontal = mountDescriptions({ labelWidth: 80 })
    expect(horizontal.find('.sr-descriptions__label').attributes('style')).toContain('80px')
    horizontal.unmount()

    const vertical = mountDescriptions({ labelWidth: 80, direction: 'vertical' })
    expect(vertical.find('.sr-descriptions__label').attributes('style')).toBeUndefined()
    vertical.unmount()
  })

  it('labelWidth 支持字符串', () => {
    const wrapper = mountDescriptions({ labelWidth: '5em' })
    expect(wrapper.find('.sr-descriptions__label').attributes('style')).toContain('5em')
    wrapper.unmount()
  })

  it('有 title 时渲染头部', () => {
    const wrapper = mountDescriptions({ title: '用户信息' })

    expect(wrapper.find('.sr-descriptions__header').exists()).toBe(true)
    expect(wrapper.find('.sr-descriptions__title').text()).toBe('用户信息')
    wrapper.unmount()
  })

  it('没有 title 和 extra 时不渲染头部', () => {
    const wrapper = mountDescriptions()
    expect(wrapper.find('.sr-descriptions__header').exists()).toBe(false)
    wrapper.unmount()
  })

  it('extra 插槽渲染在右上角', () => {
    const wrapper = mount(SrDescriptions, {
      props: { items, title: '标题' },
      slots: { extra: () => h('button', { class: 'edit' }, '编辑') },
    })

    expect(wrapper.find('.sr-descriptions__extra .edit').exists()).toBe(true)
    wrapper.unmount()
  })

  it('value 插槽可自定义内容', () => {
    const wrapper = mount(SrDescriptions, {
      props: { items: [{ label: '状态', value: '正常' }] },
      slots: {
        value: ({ item }: { item: SrDescriptionItem }) => h('strong', { class: 'custom' }, item.value),
      },
    })

    expect(wrapper.find('.custom').text()).toBe('正常')
    wrapper.unmount()
  })

  it('label 插槽可自定义字段名', () => {
    const wrapper = mount(SrDescriptions, {
      props: { items: [{ label: '姓名', value: '林深' }] },
      slots: {
        label: ({ item }: { item: SrDescriptionItem }) => h('em', { class: 'custom-label' }, item.label),
      },
    })

    expect(wrapper.find('.custom-label').text()).toBe('姓名')
    wrapper.unmount()
  })

  it('尺寸生成对应类名', () => {
    const wrapper = mountDescriptions({ size: 'small' })
    expect(wrapper.classes()).toContain('sr-descriptions--small')
    wrapper.unmount()
  })

  it('空列表渲染空栅格', () => {
    const wrapper = mount(SrDescriptions, { props: { items: [] } })

    expect(wrapper.find('.sr-descriptions__body').exists()).toBe(true)
    expect(wrapper.findAll('.sr-descriptions__item')).toHaveLength(0)
    wrapper.unmount()
  })
})
