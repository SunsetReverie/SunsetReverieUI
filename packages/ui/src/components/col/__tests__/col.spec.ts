import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { SrCol } from '..'

/**
 * 从元素的 style 属性中读取自定义属性
 * @param wrapper 挂载结果
 * @param name 变量名（含 -- 前缀）
 * @returns 变量值
 */
function cssVar(wrapper: ReturnType<typeof mount>, name: string): string {
  return wrapper.element.style.getPropertyValue(name)
}

describe('SrCol', () => {
  it('默认占满 24 栅格', () => {
    const wrapper = mount(SrCol)
    expect(wrapper.classes()).toContain('sr-col')
    expect(cssVar(wrapper, '--sr-col-span-xs')).toBe('24')
  })

  it('数字 span 只写 xs 变量', () => {
    const wrapper = mount(SrCol, { props: { span: 8 } })
    expect(cssVar(wrapper, '--sr-col-span-xs')).toBe('8')
    expect(cssVar(wrapper, '--sr-col-span-md')).toBe('')
  })

  it('响应式 span 展开为逐断点变量', () => {
    const wrapper = mount(SrCol, { props: { span: { xs: 24, md: 12, lg: 8 } } })
    expect(cssVar(wrapper, '--sr-col-span-xs')).toBe('24')
    expect(cssVar(wrapper, '--sr-col-span-md')).toBe('12')
    expect(cssVar(wrapper, '--sr-col-span-lg')).toBe('8')
  })

  it('offset / push / pull 同样支持响应式', () => {
    const wrapper = mount(SrCol, {
      props: { offset: 6, push: { xs: 0, lg: 4 }, pull: 2 },
    })
    expect(cssVar(wrapper, '--sr-col-offset-xs')).toBe('6')
    expect(cssVar(wrapper, '--sr-col-push-lg')).toBe('4')
    expect(cssVar(wrapper, '--sr-col-pull-xs')).toBe('2')
  })

  it('flex 覆盖固定宽度', () => {
    const wrapper = mount(SrCol, { props: { flex: 'auto' } })
    // CSSOM 会把 flex: auto 规范化为 1 1 auto，浏览器与 jsdom 行为一致
    expect(wrapper.element.style.flex).toBe('1 1 auto')
    expect(wrapper.element.style.width).toBe('auto')
  })

  it('tag 渲染为自定义标签', () => {
    const wrapper = mount(SrCol, { props: { tag: 'section' } })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('透传原生属性', () => {
    const wrapper = mount(SrCol, { attrs: { 'data-test': 'cell' } })
    expect(wrapper.attributes('data-test')).toBe('cell')
  })
})
