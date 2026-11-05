import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { globSync } from 'tinyglobby'

const ROOT = fileURLToPath(new URL('.', import.meta.url))

/**
 * 组件入口：src/components/<name>/index.ts
 *
 * 显式列出而不是只靠 index.ts 的 re-export：
 * 这样每个组件都能独立引入（`@sunset-reverie/ui/button`），
 * 且将来某个组件不被主入口导出时也不会从产物里消失。
 */
const componentEntries = Object.fromEntries(
  globSync('src/components/*/index.ts', { cwd: ROOT })
    .sort()
    .map((entry) => {
      const name = entry.split('/').at(-2) ?? ''
      return [`components/${name}/index`, fileURLToPath(new URL(entry, import.meta.url))]
    }),
)

/**
 * 核心包构建配置
 *
 * 决策 D-04：@sunset-reverie/icons 不打入 external，直接内联进产物，
 * 避免下游用 git 依赖安装时因 workspace:* 无法解析而报错。
 */
export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      cleanVueFileName: true,
      // 注意：不可排除 src/tokens/generated/**，
      // 否则 dist/index.d.ts 里 re-export 的 './tokens/generated' 将无对应声明，下游类型断链
    }),
  ],

  build: {
    target: 'es2020',
    // 样式由 build-styles.mjs 单独产出（含每个组件的独立 CSS），
    // 这里关掉 Vite 的 CSS 抽取，避免两套产物互相覆盖
    cssCodeSplit: false,

    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        ...componentEntries,
      },
      formats: ['es'],
    },

    rollupOptions: {
      // vue 与图标运行时由下游提供；icons 刻意不排除（见文件头注释）
      external: ['vue', 'vue-router', /^@iconify\//],

      output: {
        // 保留模块结构，子路径导入不会把整个库打进产物
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith('.css') ? '[name][extname]' : 'assets/[name][extname]',
      },
    },

    minify: false,
    sourcemap: true,
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})
