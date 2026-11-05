import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import { SrTransition } from '..'

/**
 * 挂载 SrTransition（关闭 VTU 对内置 Transition 的 stub）
 * @param props 组件 props
 * @returns 包装器
 */
function mountTransition(props: Record<string, unknown>) {
  return mount(SrTransition, {
    props,
    slots: { default: () => h('div', { class: 'child' }, '内容') },
    // VTU 默认会把 Transition stub 成 <transition-stub>，关掉才能验证真实渲染
    global: { stubs: { transition: false } },
  })
}

describe('SrTransition', () => {
  it('渲染插槽内容且不产生多余包裹元素', () => {
    const wrapper = mountTransition({ name: 'fade' })

    expect(wrapper.find('.child').exists()).toBe(true)
    // Transition 不渲染自身标签，DOM 里只有插槽内容
    expect(wrapper.html()).toBe('<div class="child">内容</div>')
  })

  it('appear 时首次渲染带进场类（sr- 前缀）', () => {
    const wrapper = mountTransition({ name: 'fade-up', appear: true })
    const html = wrapper.html()

    expect(html).toContain('sr-fade-up-enter-active')
    expect(html).toContain('sr-fade-up-enter-from')
  })

  it('enabled 为 false 时不加任何过渡类', () => {
    const wrapper = mountTransition({ name: 'fade', appear: true, enabled: false })
    const html = wrapper.html()

    expect(html).not.toContain('sr-fade-enter-active')
    expect(wrapper.find('.child').exists()).toBe(true)
  })

  it('不同过渡名生成对应类前缀', () => {
    expect(mountTransition({ name: 'zoom', appear: true }).html()).toContain('sr-zoom-enter-active')
    expect(mountTransition({ name: 'list', appear: true }).html()).toContain('sr-list-enter-active')
    expect(mountTransition({ name: 'collapse', appear: true }).html()).toContain('sr-collapse-enter-active')
  })

  it('默认使用 fade', () => {
    const wrapper = mountTransition({ appear: true })
    expect(wrapper.html()).toContain('sr-fade-enter-active')
  })
})
