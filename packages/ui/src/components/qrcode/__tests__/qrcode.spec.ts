import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SrQRCode from '../index'

/**
 * 挂载二维码
 * @param props 组件 props
 * @returns 包装器
 */
function mountQr(props: Record<string, unknown> = {}) {
  return mount(SrQRCode, {
    props: { value: 'https://example.com', ...props },
    global: { stubs: { SrIcon: true } },
  })
}

describe('SrQRCode', () => {
  it('渲染 SVG 与码点路径', () => {
    const wrapper = mountQr()

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('path').attributes('d')).toBeTruthy()
    wrapper.unmount()
  })

  it('尺寸作用在容器与 SVG 上', () => {
    const wrapper = mountQr({ size: 200 })

    expect(wrapper.attributes('style')).toContain('200px')
    expect(wrapper.find('svg').attributes('width')).toBe('200')
    wrapper.unmount()
  })

  it('viewBox 含静区', () => {
    // 用 1 个字符，确保落在版本 1（21 个模块）
    const wrapper = mountQr({ value: 'A', margin: 4 })
    // viewBox 在 SVG 里区分大小写，attributes() 拿不到，直接读 DOM
    const viewBox = wrapper.find('svg').element.getAttribute('viewBox') ?? ''

    // 版本 1 是 21 模块 + 4×2 静区 = 29
    expect(viewBox).toBe('0 0 29 29')
    wrapper.unmount()
  })

  it('前景色与背景色生效', () => {
    const wrapper = mountQr({ color: '#3e3edc', backgroundColor: '#f5f5f5' })

    expect(wrapper.find('path').attributes('fill')).toBe('#3e3edc')
    expect(wrapper.find('rect').attributes('fill')).toBe('#f5f5f5')
    wrapper.unmount()
  })

  it('纠错等级影响版本', () => {
    const low = mountQr({ level: 'L' })
    const high = mountQr({ level: 'H' })

    const sizeOf = (w: ReturnType<typeof mountQr>): number => {
      const vb = w.find('svg').element.getAttribute('viewBox') ?? '0 0 0 0'
      return Number.parseInt(vb.split(' ')[2] ?? '0', 10)
    }

    // H 需要更大的版本装同样的内容
    expect(sizeOf(high)).toBeGreaterThanOrEqual(sizeOf(low))
    low.unmount()
    high.unmount()
  })

  it('空内容不渲染 SVG', () => {
    const wrapper = mountQr({ value: '' })

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.classes()).toContain('is-empty')
    wrapper.unmount()
  })

  it('loading 显示占位且不渲染码', () => {
    const wrapper = mountQr({ status: 'loading' })

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('.sr-qrcode__placeholder').exists()).toBe(true)
    wrapper.unmount()
  })

  it('expired 保留码点并加遮罩', () => {
    const wrapper = mountQr({ status: 'expired', expiredText: '已过期' })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.sr-qrcode__mask').text()).toContain('已过期')
    wrapper.unmount()
  })

  it('图标叠加层', () => {
    const wrapper = mountQr({ icon: 'lucide:heart', iconSize: 30 })

    const icon = wrapper.find('.sr-qrcode__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('style')).toContain('30px')
    wrapper.unmount()
  })

  it('不传图标时不渲染图标层', () => {
    const wrapper = mountQr()
    expect(wrapper.find('.sr-qrcode__icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('内容超长派发 error', () => {
    const wrapper = mountQr({ value: 'x'.repeat(300), level: 'H' })

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.find('svg').exists()).toBe(false)
    wrapper.unmount()
  })

  it('可访问性：role 与 aria-label', () => {
    const wrapper = mountQr({ value: 'hello' })

    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toContain('hello')
    wrapper.unmount()
  })

  it('失效时的 aria-label 用提示文案', () => {
    const wrapper = mountQr({ status: 'expired', expiredText: '二维码已失效' })

    expect(wrapper.attributes('aria-label')).toBe('二维码已失效')
    wrapper.unmount()
  })
})
