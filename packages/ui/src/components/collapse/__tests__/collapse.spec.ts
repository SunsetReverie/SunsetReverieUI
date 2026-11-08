import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrCollapse from '../index'

/** 演示面板 */
const items = [
  { key: 'a', title: '基础设置', content: '这是基础设置的内容' },
  { key: 'b', title: '高级设置', content: '这是高级设置的内容', extra: '3 项' },
  { key: 'c', title: '危险操作', content: '删除后无法恢复', disabled: true },
]

/**
 * 挂载折叠面板
 * @param props 组件 props
 * @returns 包装器
 */
function mountCollapse(props: Record<string, unknown> = {}) {
  return mount(SrCollapse, {
    props: { items, ...props },
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrCollapse', () => {
  it('渲染所有面板', () => {
    const wrapper = mountCollapse()
    expect(wrapper.findAll('.sr-collapse__item')).toHaveLength(3)
    wrapper.unmount()
  })

  it('默认全部收起', () => {
    const wrapper = mountCollapse()
    const items = wrapper.findAll('.sr-collapse__item')

    expect(items[0]?.classes()).not.toContain('is-active')
    wrapper.unmount()
  })

  it('modelValue 控制展开态', () => {
    const wrapper = mountCollapse({ modelValue: ['a'] })
    const items = wrapper.findAll('.sr-collapse__item')

    expect(items[0]?.classes()).toContain('is-active')
    expect(items[1]?.classes()).not.toContain('is-active')
    wrapper.unmount()
  })

  it('点击标题切换展开并派发事件', async () => {
    const wrapper = mountCollapse()

    await wrapper.findAll('.sr-collapse__title')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']])
    expect(wrapper.emitted('change')?.[0]).toEqual([['a'], 'a'])
    wrapper.unmount()
  })

  it('再次点击收起', async () => {
    const wrapper = mountCollapse({ modelValue: ['a'] })

    await wrapper.findAll('.sr-collapse__title')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
    wrapper.unmount()
  })

  it('多个面板可同时展开', async () => {
    const wrapper = mountCollapse({ modelValue: ['a'] })

    await wrapper.findAll('.sr-collapse__title')[1]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])
    wrapper.unmount()
  })

  it('手风琴模式只保留一个', async () => {
    const wrapper = mountCollapse({ modelValue: ['a'], accordion: true })

    await wrapper.findAll('.sr-collapse__title')[1]?.trigger('click')

    // 不会变成 ['a', 'b']，而是只剩 b
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])
    wrapper.unmount()
  })

  it('禁用的面板点击无效', async () => {
    const wrapper = mountCollapse()

    await wrapper.findAll('.sr-collapse__title')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('禁用的面板带 is-disabled 类名', () => {
    const wrapper = mountCollapse()
    expect(wrapper.findAll('.sr-collapse__item')[2]?.classes()).toContain('is-disabled')
    wrapper.unmount()
  })

  it('点击箭头也能切换', async () => {
    const wrapper = mountCollapse()

    await wrapper.findAll('.sr-collapse__arrow')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']])
    wrapper.unmount()
  })

  it('extra 文案渲染在右侧', () => {
    const wrapper = mountCollapse()
    expect(wrapper.findAll('.sr-collapse__extra')[0]?.text()).toBe('3 项')
    wrapper.unmount()
  })

  it('ghost 生成对应类名', () => {
    const wrapper = mountCollapse({ ghost: true })
    expect(wrapper.classes()).toContain('is-ghost')
    wrapper.unmount()
  })

  it('展开的面板带 aria-expanded', () => {
    const wrapper = mountCollapse({ modelValue: ['a'] })
    const headers = wrapper.findAll('.sr-collapse__header')

    expect(headers[0]?.attributes('aria-expanded')).toBe('true')
    expect(headers[1]?.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('item 插槽可自定义内容', () => {
    const wrapper = mount(SrCollapse, {
      props: { items: [{ key: 'x', title: '标题' }], modelValue: ['x'] },
      slots: {
        item: ({ item }: { item: { title: string } }) =>
          h('div', { class: 'custom-content' }, `${item.title} 的自定义内容`),
      },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.custom-content').text()).toBe('标题 的自定义内容')
    wrapper.unmount()
  })

  it('title 插槽可自定义标题', () => {
    const wrapper = mount(SrCollapse, {
      props: { items: [{ key: 'x', title: '标题' }] },
      slots: {
        title: ({ item }: { item: { title: string } }) => h('strong', { class: 'custom-title' }, item.title),
      },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.custom-title').text()).toBe('标题')
    wrapper.unmount()
  })

  it('空列表渲染空容器', () => {
    const wrapper = mount(SrCollapse, { props: { items: [] } })

    expect(wrapper.find('.sr-collapse').exists()).toBe(true)
    expect(wrapper.findAll('.sr-collapse__item')).toHaveLength(0)
    wrapper.unmount()
  })
})
