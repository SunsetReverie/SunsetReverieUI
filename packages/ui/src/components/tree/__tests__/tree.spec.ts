import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrTree from '../index'
import type { SrTreeNode } from '../src/tree-utils'

/** 测试数据 */
const data: SrTreeNode[] = [
  {
    key: 'a',
    label: '设计',
    children: [
      { key: 'a1', label: 'Token' },
      { key: 'a2', label: '组件' },
    ],
  },
  { key: 'b', label: '工程', children: [{ key: 'b1', label: '构建' }] },
  { key: 'c', label: '关于' },
]

/**
 * 挂载
 * @param props 覆盖的 props
 * @returns 挂载结果
 */
function mountTree(props: Record<string, unknown> = {}) {
  return mount(SrTree, {
    props: { data, ...props },
    global: { stubs: { SrIcon: true, SrTreeNodeRow: false } },
    attachTo: document.body,
  })
}

describe('SrTree', () => {
  it('默认只渲染顶层节点', () => {
    const wrapper = mountTree()
    expect(wrapper.findAll('.sr-tree__row')).toHaveLength(3)
    wrapper.unmount()
  })

  it('defaultExpandAll 展开全部', () => {
    const wrapper = mountTree({ defaultExpandAll: true })
    // a, a1, a2, b, b1, c
    expect(wrapper.findAll('.sr-tree__row')).toHaveLength(6)
    wrapper.unmount()
  })

  it('点箭头展开子节点', async () => {
    const wrapper = mountTree()
    await wrapper.find('.sr-tree__arrow').trigger('click')

    expect(wrapper.findAll('.sr-tree__row')).toHaveLength(5)
    expect(wrapper.emitted('expand')).toBeTruthy()
    wrapper.unmount()
  })

  it('受控 expandedKeys 生效', () => {
    const wrapper = mountTree({ expandedKeys: ['b'] })
    expect(wrapper.findAll('.sr-tree__row')).toHaveLength(4)
    wrapper.unmount()
  })

  it('点文字选中并派发 v-model', async () => {
    const wrapper = mountTree()
    await wrapper.findAll('.sr-tree__label')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['c']])
    wrapper.unmount()
  })

  it('multiple=false 时只保留一个选中', async () => {
    const wrapper = mountTree({ multiple: false, modelValue: ['a'] })
    await wrapper.findAll('.sr-tree__label')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['c']])
    wrapper.unmount()
  })

  it('checkable 渲染复选框', () => {
    const wrapper = mountTree({ checkable: true })
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(3)
    wrapper.unmount()
  })

  it('勾选父节点连带子孙', async () => {
    const wrapper = mountTree({ checkable: true, defaultExpandAll: true })
    const box = wrapper.findAll('input[type="checkbox"]')[0]

    Object.defineProperty(box.element, 'checked', { value: true, configurable: true })
    await box.trigger('change')

    const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
    expect(emitted.sort()).toEqual(['a', 'a1', 'a2'].sort())
    wrapper.unmount()
  })

  it('半选状态的 checkbox 有 indeterminate', async () => {
    const wrapper = mountTree({ checkable: true, modelValue: ['a1'], defaultExpandAll: true })
    const boxes = wrapper.findAll('input[type="checkbox"]')

    // 第一个是 a（父节点），应为半选
    expect((boxes[0]?.element as HTMLInputElement).indeterminate).toBe(true)
    wrapper.unmount()
  })

  it('checkStrictly 时只改自己', async () => {
    const wrapper = mountTree({ checkable: true, checkStrictly: true, defaultExpandAll: true })
    const box = wrapper.findAll('input[type="checkbox"]')[0]

    Object.defineProperty(box.element, 'checked', { value: true, configurable: true })
    await box.trigger('change')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']])
    wrapper.unmount()
  })

  it('虚拟滚动只渲染可视区内的行', () => {
    const big: SrTreeNode[] = Array.from({ length: 500 }, (_, index) => ({
      key: `k${index}`,
      label: `节点 ${index}`,
    }))

    const wrapper = mount(SrTree, {
      props: { data: big, virtual: true, height: 320, itemHeight: 32 },
      global: { stubs: { SrIcon: true } },
      attachTo: document.body,
    })

    const rendered = wrapper.findAll('.sr-tree__row').length
    // 可视 10 行左右，加缓冲不会超过 20
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(20)
    wrapper.unmount()
  })

  it('禁用时点击无效', async () => {
    const wrapper = mountTree({ disabled: true })
    await wrapper.findAll('.sr-tree__label')[0]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('空数据渲染空状态', () => {
    const wrapper = mount(SrTree, {
      props: { data: [] },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.sr-tree__empty').text()).toBe('暂无数据')
    wrapper.unmount()
  })
})
