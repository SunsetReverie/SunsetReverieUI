import { expect, test, type Page } from '@playwright/test'

/**
 * 演示站视觉基线
 *
 * 挑的都是「一改样式就最容易崩」的代表面：开场面板、pill 圆角标签、
 * 浮层面板、吸附播放器，外加四个结构最复杂的组件页（表格的普通/固定列、
 * 树、穿梭框、Markdown 编辑器）。全部用元素截图，避开窗口坐标差异。
 *
 * 刻意不纳入日历 / 日期选择器：它们把「今天」高亮出来，基线每月都会失效。
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

  try {
    await page.goto(`${BASE}/?motion=none${hash}`, { waitUntil: 'networkidle', timeout: 20_000 })
  } catch {
    // 冷启动时 Vite 要预构建依赖并 full reload，networkidle 可能永远等不到。
    // 退回 load 不影响截图：各用例自己还会等目标元素可见
    await page.goto(`${BASE}/?motion=none${hash}`, { waitUntil: 'load', timeout: 15_000 })
  }

  await page.evaluate(() => {
    const root = document.documentElement
    root.setAttribute('data-sr-theme', 'light')
    root.setAttribute('data-sr-style', 'flat')
    root.setAttribute('data-sr-motion', 'none')
  })
  await page.waitForTimeout(250)
}

/**
 * 冷启动预热
 *
 * Vite dev server 首次被访问时会做依赖预构建，完成后会强制 full reload 一次。
 * 若首个用例直接 goto 带 hash 的地址并等 networkidle，这次 reload 会让等待一直
 * 挂着，直到 30s 超时（CI 每次都是冷启动，必现）。
 *
 * 这里先用一个临时页面把「预构建 + 首屏挂载」跑完再关掉，后续用例的
 * networkidle 就只等真正的首屏资源。
 *
 * @param browser Playwright 浏览器实例
 * @returns 无；完成后关掉临时页面
 */
test.beforeAll(async ({ browser }) => {
  const warmup = await browser.newPage()

  // 不能用 networkidle 预热：冷启动时 Vite 有持续的模块请求，压根到不了 idle，
  // 60s 的 hook 超时就是这么撞满的。用 load 打开两次——第一次把预构建跑完
  // （它会 full reload 一次），第二次拿到的就是稳定页面
  await warmup.goto(BASE, { waitUntil: 'load', timeout: 30_000 })
  await warmup.waitForFunction(() => document.querySelector('#app')?.childElementCount)
  await warmup.waitForTimeout(3000)
  await warmup.goto(BASE, { waitUntil: 'load', timeout: 30_000 })
  await warmup.waitForTimeout(500)
  await warmup.close()
})

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

test('表格：基础表格', async ({ page }) => {
  await openDemo(page, '#/c/table')
  // 基础表格里带排序箭头与 #cell-status 插槽，列宽和表头样式一变就会崩
  const basic = page.locator('.demo > section').first()
  await expect(basic).toBeVisible()
  await expect(basic).toHaveScreenshot('table-basic.png')
})

test('表格：固定列', async ({ page }) => {
  await openDemo(page, '#/c/table')
  // 固定列靠 sticky + 边缘投影，横向滚动容器宽度算错时右边框会露出来
  const fixed = page.locator('.demo > section').filter({ hasText: '固定列（横向滚动看效果）' })
  await expect(fixed).toBeVisible()
  await expect(fixed).toHaveScreenshot('table-fixed-columns.png')
})

test('树：展开态与连接线', async ({ page }) => {
  await openDemo(page, '#/c/tree')
  const first = page.locator('.demo > section').first()
  await expect(first).toBeVisible()
  // 只看树本身：右侧还有一个「当前选中」的状态栏，跟着截图会把提示文案也锁死
  await expect(first.locator('.card').first()).toHaveScreenshot('tree-basic.png')
})

test('穿梭框：基础双栏', async ({ page }) => {
  await openDemo(page, '#/c/transfer')
  const basic = page.locator('.demo > section').filter({ hasText: '基础用法' }).first()
  await expect(basic).toBeVisible()
  await expect(basic).toHaveScreenshot('transfer-basic.png')
})

test('下拉菜单：展开面板', async ({ page }) => {
  await openDemo(page, '#/c/dropdown')
  await page.getByRole('button', { name: '更多操作' }).click()
  const panel = page.locator('.sr-dropdown__panel').first()
  await expect(panel).toBeVisible()
  await expect(panel).toHaveScreenshot('dropdown-open.png')
})

test('Markdown 编辑器：完整工具栏', async ({ page }) => {
  await openDemo(page, '#/c/markdown-editor')
  // 工具栏按钮、分栏编辑与预览一起锁：图标尺寸、间距、分隔线都在这一张里
  const full = page.locator('.demo > section').filter({ hasText: '完整工具栏' }).first()
  await expect(full).toBeVisible()
  await expect(full).toHaveScreenshot('markdown-editor-full.png')
})
