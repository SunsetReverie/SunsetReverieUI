import { expect, test, type Page } from '@playwright/test'

/**
 * 演示站视觉基线
 *
 * 只挑四处「一改Style就最容易崩」的代表面：开场面板、pill 圆角标签、
 * 浮层面板、吸附播放器。全部用元素截图，避开窗口坐标差异。
 *
 * 运行前先 `pnpm check:visual:update` 生成基线，之后 `pnpm check:visual` 比对。
 */

const BASE = 'http://localhost:5173'

/**
 * 打开页面并固定外观
 *
 * @param page Playwright 页面
 * @param hash hash 路由，如 `#/c/tabs`
 * @returns 无；完成后页面已可截图
 */
async function openDemo(page: Page, hash: string): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('sr-theme', 'light')
    localStorage.setItem('sr-style', 'flat')
    localStorage.removeItem('sr-primary')
    localStorage.removeItem('sr-primary-preset')
  })

  await page.goto(`${BASE}/?motion=none${hash}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    const root = document.documentElement
    root.setAttribute('data-sr-theme', 'light')
    root.setAttribute('data-sr-style', 'flat')
    root.setAttribute('data-sr-motion', 'none')
  })
  await page.waitForTimeout(250)
}

test.beforeEach(async ({ page }) => {
  // 视觉基线不关心业务接口是否可用；音乐播放器用本地假数据
  await page.route('**/*', async (route) => {
    const url = route.request().url()

    if (url.includes('type=playlist')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            name: '夕梦测试曲',
            artist: '演示站',
            url: 'https://example.com/song.mp3?id=1',
            pic: '',
            lrc: '',
          },
        ]),
      })
      return
    }

    if (url.includes('example.com')) {
      await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: '' })
      return
    }

    await route.continue()
  })
})

test('概览页开场面板', async ({ page }) => {
  await openDemo(page, '#/overview')
  await expect(page.locator('.intro')).toBeVisible()
  await expect(page.locator('.intro')).toHaveScreenshot('overview-intro.png')
})

test('Tabs 的 pill 圆角标签', async ({ page }) => {
  await openDemo(page, '#/c/tabs')
  await expect(page.locator('.demo > section').first()).toBeVisible()
  await expect(page.locator('.demo > section').first()).toHaveScreenshot('tabs-pill.png')
})

test('右键菜单浮层', async ({ page }) => {
  await openDemo(page, '#/c/context-menu')
  const zone = page.locator('.zone').first()
  const box = await zone.boundingBox()
  if (!box) throw new Error('右键触发区没有尺寸，页面可能没渲染出来')

  await page.mouse.click(box.x + 30, box.y + 20, { button: 'right' })
  const panel = page.locator('.sr-context-menu__panel')
  await expect(panel).toBeVisible()
  await expect(panel).toHaveScreenshot('context-menu-open.png')
})

test('吸附播放器：整卡点击展开', async ({ page }) => {
  await openDemo(page, '#/c/music-player')

  const attachPanel = page
    .locator('.sr-panel')
    .filter({ has: page.getByText('吸附模式 attach', { exact: true }) })
  await attachPanel.locator('.sr-switch').first().click()

  const mini = page.locator('.sr-music__mini')
  await expect(mini).toBeVisible()
  const miniBox = await mini.boundingBox()
  if (!miniBox) throw new Error('吸附圆钮没有尺寸，页面可能没渲染出来')
  // 不能用 locator.hover()：mouseenter 会让圆钮立刻被面板替换（v-if），
  // Playwright 会因为元素 detach 一直重试到超时
  await page.mouse.move(miniBox.x + miniBox.width / 2, miniBox.y + miniBox.height / 2)
  const card = page.locator('.sr-music.is-compact-card')
  await expect(card).toBeVisible()
  await expect(card).toHaveScreenshot('music-attach-compact.png')

  // 控件不展开：播放按钮点了仍应停在精简卡片
  await card.locator('.sr-music__btn--main').click()
  await expect(page.locator('.sr-music.is-compact-card')).toBeVisible()

  // 任意非控件区域都展开，右上角图标保留
  await expect(card.locator('[aria-label="展开完整播放器"]')).toBeVisible()
  await card.locator('.sr-music__name').click()
  await expect(page.locator('.sr-music.is-compact-card')).toHaveCount(0)
  // 页面上还有一个常驻的 full 模式实例，断言与截图都要限定在吸附面板上
  const fullPanel = page.locator('.sr-music--mini-panel')
  await expect(fullPanel.locator('.sr-music__volume')).toBeVisible()
  await expect(fullPanel).toHaveScreenshot('music-attach-full.png')
})
