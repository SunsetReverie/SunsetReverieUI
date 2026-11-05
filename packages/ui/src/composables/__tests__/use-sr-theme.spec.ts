import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { mediaState, resetMediaState } from '../../../vitest.setup'

/**
 * 每个用例重新加载模块：主题状态是模块级单例，
 * 复用同一实例会让用例互相污染。
 * @returns useSrTheme 与相关常量
 */
async function loadModule() {
  vi.resetModules()
  return import('../use-sr-theme')
}

describe('useSrTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMediaState()
    const root = document.documentElement
    root.removeAttribute('data-sr-theme')
    root.removeAttribute('data-sr-style')
    root.removeAttribute('style')
  })

  it('默认 auto，跟随系统暗色', async () => {
    mediaState.dark = true
    const { useSrTheme } = await loadModule()
    const theme = useSrTheme()

    theme.init()
    await nextTick()

    expect(theme.mode.value).toBe('auto')
    expect(theme.resolved.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-sr-theme')).toBe('dark')
  })

  it('setTheme 写入根属性与 localStorage', async () => {
    const { useSrTheme, SR_THEME_STORAGE_KEY } = await loadModule()
    const theme = useSrTheme()
    theme.init()

    theme.setTheme('dark')
    await nextTick()

    expect(document.documentElement.getAttribute('data-sr-theme')).toBe('dark')
    expect(localStorage.getItem(SR_THEME_STORAGE_KEY)).toBe('dark')
  })

  it('toggleTheme 在 auto 下按当前生效值取反', async () => {
    const { useSrTheme } = await loadModule()
    const theme = useSrTheme()
    theme.init()
    await nextTick()

    // 系统为浅色 → 当前 light → 切换后应为 dark
    theme.toggleTheme()
    await nextTick()
    expect(theme.resolved.value).toBe('dark')

    theme.toggleTheme()
    await nextTick()
    expect(theme.resolved.value).toBe('light')
  })

  it('setStyle 切换质感并同步根属性', async () => {
    const { useSrTheme, SR_STYLE_STORAGE_KEY } = await loadModule()
    const theme = useSrTheme()
    theme.init()

    theme.setStyle('glass')
    await nextTick()

    expect(document.documentElement.getAttribute('data-sr-style')).toBe('glass')
    expect(localStorage.getItem(SR_STYLE_STORAGE_KEY)).toBe('glass')
  })

  it('setPrimaryColor 写入主色与派生变量', async () => {
    const { useSrTheme, SR_PRIMARY_STORAGE_KEY } = await loadModule()
    const theme = useSrTheme()
    theme.init()

    theme.setPrimaryColor('#7A64B5')
    await nextTick()

    const style = document.documentElement.style
    expect(style.getPropertyValue('--sr-color-primary')).toBe('#7A64B5')
    expect(style.getPropertyValue('--sr-color-primary-hover')).not.toBe('')
    expect(localStorage.getItem(SR_PRIMARY_STORAGE_KEY)).toBe('#7A64B5')
  })

  it('resetPrimaryColor 清除内联主色', async () => {
    const { useSrTheme } = await loadModule()
    const theme = useSrTheme()
    theme.init()

    theme.setPrimaryColor('#2578F5')
    await nextTick()
    theme.resetPrimaryColor()
    await nextTick()

    expect(document.documentElement.style.getPropertyValue('--sr-color-primary')).toBe('')
    expect(theme.primary.value).toBe('')
  })

  it('init 幂等，重复调用不会重复绑定监听', async () => {
    const { useSrTheme } = await loadModule()
    const theme = useSrTheme()

    theme.init()
    theme.init()
    theme.init()

    expect(mediaState.listeners.length).toBe(1)
  })

  it('恢复持久化偏好', async () => {
    localStorage.setItem('sr-theme', 'dark')
    localStorage.setItem('sr-style', 'glass')

    const { useSrTheme } = await loadModule()
    const theme = useSrTheme()
    theme.init()
    await nextTick()

    expect(theme.resolved.value).toBe('dark')
    expect(theme.style.value).toBe('glass')
  })
})
