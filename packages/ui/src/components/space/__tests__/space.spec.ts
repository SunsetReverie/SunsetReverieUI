import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import SrSpace from '../index'

/**
 * 挂载间距容器
 * @param props 组件 props
 * @returns 包装器
 */
function mountSpace(props: Record<string, unknown> = {}) {
  return mount(SrSpace, {
    props,
    slots: { default: () => [h('span', 'A'), h('span', 'B')] },
  })
}

describe('SrSpace', () => {
  it('默认横向排列', () => {
    const wrapper = mountSpace()

    expect(wrapper.classes()).toContain('sr-space--horizontal')
    expect(wrapper.findAll('span')).toHaveLength(2)
    wrapper.unmount()
  })

  it('纵向排列', () => {
    const wrapper = mountSpace({ direction: 'vertical' })
    expect(wrapper.classes()).toContain('sr-space--vertical')
    wrapper.unmount()
  })

  it('档位换算成像素', () => {
    const wrapper = mountSpace({ size: 'lg' })
    expect(wrapper.attributes('style')).toContain('gap: 16px')
    wrapper.unmount()
  })

  it('数字直接当像素', () => {
    const wrapper = mountSpace({ size: 24 })
    expect(wrapper.attributes('style')).toContain('gap: 24px')
    wrapper.unmount()
  })

  it('默认间距是 8px', () => {
    const wrapper = mountSpace()
    expect(wrapper.attributes('style')).toContain('gap: 8px')
    wrapper.unmount()
  })

  it('对齐方式映射到 align-items', () => {
    expect(mountSpace({ align: 'start' }).attributes('style')).toContain('flex-start')
    expect(mountSpace({ align: 'end' }).attributes('style')).toContain('flex-end')
    expect(mountSpace({ align: 'baseline' }).attributes('style')).toContain('baseline')
    expect(mountSpace({ align: 'center' }).attributes('style')).toContain('center')
  })

  it('换行类名', () => {
    const wrapper = mountSpace({ wrap: true })
    expect(wrapper.classes()).toContain('is-wrap')
    wrapper.unmount()
  })

  it('行内类名', () => {
    const wrapper = mountSpace({ inline: true })
    expect(wrapper.classes()).toContain('is-inline')
    wrapper.unmount()
  })

  it('未知档位回退到 8px', () => {
    const wrapper = mountSpace({ size: 'unknown' })
    expect(wrapper.attributes('style')).toContain('gap: 8px')
    wrapper.unmount()
  })
})
