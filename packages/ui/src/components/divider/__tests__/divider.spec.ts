import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrDivider from '../index'

describe('SrDivider', () => {
  it('默认水平', () => {
    const wrapper = mount(SrDivider)

    expect(wrapper.classes()).toContain('sr-divider--horizontal')
    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal')
    wrapper.unmount()
  })

  it('垂直方向', () => {
    const wrapper = mount(SrDivider, { props: { direction: 'vertical' } })

    expect(wrapper.classes()).toContain('sr-divider--vertical')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
    wrapper.unmount()
  })

  it('虚线类名', () => {
    const wrapper = mount(SrDivider, { props: { dashed: true } })
    expect(wrapper.classes()).toContain('is-dashed')
    wrapper.unmount()
  })

  it('有内容时加 is-with-text', () => {
    const wrapper = mount(SrDivider, {
      slots: { default: () => h('span', '分组一') },
    })

    expect(wrapper.classes()).toContain('is-with-text')
    expect(wrapper.find('.sr-divider__text').text()).toBe('分组一')
    wrapper.unmount()
  })

  it('没有内容时不渲染文字节点', () => {
    const wrapper = mount(SrDivider)
    expect(wrapper.find('.sr-divider__text').exists()).toBe(false)
    wrapper.unmount()
  })

  it('文字位置生成对应类名', () => {
    for (const position of ['left', 'center', 'right'] as const) {
      const wrapper = mount(SrDivider, {
        props: { contentPosition: position },
        slots: { default: () => 'x' },
      })
      expect(wrapper.classes()).toContain(`sr-divider--text-${position}`)
      wrapper.unmount()
    }
  })

  it('垂直方向忽略文字位置', () => {
    const wrapper = mount(SrDivider, {
      props: { direction: 'vertical', contentPosition: 'left' },
      slots: { default: () => 'x' },
    })

    // 垂直时位置固定为 center
    expect(wrapper.classes()).toContain('sr-divider--text-center')
    wrapper.unmount()
  })
})
