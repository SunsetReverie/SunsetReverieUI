import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

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
    cssCodeSplit: false,

    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        // W6 起按 src/components/<name>/index.ts 自动追加多入口
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
