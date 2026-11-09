import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrSpinner } from '..'

describe('SrSpinner', () => {
  it('档位映射为像素尺寸', () => {
    const wrapper = mount(SrSpinner, { props: { size: 'lg' } })

    expect((wrapper.element as HTMLElement).style.width).toBe('28px')
    expect((wrapper.element as HTMLElement).style.height).toBe('28px')
    wrapper.unmount()
  })

  it('数字尺寸直接按 px', () => {
    const wrapper = mount(SrSpinner, { props: { size: 32 } })
    expect((wrapper.element as HTMLElement).style.width).toBe('32px')
    wrapper.unmount()
  })

  it('默认无 label 时视为装饰性', () => {
    const wrapper = mount(SrSpinner)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
    wrapper.unmount()
  })

  it('传 label 时提供可访问名称', () => {
    const wrapper = mount(SrSpinner, { props: { label: '加载中' } })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-label')).toBe('加载中')
    wrapper.unmount()
  })

  it('color 写入内联样式', () => {
    const wrapper = mount(SrSpinner, { props: { color: '#ff0000' } })
    expect((wrapper.element as HTMLElement).style.color).toBe('rgb(255, 0, 0)')
    wrapper.unmount()
  })

  it('strokeWidth 传到两段圆环', () => {
    const wrapper = mount(SrSpinner, { props: { strokeWidth: 3 } })

    const circles = wrapper.findAll('circle')
    expect(circles).toHaveLength(2)

    for (const circle of circles) {
      expect(circle.attributes('stroke-width')).toBe('3')
    }

    wrapper.unmount()
  })

  it('默认是 ring 变体', () => {
    const wrapper = mount(SrSpinner)

    expect(wrapper.classes()).toContain('sr-spinner--ring')
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
  })

  it('dots 渲染三个点', () => {
    const wrapper = mount(SrSpinner, { props: { variant: 'dots' } })

    expect(wrapper.classes()).toContain('sr-spinner--dots')
    expect(wrapper.findAll('.sr-spinner__dot')).toHaveLength(3)
    // 不是圆环变体就不该有 svg
    expect(wrapper.find('svg').exists()).toBe(false)
    wrapper.unmount()
  })

  it('bars 渲染四根条', () => {
    const wrapper = mount(SrSpinner, { props: { variant: 'bars' } })
    expect(wrapper.findAll('.sr-spinner__bar')).toHaveLength(4)
    wrapper.unmount()
  })

  it('pulse 渲染两圈', () => {
    const wrapper = mount(SrSpinner, { props: { variant: 'pulse' } })
    expect(wrapper.findAll('.sr-spinner__pulse')).toHaveLength(2)
    wrapper.unmount()
  })

  it('orbit 渲染轨道与旋转层', () => {
    const wrapper = mount(SrSpinner, { props: { variant: 'orbit' } })

    expect(wrapper.find('.sr-spinner__orbit-track').exists()).toBe(true)
    expect(wrapper.find('.sr-spinner__orbit-spin').exists()).toBe(true)
    wrapper.unmount()
  })

  it('gradient 渲染渐变环并换算描边', () => {
    const wrapper = mount(SrSpinner, { props: { variant: 'gradient', size: 40 } })

    const el = wrapper.find('.sr-spinner__gradient')
    expect(el.exists()).toBe(true)
    // 描边随尺寸换算，40px 时是 4px
    expect(el.attributes('style')).toContain('--sr-spinner-stroke: 4px')
    wrapper.unmount()
  })

  it('所有变体都保留无障碍属性', () => {
    const variants = ['ring', 'dots', 'pulse', 'bars', 'orbit', 'gradient'] as const

    for (const variant of variants) {
      const wrapper = mount(SrSpinner, { props: { variant, label: '加载中' } })

      expect(wrapper.attributes('role'), variant).toBe('status')
      expect(wrapper.attributes('aria-label'), variant).toBe('加载中')
      wrapper.unmount()
    }
  })

  it('无边距时变体类名与基础类名共存', () => {
    const wrapper = mount(SrSpinner, { props: { variant: 'bars' } })

    expect(wrapper.classes()).toContain('sr-spinner')
    expect(wrapper.classes()).toContain('sr-spinner--bars')
    wrapper.unmount()
  })
})
