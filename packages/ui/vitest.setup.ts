/**
 * Vitest 全局前置
 *
 * jsdom 缺少若干浏览器 API（matchMedia / requestAnimationFrame），
 * 主题与断点内核都依赖它们，这里统一补齐，避免每个用例各自 mock。
 */

import { vi } from 'vitest'

/** 当前模拟的系统是否为暗色，用例可改写 */
export const mediaState = {
  dark: false,
  /** 供用例断言监听器是否被注册 */
  listeners: [] as Array<(event: MediaQueryListEvent) => void>,
}

/**
 * 安装 matchMedia 模拟
 * @returns {void}
 */
function installMatchMedia(): void {
  const mock = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark') ? mediaState.dark : false,
    media: query,
    onchange: null,
    addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) => {
      mediaState.listeners.push(cb)
    },
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }))

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: mock,
  })
}

/**
 * 安装 requestAnimationFrame 模拟
 * jsdom 默认不实现，断点内核的 resize 节流依赖它
 * @returns {void}
 */
function installRaf(): void {
  if (typeof globalThis.requestAnimationFrame === 'function') return

  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number) as typeof requestAnimationFrame
  globalThis.cancelAnimationFrame = ((id: number): void => clearTimeout(id)) as typeof cancelAnimationFrame
}

installMatchMedia()
installRaf()

/**
 * 重置媒体查询状态
 * @returns {void}
 */
export function resetMediaState(): void {
  mediaState.dark = false
  mediaState.listeners.length = 0
}
