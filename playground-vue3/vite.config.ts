import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

// 直接引用库源码里的脚本生成器，确保 playground 验证的就是最终会交付的那段代码
import { SR_THEME_INIT_SNIPPET } from '../packages/ui/src/utils/theme-script'

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

/**
 * 把库生成的主题初始化脚本注入 index.html
 *
 * 这样 index.html 里不需要手抄一份脚本，库改动后 playground 自动跟随；
 * 同时验证了「脚本必须同步执行、必须在所有 CSS 之前」这一约束。
 * @returns Vite 插件
 */
function srThemeInitPlugin(): Plugin {
  return {
    name: 'sr-theme-init',
    transformIndexHtml(html) {
      return html.replace('<!--sr-theme-init-->', `<script>${SR_THEME_INIT_SNIPPET}</script>`)
    },
  }
}

export default defineConfig({
  plugins: [vue(), srThemeInitPlugin()],

  resolve: {
    // 用数组形式保证匹配顺序：样式子路径必须先于包根匹配
    alias: [
      {
        find: /^@sunset-reverie\/ui\/base\.css$/,
        replacement: resolvePath('../packages/ui/src/styles/base/index.less'),
      },
      {
        find: /^@sunset-reverie\/ui\/style\.css$/,
        replacement: resolvePath('../packages/ui/src/styles/index.less'),
      },
      {
        find: /^@sunset-reverie\/ui$/,
        replacement: resolvePath('../packages/ui/src/index.ts'),
      },
    ],
  },

  server: { port: 5173, open: false },
})
