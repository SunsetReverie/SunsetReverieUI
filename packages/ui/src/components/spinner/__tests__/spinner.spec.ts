import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrSpinner } from '..'

describe('SrSpinner', () => {
  it('档位映射为像素尺寸', () => {
    const wrapper = mount(SrSpinner, { props: { size: 'lg' } })
    expect((wrapper.element as HTMLElement).style.width).toBe('28px')
    expect((wrapper.element as HTMLElement).style.height).toBe('28px')
  })

  it('数字尺寸直接按 px', () => {
    const wrapper = mount(SrSpinner, { props: { size: 32 } })
    expect((wrapper.element as HTMLElement).style.width).toBe('32px')
  })

  it('默认无 label 时视为装饰性', () => {
    const wrapper = mount(SrSpinner)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('传 label 时提供可访问名称', () => {
    const wrapper = mount(SrSpinner, { props: { label: '加载中' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-label')).toBe('加载中')
  })

  it('color 写入内联样式', () => {
    const wrapper = mount(SrSpinner, { props: { color: '#ff0000' } })
    expect((wrapper.element as HTMLElement).style.color).toBe('rgb(255, 0, 0)')
  })

  it('strokeWidth 传到两段圆环', () => {
    const wrapper = mount(SrSpinner, { props: { strokeWidth: 3 } })
    const circles = wrapper.findAll('circle')
    expect(circles).toHaveLength(2)
    for (const circle of circles) {
      expect(circle.attributes('stroke-width')).toBe('3')
    }
  })
})
