import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import SrImage from '../index'

/**
 * 挂载图片
 * @param props 组件 props
 * @returns 包装器
 */
function mountImage(props: Record<string, unknown> = {}) {
  return mount(SrImage, {
    props: { src: 'https://example.com/a.png', alt: '示例图', ...props },
    attachTo: document.body,
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrImage', () => {
  it('渲染 img 与 alt', () => {
    const wrapper = mountImage()

    const img = wrapper.find('.sr-image__media')
    expect(img.attributes('src')).toBe('https://example.com/a.png')
    expect(img.attributes('alt')).toBe('示例图')
    wrapper.unmount()
  })

  it('数字尺寸按像素处理', () => {
    const wrapper = mountImage({ width: 120, height: 80 })

    expect(wrapper.find('.sr-image').attributes('style')).toContain('120px')
    expect(wrapper.find('.sr-image').attributes('style')).toContain('80px')
    wrapper.unmount()
  })

  it('字符串尺寸原样输出', () => {
    const wrapper = mountImage({ width: '50%' })
    expect(wrapper.find('.sr-image').attributes('style')).toContain('50%')
    wrapper.unmount()
  })

  it('圆角转成 px', () => {
    const wrapper = mountImage({ radius: 8 })
    expect(wrapper.find('.sr-image').attributes('style')).toContain('border-radius: 8px')
    wrapper.unmount()
  })

  it('fit 作用在 img 上', () => {
    const wrapper = mountImage({ fit: 'contain' })
    expect(wrapper.find('.sr-image__media').attributes('style')).toContain('contain')
    wrapper.unmount()
  })

  it('加载成功后派发 load', async () => {
    const wrapper = mountImage()

    await wrapper.find('.sr-image__media').trigger('load')

    expect(wrapper.emitted('load')).toBeTruthy()
    expect(wrapper.find('.sr-image').classes()).toContain('sr-image--loaded')
    wrapper.unmount()
  })

  it('加载失败派发 error 并显示占位', async () => {
    const wrapper = mountImage()

    await wrapper.find('.sr-image__media').trigger('error')
    await nextTick()

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.find('.sr-image').classes()).toContain('sr-image--error')
    expect(wrapper.find('.sr-image__error').exists()).toBe(true)
    // 失败后不再保留图片节点
    expect(wrapper.find('.sr-image__media').exists()).toBe(false)
    wrapper.unmount()
  })

  it('失败时优先用兜底图', async () => {
    const wrapper = mountImage({ fallback: 'https://example.com/fallback.png' })

    await wrapper.find('.sr-image__media').trigger('error')
    await nextTick()

    const fallback = wrapper.find('.sr-image__media--fallback')
    expect(fallback.exists()).toBe(true)
    expect(fallback.attributes('src')).toBe('https://example.com/fallback.png')
    wrapper.unmount()
  })

  it('没有 src 直接进入失败态', async () => {
    const wrapper = mountImage({ src: '' })
    await nextTick()

    expect(wrapper.find('.sr-image').classes()).toContain('sr-image--error')
    wrapper.unmount()
  })

  it('预览：加载完成后才能点开', async () => {
    const wrapper = mountImage({ preview: true })
    const root = wrapper.find('.sr-image')

    // 未加载完，点击无效
    await root.trigger('click')
    expect(document.querySelector('.sr-image-preview')).toBeNull()

    await wrapper.find('.sr-image__media').trigger('load')
    await nextTick()
    await root.trigger('click')
    await nextTick()

    expect(document.querySelector('.sr-image-preview')).not.toBeNull()
    expect(wrapper.emitted('preview-change')?.[0]).toEqual([true])
    wrapper.unmount()
  })

  it('预览：点遮罩关闭', async () => {
    const wrapper = mountImage({ preview: true })
    await wrapper.find('.sr-image__media').trigger('load')
    await wrapper.find('.sr-image').trigger('click')
    await nextTick()

    const overlay = document.querySelector('.sr-image-preview') as HTMLElement
    overlay.click()
    await nextTick()

    expect(document.querySelector('.sr-image-preview')).toBeNull()
    expect(wrapper.emitted('preview-change')?.[1]).toEqual([false])
    wrapper.unmount()
  })

  it('预览：Esc 关闭', async () => {
    const wrapper = mountImage({ preview: true })
    await wrapper.find('.sr-image__media').trigger('load')
    await wrapper.find('.sr-image').trigger('click')
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(document.querySelector('.sr-image-preview')).toBeNull()
    wrapper.unmount()
  })

  it('不传 preview 时不可点击放大', async () => {
    const wrapper = mountImage()
    await wrapper.find('.sr-image__media').trigger('load')

    expect(wrapper.find('.sr-image').classes()).not.toContain('is-previewable')
    wrapper.unmount()
  })

  it('懒加载：没有观察器时直接加载', async () => {
    const wrapper = mountImage({ lazy: true })
    await nextTick()

    // jsdom 没有 IntersectionObserver，应回退为立即加载
    expect(wrapper.find('.sr-image__media').attributes('src')).toBe('https://example.com/a.png')
    wrapper.unmount()
  })

  it('懒加载：进入视口后才请求', async () => {
    const observe = vi.fn()
    const disconnect = vi.fn()
    let callback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null

    class FakeObserver {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        callback = cb
      }

      observe = observe
      disconnect = disconnect
    }

    const original = globalThis.IntersectionObserver
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).IntersectionObserver = FakeObserver

    const wrapper = mountImage({ lazy: true })
    await nextTick()

    // 还没进视口，不渲染 img
    expect(wrapper.find('.sr-image__media').exists()).toBe(false)
    expect(observe).toHaveBeenCalled()

    // TS 看不到构造函数里的赋值，这里显式断言
    const fire = callback as ((entries: Array<{ isIntersecting: boolean }>) => void) | null
    fire?.([{ isIntersecting: true }])
    await nextTick()
    await nextTick()

    expect(wrapper.find('.sr-image__media').exists()).toBe(true)
    expect(disconnect).toHaveBeenCalled()

    wrapper.unmount()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).IntersectionObserver = original
  })
})
