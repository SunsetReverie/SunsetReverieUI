import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ entryRoot: 'src', outDir: 'dist' })],

  build: {
    target: 'es2020',
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'offline/index': fileURLToPath(new URL('./src/offline/index.ts', import.meta.url)),
        // 全量集合单独成入口：只有 import 它的项目才会把 619KB 数据打进 bundle
        'lucide-full': fileURLToPath(new URL('./src/lucide-full.ts', import.meta.url)),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^@iconify\//],
      output: {
        // offline 集合必须保持独立模块，供 @sunset-reverie/icons/offline 子路径引入
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    minify: false,
    sourcemap: true,
  },
})
