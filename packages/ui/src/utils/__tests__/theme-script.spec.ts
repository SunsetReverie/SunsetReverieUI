import { describe, expect, it } from 'vitest'

import { SR_THEME_INIT_SNIPPET, srThemeInitScript, srThemeInitTag } from '../theme-script'

describe('srThemeInitScript', () => {
  it('包含决定首帧主题的关键逻辑', () => {
    const code = srThemeInitScript()

    expect(code).toContain("localStorage.getItem('sr-theme')")
    expect(code).toContain("setAttribute('data-sr-theme'")
    expect(code).toContain("setAttribute('data-sr-style'")
    expect(code).toContain('prefers-color-scheme: dark')
  })

  it('默认配置为 auto / flat', () => {
    const code = srThemeInitScript()
    expect(code).toContain("||'auto'")
    expect(code).toContain("||'flat'")
  })

  it('支持自定义存储键与默认值', () => {
    const code = srThemeInitScript({
      themeKey: 'app-theme',
      styleKey: 'app-style',
      primaryKey: 'app-primary',
      defaultTheme: 'dark',
      defaultStyle: 'glass',
    })

    expect(code).toContain("localStorage.getItem('app-theme')")
    expect(code).toContain("localStorage.getItem('app-primary')")
    expect(code).toContain("||'dark'")
    expect(code).toContain("||'glass'")
  })

  it('异常时给出确定的兜底属性，避免 SSR/CSR 结构不一致', () => {
    const code = srThemeInitScript()
    expect(code).toContain('catch(e)')
    expect(code).toContain("setAttribute('data-sr-theme','light')")
  })

  it('脚本内不能出现结束标签，否则会提前闭合 script', () => {
    expect(srThemeInitScript()).not.toContain('</script')
    expect(SR_THEME_INIT_SNIPPET).not.toContain('</script')
  })

  it('生成的标签可带 nonce', () => {
    const tag = srThemeInitTag({ nonce: 'abc123' })
    expect(tag.startsWith('<script nonce="abc123">')).toBe(true)
    expect(tag.endsWith('</script>')).toBe(true)
  })

  it('默认片段与函数输出一致', () => {
    expect(SR_THEME_INIT_SNIPPET).toBe(srThemeInitScript())
  })
})
