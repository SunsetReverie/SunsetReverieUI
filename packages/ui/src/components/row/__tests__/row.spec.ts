import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrRow } from '..'

/**
 * 读取元素上的自定义属性
 * @param wrapper 挂载结果
 * @param name 变量名
 * @returns 变量值
 */
function cssVar(wrapper: ReturnType<typeof mount>, name: string): string {
  return wrapper.element.style.getPropertyValue(name)
}

describe('SrRow', () => {
  it('渲染默认结构', () => {
    const wrapper = mount(SrRow)
    expect(wrapper.classes()).toContain('sr-row')
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('单值 gutter 同时作用于水平与垂直', () => {
    const wrapper = mount(SrRow, { props: { gutter: 16 } })
    expect(cssVar(wrapper, '--sr-row-gutter-x-xs')).toBe('16px')
    expect(cssVar(wrapper, '--sr-row-gutter-y-xs')).toBe('16px')
  })

  it('数组 gutter 区分水平与垂直', () => {
    const wrapper = mount(SrRow, { props: { gutter: [24, 12] } })
    expect(cssVar(wrapper, '--sr-row-gutter-x-xs')).toBe('24px')
    expect(cssVar(wrapper, '--sr-row-gutter-y-xs')).toBe('12px')
  })

  it('响应式 gutter 展开为逐断点变量', () => {
    const wrapper = mount(SrRow, { props: { gutter: { xs: 8, md: [24, 16] } } })
    expect(cssVar(wrapper, '--sr-row-gutter-x-xs')).toBe('8px')
    expect(cssVar(wrapper, '--sr-row-gutter-x-md')).toBe('24px')
    expect(cssVar(wrapper, '--sr-row-gutter-y-md')).toBe('16px')
  })

  it('justify / align 映射为 flex 值', () => {
    const wrapper = mount(SrRow, { props: { justify: 'space-between', align: 'middle' } })
    expect(cssVar(wrapper, '--sr-row-justify')).toBe('space-between')
    expect(cssVar(wrapper, '--sr-row-align')).toBe('center')
  })

  it('wrap 为 false 时加 is-nowrap 类', () => {
    const wrapper = mount(SrRow, { props: { wrap: false } })
    expect(wrapper.classes()).toContain('is-nowrap')
  })

  it('透传 class 与原生属性', () => {
    const wrapper = mount(SrRow, { attrs: { class: 'my-row', id: 'row-1' } })
    expect(wrapper.classes()).toContain('my-row')
    expect(wrapper.attributes('id')).toBe('row-1')
  })
})
