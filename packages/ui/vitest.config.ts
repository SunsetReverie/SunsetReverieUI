import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/__tests__/**/*.spec.ts'],
    // 覆盖率阈值在 W3 引入首个组件后启用
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/index.ts', 'src/tokens/generated/**', 'src/**/__tests__/**'],
    },
  },
})
