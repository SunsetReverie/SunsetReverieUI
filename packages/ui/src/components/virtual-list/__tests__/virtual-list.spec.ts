import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrVirtualList from '../index'

/**
 * 生成测试数据
 * @param count 条数
 * @returns 数据
 */
function makeItems(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index)
}

/**
 * 挂载虚拟列表
 * @param props 组件 props
 * @param count 数据条数
 * @returns 包装器
 */
function mountList(props: Record<string, unknown> = {}, count = 1000) {
  return mount(SrVirtualList, {
    props: { items: makeItems(count), itemHeight: 32, height: 320, ...props },
    slots: {
      default: ({ item, index }: { item: unknown; index: number }) =>
        h('div', { class: 'row' }, `第 ${String(item)} 条 / index ${String(index)}`),
    },
  })
}

describe('SrVirtualList', () => {
  it('只渲染可视区附近的项', () => {
    const wrapper = mountList()

    // 320 / 32 = 10 屏 + 上下各 3 缓冲 ≈ 16 条
    const rows = wrapper.findAll('.row')
    expect(rows.length).toBeLessThan(20)
    expect(rows.length).toBeGreaterThan(10)
    wrapper.unmount()
  })

  it('容器高度与总高度正确', () => {
    const wrapper = mountList({}, 100)

    expect(wrapper.attributes('style')).toContain('height: 320px')
    expect(wrapper.find('.sr-virtual-list__phantom').attributes('style')).toContain('3200px')
    wrapper.unmount()
  })

  it('初始渲染从第一项开始', () => {
    const wrapper = mountList()
    expect(wrapper.findAll('.row')[0]?.text()).toContain('第 0 条')
    wrapper.unmount()
  })

  it('滚动后渲染段跟着变', async () => {
    const wrapper = mountList()

    const viewport = wrapper.find('.sr-virtual-list').element as HTMLElement
    viewport.scrollTop = 3200
    await wrapper.find('.sr-virtual-list').trigger('scroll')

    // 3200 / 32 = 100，减去 buffer 3 → 从 97 开始
    const first = wrapper.findAll('.row')[0]?.text() ?? ''
    expect(first).toContain('第 97 条')
    wrapper.unmount()
  })

  it('滚动段有正确的 translateY', async () => {
    const wrapper = mountList()

    const viewport = wrapper.find('.sr-virtual-list').element as HTMLElement
    viewport.scrollTop = 3200
    await wrapper.find('.sr-virtual-list').trigger('scroll')

    // 97 × 32 = 3104
    expect(wrapper.find('.sr-virtual-list__inner').attributes('style')).toContain('3104px')
    wrapper.unmount()
  })

  it('滚到底部不会渲染空段', async () => {
    const wrapper = mountList({}, 20)

    const viewport = wrapper.find('.sr-virtual-list').element as HTMLElement
    // 手动塞一个远大于内容高度的值：数据变少或滚动位置异常时会这样
    viewport.scrollTop = 99999
    await wrapper.find('.sr-virtual-list').trigger('scroll')

    const rows = wrapper.findAll('.row')
    // 起始下标被夹住，最后一项必须是真实数据而不是空白
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[rows.length - 1]?.text()).toContain('第 19 条')
    wrapper.unmount()
  })

  it('数据少时不产生多余 DOM', () => {
    const wrapper = mountList({}, 3)
    expect(wrapper.findAll('.row')).toHaveLength(3)
    wrapper.unmount()
  })

  it('itemKey 用于复用', () => {
    const wrapper = mount(SrVirtualList, {
      props: {
        items: [{ id: 'a' }, { id: 'b' }],
        itemHeight: 32,
        height: 320,
        itemKey: (item: unknown) => (item as { id: string }).id,
      },
      slots: {
        default: ({ item }: { item: unknown }) => h('div', { class: 'row' }, (item as { id: string }).id),
      },
    })

    expect(wrapper.findAll('.row').map((row) => row.text())).toEqual(['a', 'b'])
    wrapper.unmount()
  })

  it('scrollToIndex 滚到指定项', async () => {
    const wrapper = mountList()

    // 组件 expose 的方法
    wrapper.vm.scrollToIndex(50)
    await wrapper.vm.$nextTick()

    const viewport = wrapper.find('.sr-virtual-list').element as HTMLElement
    expect(viewport.scrollTop).toBe(1600)
    wrapper.unmount()
  })

  it('滚动派发 scroll 事件', async () => {
    const wrapper = mountList()

    const viewport = wrapper.find('.sr-virtual-list').element as HTMLElement
    viewport.scrollTop = 640
    await wrapper.find('.sr-virtual-list').trigger('scroll')

    expect(wrapper.emitted('scroll')?.[0]).toEqual([640])
    wrapper.unmount()
  })

  it('空数据渲染空容器', () => {
    const wrapper = mountList({}, 0)

    expect(wrapper.findAll('.row')).toHaveLength(0)
    expect(wrapper.find('.sr-virtual-list__phantom').attributes('style')).toContain('0px')
    wrapper.unmount()
  })
})
