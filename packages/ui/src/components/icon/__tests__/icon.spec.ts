import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import { SrIcon } from '..'

describe('SrIcon', () => {
  it('数字尺寸转换为 px', () => {
    const wrapper = mount(SrIcon, { props: { name: 'mdi:home', size: 20 } })
    expect((wrapper.element as HTMLElement).style.fontSize).toBe('20px')
  })

  it('字符串尺寸原样透传', () => {
    const wrapper = mount(SrIcon, { props: { name: 'mdi:home', size: '1.5rem' } })
    expect((wrapper.element as HTMLElement).style.fontSize).toBe('1.5rem')
  })

  it('默认无 label 时视为装饰性图标', () => {
    const wrapper = mount(SrIcon, { props: { name: 'mdi:home' } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('传 label 时提供可访问名称', () => {
    const wrapper = mount(SrIcon, { props: { name: 'mdi:home', label: '首页' } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('首页')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
  })

  it('flip 生成对应 transform', () => {
    expect(
      (mount(SrIcon, { props: { name: 'mdi:home', flip: true } }).element as HTMLElement).style.transform,
    ).toBe('scaleX(-1)')

    expect(
      (mount(SrIcon, { props: { name: 'mdi:home', flip: 'vertical' } }).element as HTMLElement).style
        .transform,
    ).toBe('scaleY(-1)')

    expect(
      (mount(SrIcon, { props: { name: 'mdi:home', flip: 'both' } }).element as HTMLElement).style.transform,
    ).toBe('scaleX(-1) scaleY(-1)')
  })

  it('rotate 与 flip 可叠加', () => {
    const wrapper = mount(SrIcon, { props: { name: 'mdi:home', rotate: 90, flip: 'horizontal' } })
    expect((wrapper.element as HTMLElement).style.transform).toBe('scaleX(-1) rotate(90deg)')
  })

  it('spin 添加旋转类', () => {
    const wrapper = mount(SrIcon, { props: { name: 'mdi:loading', spin: true } })
    expect(wrapper.classes()).toContain('is-spin')
  })

  it('color 写入内联样式', () => {
    const wrapper = mount(SrIcon, { props: { name: 'mdi:home', color: '#ff7a45' } })
    expect((wrapper.element as HTMLElement).style.color).toBe('rgb(255, 122, 69)')
  })

  it('default 插槽可完全覆盖渲染', () => {
    const wrapper = mount(SrIcon, {
      props: { name: 'mdi:home' },
      slots: { default: () => h('i', { class: 'custom' }, 'X') },
    })

    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  it('空 name 时不渲染图标节点', () => {
    const wrapper = mount(SrIcon, { slots: { default: () => h('i', { class: 'custom' }) } })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })
})
