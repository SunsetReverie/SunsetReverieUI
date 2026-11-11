import { defineConfig, devices } from '@playwright/test'

/**
 * 演示站视觉基线配置
 *
 * 与水合 e2e 分开：那边跑 Nuxt 构建产物（3327），这边跑 playground-vue3
 * 的 dev server（5173）。固定视口 / 亮色 / 扁平 / 无动效，避免主题持久化与
 * 动画帧让同一份基线在不同机器上漂移。
 *
 * 用 localhost 而不是 127.0.0.1：Vite 默认只监听 IPv6 的 ::1，
 * 用 IPv4 地址做 webServer.url 会一直等到超时。
 *
 * 基线图片放在 visual/__screenshots__，用 `pnpm check:visual:update` 重建。
 */
export default defineConfig({
  testDir: './visual',
  // 60s 而非 30s：webServer 刚起来时 Vite 还在做依赖预构建，
  // 首个用例的首屏导航会被这次冷启动吃掉十几秒，留足余量避免误红
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  // 不带平台后缀：基线在 macOS / Linux 之间也能共用，差异由下面的容差吸收
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    },
  },

  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    channel: process.env.CI ? undefined : 'msedge',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 1,
      },
    },
  ],

  webServer: {
    command: 'pnpm --filter playground-vue3 dev --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
