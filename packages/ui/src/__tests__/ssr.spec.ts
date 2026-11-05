// @vitest-environment node
/**
 * 服务端渲染安全测试
 *
 * 运行在 node 环境（无 window / document），因此任何在 setup 顶层
 * 直接访问浏览器 API 的代码都会在这里直接抛错 —— 这是水合不匹配的头号成因。
 *
 * 覆盖：
 * 1. 组件能否在无 DOM 环境完成渲染，且关键属性正确
 * 2. 两个组合式函数在 SSR 下的降级行为是否确定
 * 3. 防闪烁脚本生成器是纯函数，不依赖环境
 */

import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import { SrCol } from '../components/col'
import { SrRow } from '../components/row'
import { useSrBreakpoint } from '../composables/use-sr-breakpoint'
import { useSrTheme } from '../composables/use-sr-theme'
import { SR_BREAKPOINTS } from '../tokens/generated'
import { srThemeInitScript } from '../utils/theme-script'

describe('SSR 渲染', () => {
  it('SrRow 在无 DOM 环境下渲染并输出 gutter 变量', async () => {
    const app = createSSRApp({
      render: () => h(SrRow, { gutter: [16, 24] }, () => 'row'),
    })

    const html = await renderToString(app)

    expect(html).toContain('sr-row')
    expect(html).toMatch(/--sr-row-gutter-x-xs:\s*16px/)
    expect(html).toMatch(/--sr-row-gutter-y-xs:\s*24px/)
  })

  it('SrCol 在无 DOM 环境下渲染并输出响应式 span', async () => {
    const app = createSSRApp({
      render: () => h(SrCol, { span: { xs: 24, md: 12 } }, () => 'col'),
    })

    const html = await renderToString(app)

    expect(html).toContain('sr-col')
    expect(html).toMatch(/--sr-col-span-xs:\s*24/)
    expect(html).toMatch(/--sr-col-span-md:\s*12/)
  })

  it('栅格嵌套渲染结构完整', async () => {
    const app = createSSRApp({
      render: () =>
        h(SrRow, { gutter: 12 }, () => [
          h(SrCol, { span: 12 }, () => 'A'),
          h(SrCol, { span: 12 }, () => 'B'),
        ]),
    })

    const html = await renderToString(app)
    const matches = html.match(/class="sr-col"/g) ?? []

    expect(matches.length).toBe(2)
  })
})

describe('组合式函数的 SSR 行为', () => {
  it('useSrTheme 在服务端不抛错，返回确定值', () => {
    const theme = useSrTheme()

    // 服务端没有系统偏好，auto 应解析为 light —— 与客户端首帧一致
    expect(theme.resolved.value).toBe('light')
    expect(theme.style.value).toBe('flat')

    // 这些调用不应抛错（内部有 isClient 判断）
    expect(() => {
      theme.setTheme('dark')
      theme.setStyle('glass')
      theme.setPrimaryColor('#7A64B5')
      theme.init()
    }).not.toThrow()

    // init 在服务端是空操作，不应改变状态解析结果之外的 DOM
    expect(theme.mode.value).toBe('dark')
  })

  it('useSrBreakpoint 在服务端使用 ssrWidth 作为初值', () => {
    const bp = useSrBreakpoint({ ssrWidth: 400 })
    expect(bp.width.value).toBe(400)
    expect(bp.current.value).toBe('xs')
    expect(bp.isMobile.value).toBe(true)

    const desktop = useSrBreakpoint({ ssrWidth: 1280 })
    expect(desktop.current.value).toBe('xl')
  })

  it('未传 ssrWidth 时默认取 md 下界，保证服务端与客户端首帧一致', () => {
    const bp = useSrBreakpoint()
    expect(bp.width.value).toBe(SR_BREAKPOINTS.md)
    expect(bp.current.value).toBe('md')
  })
})

describe('防闪烁脚本生成器', () => {
  it('是纯函数，在 node 环境可正常运行', () => {
    const code = srThemeInitScript()
    expect(typeof code).toBe('string')
    expect(code.length).toBeGreaterThan(100)
  })

  it('脚本自身不依赖构建期变量，可直接内联到 HTML', () => {
    const code = srThemeInitScript()
    // 不能出现模板语法的残留
    expect(code).not.toContain('${')
    // 不能出现结束标签
    expect(code).not.toContain('</script')
  })
})
