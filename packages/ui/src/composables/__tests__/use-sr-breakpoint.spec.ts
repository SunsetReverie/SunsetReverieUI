import { afterEach, describe, expect, it } from 'vitest'

import { useSrBreakpoint } from '../use-sr-breakpoint'

/**
 * 设置模拟视口宽度
 * @param width 像素宽度
 */
function setViewport(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

/**
 * 等待 rAF 节流回调执行
 * @returns Promise
 */
function waitFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 30))
}

describe('useSrBreakpoint', () => {
  afterEach(() => {
    setViewport(1024)
  })

  it('服务端初值默认为 md', async () => {
    setViewport(1024)
    const bp = useSrBreakpoint({ ssrWidth: 768 })
    // 构造时会立即同步真实宽度，这里断言的是断点归属
    expect(bp.current.value).toBe('lg')
  })

  it('按视口宽度返回正确断点', () => {
    setViewport(320)
    expect(useSrBreakpoint().current.value).toBe('xs')

    setViewport(600)
    expect(useSrBreakpoint().current.value).toBe('sm')

    setViewport(800)
    expect(useSrBreakpoint().current.value).toBe('md')

    setViewport(1000)
    expect(useSrBreakpoint().current.value).toBe('lg')

    setViewport(1280)
    expect(useSrBreakpoint().current.value).toBe('xl')
  })

  it('resize 后通过 rAF 更新', async () => {
    setViewport(500)
    const bp = useSrBreakpoint()
    expect(bp.current.value).toBe('xs')

    setViewport(1200)
    window.dispatchEvent(new Event('resize'))
    await waitFrame()

    expect(bp.current.value).toBe('xl')
    expect(bp.width.value).toBe(1200)
  })

  it('isUp / isDown 边界值正确', () => {
    setViewport(768)
    const bp = useSrBreakpoint()

    // 768 恰好等于 md 下界：命中 isUp，不命中 isDown
    expect(bp.isUp('md')).toBe(true)
    expect(bp.isDown('md')).toBe(false)
    expect(bp.isDown('lg')).toBe(true)
  })

  it('isMobile / isTablet / isDesktop 互斥', () => {
    setViewport(500)
    const mobile = useSrBreakpoint()
    expect(mobile.isMobile.value).toBe(true)
    expect(mobile.isTablet.value).toBe(false)
    expect(mobile.isDesktop.value).toBe(false)

    setViewport(800)
    const tablet = useSrBreakpoint()
    expect(tablet.isTablet.value).toBe(true)

    setViewport(1300)
    const desktop = useSrBreakpoint()
    expect(desktop.isDesktop.value).toBe(true)
  })
})
