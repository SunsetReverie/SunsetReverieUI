/**
 * 水合一致性测试
 *
 * 流程：先 renderToString 产出服务端 HTML → 塞进容器 → 用 createSSRApp 挂载触发 hydrate，
 * 期间监听 console.warn / console.error，任何 Hydration 相关告警都视为失败。
 *
 * 相比「打开页面肉眼看控制台」，这层测试能在 CI 上自动拦截，
 * 且不需要启动 Nuxt —— 真正的 SSR 端到端验证仍留给 playground-nuxt4（W7）。
 */

import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { SrCol } from '../components/col'
import { SrRow } from '../components/row'

/** 收集到的告警 */
let warnings: string[] = []
/** 原始 console 方法 */
let originalWarn: typeof console.warn
let originalError: typeof console.error

beforeEach(() => {
  warnings = []
  originalWarn = console.warn
  originalError = console.error

  /**
   * 替换警告输出，收集水合相关消息
   * @param args 原始参数
   */
  const collect = (...args: unknown[]): void => {
    const text = args.map((a) => String(a)).join(' ')
    if (/Hydration|hydrat/i.test(text)) warnings.push(text)
  }

  console.warn = collect as typeof console.warn
  console.error = collect as typeof console.error
})

afterEach(() => {
  console.warn = originalWarn
  console.error = originalError
})

/**
 * 执行一次 SSR + hydrate，返回容器
 * @param render 渲染函数
 * @returns 已水合的容器元素
 */
async function ssrThenHydrate(render: () => ReturnType<typeof h>): Promise<HTMLElement> {
  const html = await renderToString(createSSRApp({ render }))

  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)

  createSSRApp({ render }).mount(container)
  await nextTick()

  return container
}

describe('水合一致性', () => {
  it('SrRow 水合不产生告警', async () => {
    const container = await ssrThenHydrate(() => h(SrRow, { gutter: 16 }, () => 'row'))

    expect(warnings).toEqual([])
    expect(container.querySelector('.sr-row')).not.toBeNull()

    container.remove()
  })

  it('SrCol 响应式 span 水合不产生告警', async () => {
    const container = await ssrThenHydrate(() =>
      h(SrCol, { span: { xs: 24, md: 12 }, offset: 2 }, () => 'col'),
    )

    expect(warnings).toEqual([])
    expect(container.querySelector('.sr-col')).not.toBeNull()

    container.remove()
  })

  it('栅格嵌套水合后结构保持一致', async () => {
    const container = await ssrThenHydrate(() =>
      h(SrRow, { gutter: [16, 16] }, () => [
        h(SrCol, { span: 8 }, () => 'A'),
        h(SrCol, { span: 8 }, () => 'B'),
        h(SrCol, { span: 8 }, () => 'C'),
      ]),
    )

    expect(warnings).toEqual([])
    expect(container.querySelectorAll('.sr-col').length).toBe(3)

    container.remove()
  })

  it('水合后 DOM 节点被复用而非重建', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(SrCol, { span: 12 }, () => 'x') }))

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)

    const serverNode = container.querySelector('.sr-col')
    createSSRApp({ render: () => h(SrCol, { span: 12 }, () => 'x') }).mount(container)
    await nextTick()

    // 复用同一节点即说明水合成功，而不是丢弃服务端 HTML 重新渲染
    expect(container.querySelector('.sr-col')).toBe(serverNode)

    container.remove()
  })
})
