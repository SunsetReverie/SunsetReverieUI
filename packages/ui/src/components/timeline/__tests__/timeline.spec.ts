import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrTimeline from '../index'

/** 演示节点 */
const items = [
  { content: '提交申请', timestamp: '11-08 10:24', type: 'primary' as const },
  { content: '初审通过', timestamp: '11-08 14:02', type: 'success' as const },
  { content: '复审中', timestamp: '11-08 16:30' },
  { content: '放款', timestamp: '待处理', hollow: true },
]

/**
 * 挂载时间轴
 * @param props 组件 props
 * @returns 包装器
 */
function mountTimeline(props: Record<string, unknown> = {}) {
  return mount(SrTimeline, {
    props: { items, ...props },
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrTimeline', () => {
  it('渲染所有节点', () => {
    const wrapper = mountTimeline()
    expect(wrapper.findAll('.sr-timeline__item')).toHaveLength(4)
    wrapper.unmount()
  })

  it('渲染内容与时间戳', () => {
    const wrapper = mountTimeline()
    const contents = wrapper.findAll('.sr-timeline__content')
    const times = wrapper.findAll('.sr-timeline__time')

    expect(contents[0]?.text()).toBe('提交申请')
    expect(times[0]?.text()).toBe('11-08 10:24')
    wrapper.unmount()
  })

  it('类型生成对应类名', () => {
    const wrapper = mountTimeline()
    const nodes = wrapper.findAll('.sr-timeline__item')

    expect(nodes[0]?.classes()).toContain('is-primary')
    expect(nodes[1]?.classes()).toContain('is-success')
    // 没指定 type 时是 default
    expect(nodes[2]?.classes()).toContain('is-default')
    wrapper.unmount()
  })

  it('hollow 生成空心类名', () => {
    const wrapper = mountTimeline()
    expect(wrapper.findAll('.sr-timeline__item')[3]?.classes()).toContain('is-hollow')
    wrapper.unmount()
  })

  it('reverse 颠倒顺序', () => {
    const wrapper = mountTimeline({ reverse: true })
    const contents = wrapper.findAll('.sr-timeline__content')

    expect(contents[0]?.text()).toBe('放款')
    expect(contents[3]?.text()).toBe('提交申请')
    wrapper.unmount()
  })

  it('reverse 后最后一项仍无连接线', () => {
    const wrapper = mountTimeline({ reverse: true })
    const nodes = wrapper.findAll('.sr-timeline__item')

    expect(nodes[3]?.classes()).toContain('is-last')
    wrapper.unmount()
  })

  it('mode 生成对应类名', () => {
    const right = mountTimeline()
    expect(right.classes()).toContain('sr-timeline--right')
    right.unmount()

    const left = mountTimeline({ mode: 'left' })
    expect(left.classes()).toContain('sr-timeline--left')
    left.unmount()
  })

  it('mode=left 时时间戳在左侧', () => {
    const wrapper = mountTimeline({ mode: 'left' })
    const first = wrapper.findAll('.sr-timeline__item')[0]

    expect(first?.find('.sr-timeline__time--left').exists()).toBe(true)
    wrapper.unmount()
  })

  it('mode=right 时时间戳在右侧', () => {
    const wrapper = mountTimeline()
    const first = wrapper.findAll('.sr-timeline__item')[0]

    expect(first?.find('.sr-timeline__time--left').exists()).toBe(false)
    wrapper.unmount()
  })

  it('最后一项没有连接线', () => {
    const wrapper = mountTimeline()
    const nodes = wrapper.findAll('.sr-timeline__item')

    expect(nodes[0]?.find('.sr-timeline__tail').exists()).toBe(true)
    expect(nodes[3]?.find('.sr-timeline__tail').exists()).toBe(false)
    wrapper.unmount()
  })

  it('自定义图标替换圆点内容', () => {
    const wrapper = mountTimeline({
      items: [{ content: '完成', icon: 'lucide:check' }],
    })

    expect(wrapper.find('.sr-timeline__node sr-icon-stub').exists()).toBe(true)
    wrapper.unmount()
  })

  it('content 插槽可自定义内容', () => {
    const wrapper = mount(SrTimeline, {
      props: { items: [{ content: '原始内容' }] },
      slots: {
        content: ({ item }: { item: { content: string } }) => h('strong', { class: 'custom' }, item.content),
      },
      global: { stubs: { SrIcon: true } },
    })

    expect(wrapper.find('.custom').text()).toBe('原始内容')
    wrapper.unmount()
  })

  it('空列表渲染空容器', () => {
    const wrapper = mount(SrTimeline, { props: { items: [] } })

    expect(wrapper.find('.sr-timeline').exists()).toBe(true)
    expect(wrapper.findAll('.sr-timeline__item')).toHaveLength(0)
    wrapper.unmount()
  })
})
