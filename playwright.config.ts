import { defineConfig, devices } from '@playwright/test'

/**
 * 端到端测试配置（第 2 层水合防线）
 *
 * 刻意用 channel: 'msedge' 而不是默认的 Chromium：
 * 开发机上通常已装 Edge，复用它可以省掉 `playwright install` 下载上百 MB 浏览器。
 * CI 里若没有 Edge，把 channel 改成 undefined 并跑 `pnpm exec playwright install chromium` 即可。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],

  use: {
    baseURL: 'http://127.0.0.1:3211',
    trace: 'retain-on-failure',
    channel: process.env.CI ? undefined : 'msedge',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 服务端产物需先构建：脚本里已串联 `pnpm --filter playground-nuxt4 build`
  webServer: {
    command: 'node .output/server/index.mjs',
    cwd: './playground-nuxt4',
    url: 'http://127.0.0.1:3211',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: '3211' },
  },
})
