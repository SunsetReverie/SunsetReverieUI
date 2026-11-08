import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrSkeleton from '../index'

describe('SrSkeleton', () => {
  it('默认渲染骨架', () => {
    const wrapper = mount(SrSkeleton)

    expect(wrapper.find('.sr-skeleton').exists()).toBe(true)
    expect(wrapper.find('.sr-skeleton__title').exists()).toBe(true)
    wrapper.unmount()
  })

  it('rows 控制段落条数', () => {
    const wrapper = mount(SrSkeleton, { props: { rows: 5 } })
    expect(wrapper.findAll('.sr-skeleton__row')).toHaveLength(5)
    wrapper.unmount()
  })

  it('rows 为 0 时不渲染段落', () => {
    const wrapper = mount(SrSkeleton, { props: { rows: 0 } })

    expect(wrapper.findAll('.sr-skeleton__row')).toHaveLength(0)
    // 标题仍在
    expect(wrapper.find('.sr-skeleton__title').exists()).toBe(true)
    wrapper.unmount()
  })

  it('title 可关闭', () => {
    const wrapper = mount(SrSkeleton, { props: { title: false } })
    expect(wrapper.find('.sr-skeleton__title').exists()).toBe(false)
    wrapper.unmount()
  })

  it('avatar 开启时渲染头像块', () => {
    const wrapper = mount(SrSkeleton, { props: { avatar: true } })
    expect(wrapper.find('.sr-skeleton__avatar').exists()).toBe(true)
    wrapper.unmount()
  })

  it('round 只影响头像圆角', () => {
    const wrapper = mount(SrSkeleton, { props: { avatar: true, round: true } })

    expect(wrapper.classes()).toContain('is-round')
    wrapper.unmount()
  })

  it('animated 关闭时不带动画类名', () => {
    const wrapper = mount(SrSkeleton, { props: { animated: false } })

    expect(wrapper.classes()).not.toContain('is-animated')
    wrapper.unmount()
  })

  it('loading 为 false 时渲染插槽内容', () => {
    const wrapper = mount(SrSkeleton, {
      props: { loading: false },
      slots: { default: () => h('p', { class: 'real' }, '真实内容') },
    })

    expect(wrapper.find('.sr-skeleton').exists()).toBe(false)
    expect(wrapper.find('.real').text()).toBe('真实内容')
    wrapper.unmount()
  })

  it('尺寸档位生成对应类名', () => {
    const wrapper = mount(SrSkeleton, { props: { size: 'lg' } })

    expect(wrapper.classes()).toContain('sr-skeleton--lg')
    wrapper.unmount()
  })

  it('带无障碍标记', () => {
    const wrapper = mount(SrSkeleton)
    const root = wrapper.find('.sr-skeleton')

    expect(root.attributes('role')).toBe('status')
    expect(root.attributes('aria-busy')).toBe('true')
    expect(root.text()).toContain('加载中')
    wrapper.unmount()
  })
})
