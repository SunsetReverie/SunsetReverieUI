import { SR_THEME_INIT_SNIPPET, useSrTheme } from '@sunset-reverie/ui'

/**
 * 主题插件（W7 之后由 @sunset-reverie/nuxt 接管，此文件可删除）
 *
 * 做三件事：
 * 1. 在 head 最前注入防闪烁脚本（服务端输出，客户端首帧前执行）
 * 2. 初始化主题状态（服务端为空操作，客户端对齐 localStorage）
 * 3. 客户端拦截水合告警，暴露给页面展示 —— 比盯控制台可靠
 */
export default defineNuxtPlugin({
  name: 'sr-theme',
  enforce: 'pre',

  setup() {
    const theme = useSrTheme()
    theme.init()

    // tagPriority: 'critical' 让脚本排在其它 head 节点之前
    useHead({
      script: [
        {
          key: 'sr-theme-init',
          innerHTML: SR_THEME_INIT_SNIPPET,
          tagPriority: 'critical',
        },
      ],
    })

    // 客户端：拦截水合告警并记录，供页面展示
    const warnings = useState<string[]>('sr-hydration-warnings', () => [])

    if (import.meta.client) {
      const originalError = console.error
      const originalWarn = console.warn

      /**
       * 记录水合相关告警后原样转发，避免吞掉其它信息
       * @param original 原始输出函数
       * @param args 参数
       */
      const capture = (original: (...args: unknown[]) => void, args: unknown[]): void => {
        const text = args.map((item) => String(item)).join(' ')
        if (/hydrat/i.test(text)) warnings.value.push(text.slice(0, 300))
        original(...args)
      }

      console.error = (...args: unknown[]) => capture(originalError, args)
      console.warn = (...args: unknown[]) => capture(originalWarn, args)
    }
  },
})
