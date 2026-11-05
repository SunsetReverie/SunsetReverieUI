/**
 * SunsetReverieResolver —— unplugin-vue-components 按需引入解析器
 *
 * 约定：把 <sr-button> 解析为 @sunset-reverie/ui 的子路径导入，
 * 并附带组件级样式副作用（base.css 只在首个组件时注入一次）。
 *
 * W1 阶段组件清单为空；W6 起由 scripts/sync-components.mjs 从
 * packages/ui/src/components 目录同步写入。
 */

/** 组件名清单（PascalCase，不含 Sr 前缀） */
const COMPONENT_NAMES: readonly string[] = []

/** Resolver 配置项 */
export interface SunsetReverieResolverOptions {
  /**
   * 样式引入方式
   * - 'css'：引入 dist 编译产物（推荐，下游无需 Less）
   * - 'less'：引入 .less 源码（需下游配置 Less，但可用 Less 变量定制）
   * - false：不引入（自行全量引入 style.css）
   * @default 'css'
   */
  importStyle?: 'css' | 'less' | false
  /**
   * 是否在首个组件解析时附带引入 base.css
   * @default true
   */
  importBaseStyle?: boolean
  /**
   * 组件名前缀
   * @default 'Sr'
   */
  prefix?: string
  /**
   * 是否解析指令（P3 实现 v-sr-loading 等）
   * @default false
   */
  directives?: boolean
}

/** 单组件解析结果 */
interface ComponentResolveResult {
  name: string
  from: string
  sideEffects?: string[]
}

/**
 * PascalCase 转 kebab-case
 * @param name 组件名，如 ButtonGroup
 * @returns kebab 形式，如 button-group
 */
function toKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 生成夕梦 UI 的按需引入解析器
 * @param options 配置项
 * @returns 供 unplugin-vue-components 使用的 resolver 数组
 */
export function SunsetReverieResolver(options: SunsetReverieResolverOptions = {}) {
  const { importStyle = 'css', importBaseStyle = true, prefix = 'Sr', directives = false } = options

  // 进程内标记：避免每个组件都重复注入 base.css 的 import 语句
  let baseInjected = false

  const componentResolver = {
    type: 'component' as const,

    /**
     * 解析组件名
     * @param name PascalCase 组件名，如 SrButton
     * @returns 导入信息；未匹配返回 undefined
     */
    resolve(name: string): ComponentResolveResult | undefined {
      if (!name.startsWith(prefix)) return undefined

      const bare = name.slice(prefix.length)
      if (!COMPONENT_NAMES.includes(bare)) return undefined

      const kebab = toKebab(bare)
      const sideEffects: string[] = []

      if (importStyle === 'css') {
        if (importBaseStyle && !baseInjected) {
          baseInjected = true
          sideEffects.push('@sunset-reverie/ui/base.css')
        }
        sideEffects.push(`@sunset-reverie/ui/components/${kebab}/style.css`)
      } else if (importStyle === 'less') {
        sideEffects.push(`@sunset-reverie/ui/src/components/${kebab}/style/index.less`)
      }

      return {
        name,
        // 走子路径导入，保证只打包该组件
        from: `@sunset-reverie/ui/${kebab}`,
        sideEffects,
      }
    },
  }

  const directiveResolver = {
    type: 'directive' as const,

    /**
     * 解析指令名
     * @param name 指令名（不含 v- 前缀）
     * @returns 导入信息；未匹配返回 undefined
     */
    resolve(name: string) {
      if (!name.startsWith('sr')) return undefined
      return { name, from: '@sunset-reverie/ui' }
    },
  }

  return directives ? [componentResolver, directiveResolver] : [componentResolver]
}

export default SunsetReverieResolver
