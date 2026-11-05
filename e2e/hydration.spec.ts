import { expect, test } from '@playwright/test'

/**
 * 真实浏览器里的水合验证
 *
 * 这是第 2 层防线：Vitest 的两层（SSR 渲染、jsdom 水合）能抓大部分问题，
 * 但真实 Nuxt 运行时、真实 CSS 管线、真实浏览器事件顺序只有这里能覆盖。
 */

/** 收集到的水合相关告警 */
const hydrationWarnings: string[] = []

test.beforeEach(async ({ page }) => {
  hydrationWarnings.length = 0

  page.on('console', (message) => {
    const text = message.text()
    if (/hydrat/i.test(text)) hydrationWarnings.push(text)
  })

  page.on('pageerror', (error) => {
    hydrationWarnings.push(error.message)
  })
})

test('首屏 SSR 输出包含根属性与组件', async ({ request }) => {
  // 用 request 拿原始 HTML，避免被客户端渲染后的 DOM 干扰
  const response = await request.get('/')
  const html = await response.text()

  expect(html).toContain('data-sr-theme=')
  expect(html).toContain('data-sr-style=')
  // 组件在服务端就已经渲染出来了（不是等 JS 才有）
  expect(html).toContain('sr-button')
  expect(html).toContain('sr-row')
})

test('防闪烁脚本排在首个样式表之前', async ({ request }) => {
  const html = await (await request.get('/')).text()

  const scriptIndex = html.indexOf('localStorage.getItem')
  const linkIndex = html.indexOf('<link')

  expect(scriptIndex).toBeGreaterThan(-1)
  expect(linkIndex).toBeGreaterThan(-1)
  // 脚本必须先于 CSS 执行，否则首帧会按浏览器默认色绘制，出现白闪
  expect(scriptIndex).toBeLessThan(linkIndex)
})

test('水合过程中不产生任何告警', async ({ page }) => {
  await page.goto('/')
  // 等水合完成：页面上的标记由 onMounted 之后才变成「已水合」
  await expect(page.getByText('已水合（客户端接管）')).toBeVisible()

  expect(hydrationWarnings, hydrationWarnings.join('\n')).toHaveLength(0)
})

test('水合后主题切换可用，且不产生新告警', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('已水合（客户端接管）')).toBeVisible()

  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-sr-theme', 'light')

  await page.getByRole('button', { name: '切主题' }).click()
  await expect(html).toHaveAttribute('data-sr-theme', 'dark')

  expect(hydrationWarnings, hydrationWarnings.join('\n')).toHaveLength(0)
})

test('组件在客户端可交互（栅格与按钮均已挂载）', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('已水合（客户端接管）')).toBeVisible()

  // 主按钮可点击，且点击后不报错
  const primary = page.getByRole('button', { name: '主要按钮' })
  await expect(primary).toBeVisible()
  await primary.click()

  expect(hydrationWarnings, hydrationWarnings.join('\n')).toHaveLength(0)
})
