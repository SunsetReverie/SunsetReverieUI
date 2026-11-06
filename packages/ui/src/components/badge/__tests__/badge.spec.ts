import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrBadge } from '..'

describe('SrBadge', () => {
  it('渲染数值', () => {
    const wrapper = mount(SrBadge, { props: { value: 5 } })
    expect(wrapper.find('.sr-badge__sup').text()).toBe('5')
    wrapper.unmount()
  })

  it('超过 max 折叠成 max+', () => {
    const wrapper = mount(SrBadge, { props: { value: 120, max: 99 } })
    expect(wrapper.find('.sr-badge__sup').text()).toBe('99+')
    wrapper.unmount()
  })

  it('dot 模式不显示文字', () => {
    const wrapper = mount(SrBadge, { props: { dot: true } })
    const sup = wrapper.find('.sr-badge__sup')
    expect(sup.classes()).toContain('is-dot')
    expect(sup.text()).toBe('')
    wrapper.unmount()
  })

  it('值为 0 且未开 showZero 时不显示', () => {
    const zero = mount(SrBadge, { props: { value: 0 } })
    expect(zero.find('.sr-badge__sup').exists()).toBe(false)
    zero.unmount()

    const shown = mount(SrBadge, { props: { value: 0, showZero: true } })
    expect(shown.find('.sr-badge__sup').exists()).toBe(true)
    shown.unmount()
  })

  it('有默认插槽时不做独立渲染', () => {
    const wrapper = mount(SrBadge, { props: { value: 3 }, slots: { default: () => '内容' } })
    expect(wrapper.classes()).not.toContain('is-standalone')
    wrapper.unmount()
  })

  it('类型生成对应类名', () => {
    const wrapper = mount(SrBadge, { props: { value: 1, type: 'success' } })
    expect(wrapper.find('.sr-badge__sup').classes()).toContain('sr-badge--success')
    wrapper.unmount()
  })
})
