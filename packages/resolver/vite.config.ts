import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ entryRoot: 'src', outDir: 'dist' })],
  build: {
    target: 'es2020',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    // 无运行时依赖：resolver 只做字符串映射，不 import 组件库
    rollupOptions: { external: [] },
    minify: false,
    sourcemap: true,
  },
})
