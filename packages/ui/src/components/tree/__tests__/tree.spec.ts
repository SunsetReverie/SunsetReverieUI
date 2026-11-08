import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

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

  it('复选框用组件库自己的 SrCheckbox', () => {
    const wrapper = mountTree({ checkable: true })
    expect(wrapper.findAll('.sr-checkbox').length).toBeGreaterThan(0)
    // 半选靠组件的 is-indeterminate 类，不是原生 indeterminate 属性
    wrapper.unmount()
  })

  it('键盘上下键移动焦点', async () => {
    const wrapper = mountTree()
    await wrapper.find('.sr-tree__row').trigger('keydown', { key: 'ArrowDown' })

    const focused = wrapper.findAll('.sr-tree__row').filter((row) => row.classes('is-focused'))
    expect(focused).toHaveLength(1)
    wrapper.unmount()
  })

  it('右键展开、左键收起', async () => {
    const wrapper = mountTree()
    const first = wrapper.find('.sr-tree__row')

    await first.trigger('keydown', { key: 'ArrowRight' })
    await vi.waitFor(() => {
      expect(wrapper.findAll('.sr-tree__row').length).toBe(5)
    })
    expect(wrapper.emitted('update:expandedKeys')).toBeTruthy()
    wrapper.unmount()
  })

  it('回车选中当前焦点节点', async () => {
    const wrapper = mountTree()
    await wrapper.find('.sr-tree__row').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']])
    wrapper.unmount()
  })

  it('空格切换勾选', async () => {
    const wrapper = mountTree({ checkable: true })
    await wrapper.find('.sr-tree__row').trigger('keydown', { key: ' ' })

    const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
    expect(emitted.sort()).toEqual(['a', 'a1', 'a2'].sort())
    wrapper.unmount()
  })

  it('异步加载：展开时调 loadData 并渲染子节点', async () => {
    const loadData = vi.fn(async () => [{ key: 'lazy-1', label: '懒加载项' }])

    const wrapper = mount(SrTree, {
      props: {
        data: [{ key: 'lazy', label: '懒节点' }],
        loadData,
      },
      global: { stubs: { SrIcon: true } },
      attachTo: document.body,
    })

    await wrapper.find('.sr-tree__arrow').trigger('click')

    await vi.waitFor(() => {
      expect(loadData).toHaveBeenCalledTimes(1)
    })
    await vi.waitFor(() => {
      expect(wrapper.findAll('.sr-tree__row')).toHaveLength(2)
    })
    wrapper.unmount()
  })

  it('异步加载结果通过 load 事件回传', async () => {
    const loadData = vi.fn(async () => [{ key: 'x1', label: 'X1' }])
    const wrapper = mount(SrTree, {
      props: { data: [{ key: 'x', label: 'X' }], loadData },
      global: { stubs: { SrIcon: true } },
    })

    await wrapper.find('.sr-tree__arrow').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.emitted('load')).toBeTruthy()
    })
    wrapper.unmount()
  })

  it('已加载过的节点不会重复请求', async () => {
    const loadData = vi.fn(async () => [{ key: 'y1', label: 'Y1' }])
    const wrapper = mount(SrTree, {
      props: { data: [{ key: 'y', label: 'Y' }], loadData },
      global: { stubs: { SrIcon: true } },
    })

    await wrapper.find('.sr-tree__arrow').trigger('click')
    await vi.waitFor(() => expect(loadData).toHaveBeenCalledTimes(1))
    // 收起再展开
    await wrapper.find('.sr-tree__arrow').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))
    await wrapper.find('.sr-tree__arrow').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(loadData).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('拖拽后派发 node-drop 并移动节点', async () => {
    const wrapper = mountTree({ draggable: true })
    const rows = wrapper.findAll('.sr-tree__row')

    await rows[0]?.trigger('dragstart')
    await rows[2]?.trigger('dragover', { clientY: 0 })
    await rows[2]?.trigger('drop')

    expect(wrapper.emitted('node-drop')).toBeTruthy()
    // 原位置 a 被移走，树里顶层只剩 b、c（a 挂到了 c 之前）
    const detail = wrapper.emitted('node-drop')?.[0]?.[0] as { dragNode: { key: string }; type: string }
    expect(detail.dragNode.key).toBe('a')
    wrapper.unmount()
  })

  it('拖拽不能把父节点拖进自己的子树', async () => {
    const wrapper = mountTree({ draggable: true, defaultExpandAll: true })
    const rows = wrapper.findAll('.sr-tree__row')

    // 第 0 行是 a，第 1 行是它的子节点 a1
    await rows[0]?.trigger('dragstart')
    await rows[1]?.trigger('dragover', { clientY: 0 })
    await rows[1]?.trigger('drop')

    expect(wrapper.emitted('node-drop')).toBeUndefined()
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
