import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SrLoading from '../index'

describe('SrLoading', () => {
  it('默认显示转圈', () => {
    const wrapper = mount(SrLoading, { global: { stubs: { SrSpinner: true } } })

    expect(wrapper.find('.sr-loading--inline').exists()).toBe(true)
    wrapper.unmount()
  })

  it('loading=false 不渲染', () => {
    const wrapper = mount(SrLoading, {
      props: { loading: false },
      global: { stubs: { SrSpinner: true } },
    })

    expect(wrapper.find('.sr-loading--inline').exists()).toBe(false)
    wrapper.unmount()
  })

  it('显示文案', () => {
    const wrapper = mount(SrLoading, {
      props: { text: '加载中…' },
      global: { stubs: { SrSpinner: true } },
    })

    expect(wrapper.find('.sr-loading__text').text()).toBe('加载中…')
    wrapper.unmount()
  })

  it('包裹内容时渲染遮罩', () => {
    const wrapper = mount(SrLoading, {
      props: { loading: true },
      slots: { default: () => '内容区域' },
      global: { stubs: { SrSpinner: true } },
    })

    expect(wrapper.find('.sr-loading--wrapper').exists()).toBe(true)
    expect(wrapper.text()).toContain('内容区域')
    expect(wrapper.find('.sr-loading__overlay').exists()).toBe(true)
    wrapper.unmount()
  })

  it('mask=false 时不加遮罩类', () => {
    const wrapper = mount(SrLoading, {
      props: { mask: false },
      slots: { default: () => 'x' },
      global: { stubs: { SrSpinner: true } },
    })

    expect(wrapper.find('.sr-loading__overlay').classes()).not.toContain('is-mask')
    wrapper.unmount()
  })

  it('fullscreen 渲染到 body 并锁定滚动', async () => {
    const wrapper = mount(SrLoading, {
      props: { fullscreen: true },
      global: { stubs: { SrSpinner: true } },
    })
    await nextTick()

    expect(document.querySelector('.sr-loading--fullscreen')).not.toBeNull()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('delay 内完成则不闪', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SrLoading, {
      props: { loading: false, delay: 200 },
      global: { stubs: { SrSpinner: true } },
    })

    await wrapper.setProps({ loading: true })
    // 还没到 200ms，不该出现
    expect(wrapper.find('.sr-loading--inline').exists()).toBe(false)

    vi.advanceTimersByTime(200)
    await nextTick()
    expect(wrapper.find('.sr-loading--inline').exists()).toBe(true)

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('delay 内关闭则不出现', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SrLoading, {
      props: { loading: false, delay: 300 },
      global: { stubs: { SrSpinner: true } },
    })

    await wrapper.setProps({ loading: true })
    await wrapper.setProps({ loading: false })
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(wrapper.find('.sr-loading--inline').exists()).toBe(false)
    vi.useRealTimers()
    wrapper.unmount()
  })
})
