/**
 * 水合告警收集（仅演示用，与 @sunset-reverie/nuxt 无关）
 *
 * 主题初始化、样式注入、组件注册都已经由 module 接管，
 * 这里只保留「把控制台的水合告警显示到页面上」这一件事，方便肉眼验收。
 */
export default defineNuxtPlugin({
  name: 'sr-hydration-watch',
  enforce: 'pre',

  setup() {
    const warnings = useState<string[]>('sr-hydration-warnings', () => [])

    const originalError = console.error
    const originalWarn = console.warn

    /**
     * 记录水合相关告警后原样转发
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
  },
})
