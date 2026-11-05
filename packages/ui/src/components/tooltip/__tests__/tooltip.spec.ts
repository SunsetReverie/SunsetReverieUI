import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import { SrTooltip } from '..'

/**
 * 挂载提示并 stub 掉 Teleport，便于在原位断言
 * @param props 组件 props
 * @returns 包装器
 */
function mountTooltip(props: Record<string, unknown> = {}) {
  return mount(SrTooltip, {
    props: { content: '提示内容', showDelay: 0, hideDelay: 0, ...props },
    slots: { default: () => h('button', { class: 'trigger' }, '触发') },
    global: { stubs: { teleport: true, transition: false } },
    attachTo: document.body,
  })
}

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('SrTooltip', () => {
  it('默认不可见，但内容已在 DOM 中（v-show）', () => {
    const wrapper = mountTooltip()
    const floating = wrapper.find('.sr-tooltip')

    expect(floating.exists()).toBe(true)
    expect(floating.isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('悬停后延迟显示', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ showDelay: 100 })

    await wrapper.find('.sr-tooltip__trigger').trigger('mouseenter')
    // 未到延迟时间仍不可见
    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(false)

    vi.advanceTimersByTime(120)
    await nextTick()

    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(true)

    wrapper.unmount()
  })

  it('移出后隐藏', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip()

    await wrapper.find('.sr-tooltip__trigger').trigger('mouseenter')
    vi.advanceTimersByTime(10)
    await nextTick()
    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(true)

    await wrapper.find('.sr-tooltip__trigger').trigger('mouseleave')
    vi.advanceTimersByTime(10)
    await nextTick()
    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('显示时给触发元素加 aria-describedby', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip()

    const trigger = wrapper.find('.sr-tooltip__trigger')
    expect(trigger.attributes('aria-describedby')).toBeUndefined()

    await trigger.trigger('mouseenter')
    vi.advanceTimersByTime(10)
    await nextTick()

    const describedBy = wrapper.find('.sr-tooltip__trigger').attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(wrapper.find('.sr-tooltip').attributes('id')).toBe(describedBy)

    wrapper.unmount()
  })

  it('浮层带 role="tooltip"', () => {
    const wrapper = mountTooltip()
    expect(wrapper.find('.sr-tooltip').attributes('role')).toBe('tooltip')
    wrapper.unmount()
  })

  it('Esc 立即隐藏', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip()

    await wrapper.find('.sr-tooltip__trigger').trigger('mouseenter')
    vi.advanceTimersByTime(10)
    await nextTick()
    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(true)

    await wrapper.find('.sr-tooltip__trigger').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('disabled 时悬停不显示', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ disabled: true })

    await wrapper.find('.sr-tooltip__trigger').trigger('mouseenter')
    vi.advanceTimersByTime(200)
    await nextTick()

    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('无内容时不显示', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ content: '' })

    await wrapper.find('.sr-tooltip__trigger').trigger('mouseenter')
    vi.advanceTimersByTime(200)
    await nextTick()

    expect(wrapper.find('.sr-tooltip').isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('方位生成对应类名', () => {
    const wrapper = mountTooltip({ placement: 'right-start' })
    expect(wrapper.find('.sr-tooltip').classes()).toContain('sr-tooltip--right-start')
    wrapper.unmount()
  })

  it('arrow 可关闭', () => {
    const withArrow = mountTooltip()
    expect(withArrow.find('.sr-tooltip__arrow').exists()).toBe(true)
    withArrow.unmount()

    const noArrow = mountTooltip({ arrow: false })
    expect(noArrow.find('.sr-tooltip__arrow').exists()).toBe(false)
    noArrow.unmount()
  })

  it('卸载后清理定时器与监听（不报错）', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip()

    await wrapper.find('.sr-tooltip__trigger').trigger('mouseenter')
    expect(() => wrapper.unmount()).not.toThrow()

    // 卸载后推进时间不应访问已销毁的组件状态
    expect(() => vi.advanceTimersByTime(500)).not.toThrow()
  })
})
