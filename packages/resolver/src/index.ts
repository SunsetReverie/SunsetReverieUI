/**
 * SunsetReverieResolver —— unplugin-vue-components 按需引入解析器
 *
 * 约定：把 <sr-button> 解析为 @sunset-reverie/ui 的子路径导入，
 * 并附带组件级样式副作用（base.css 只在首个组件时注入一次）。
 *
 * 组件清单由 scripts/sync-components.mjs 扫描目录自动生成，
 * 新增组件后执行 pnpm gen:components 即可，无需手改本文件。
 */

import { SR_COMPONENT_NAMES } from './components.generated'

/** 组件名清单（PascalCase，不含 Sr 前缀），由 pnpm gen:components 自动同步 */
const COMPONENT_NAMES: readonly string[] = SR_COMPONENT_NAMES

/** Resolver 配置项 */
export interface SunsetReverieResolverOptions {
  /**
   * 样式引入方式
   * - 'css'：引入 dist 编译产物（推荐，下游无需 Less）
   * - 'less'：引入 .less 源码（需下游配置 Less，但可用 Less 变量定制）
   *   注意：包只发布 dist，tarball 安装后没有 src 目录，该选项仅本地 link 联调时有效
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

/**
 * 组合式函数与命令式 API 的自动导入清单
 *
 * 与 `@sunset-reverie/nuxt` 模块里 `addImports` 注册的是同一批导出。
 * 两处必须保持一致：新增组合式函数时这里和 nuxt module 一起改，
 * 否则 Vue 项目自动导入会漏、Nuxt 项目则会出现「自动导入可用但 preset 里没有」的不一致。
 */
export const SR_AUTO_IMPORT_NAMES: readonly string[] = [
  'useSrTheme',
  'useSrBreakpoint',
  'useSrConfig',
  'srToast',
  'srConfirm',
  'srMessage',
  'srNotification',
]

/** 自动导入 preset 配置项 */
export interface SunsetReverieAutoImportOptions {
  /**
   * 是否包含命令式 API（`srToast` / `srConfirm` / `srMessage` / `srNotification`）
   *
   * 关掉后只保留 `useSr*` 组合式函数，适合不希望全局挂命令式函数、
   * 或只想让 `useSrTheme` 这类函数免 import 的场景。
   * @default true
   */
  includeApis?: boolean
}

/**
 * 与 `unplugin-auto-import` 的 `InlinePreset` 结构兼容的 preset
 *
 * 故意不引 `unplugin-auto-import` 的类型：它在使用方是开发依赖，
 * 若在此处引用，resolver 的类型声明会带上一个未声明的依赖。
 */
export interface SunsetReverieAutoImportPreset {
  /** 导入来源包名 */
  from: string
  /** 需要自动导入的导出名清单 */
  imports: string[]
}

/**
 * 生成 `unplugin-auto-import` 的 preset
 *
 * 用法：`AutoImport({ imports: [SunsetReverieAutoImport()] })`（注意是 `imports`，
 * `presets` 是插件里另一种按包名解析的 `packagePresets`，写错不会报错但会静默失效），
 * 之后 `<script setup>` 里可直接调用 `useSrTheme()` / `srToast()`，不必手写 import。
 * @param options 配置项，见 {@link SunsetReverieAutoImportOptions}
 * @returns 供 `unplugin-auto-import` 的 `presets` 数组使用的 preset 对象
 */
export function SunsetReverieAutoImport(
  options: SunsetReverieAutoImportOptions = {},
): SunsetReverieAutoImportPreset {
  const { includeApis = true } = options

  // 命令式 API 统一以 sr 开头，useSr* 组合式函数以 use 开头，按前缀区分即可
  const imports = includeApis
    ? [...SR_AUTO_IMPORT_NAMES]
    : SR_AUTO_IMPORT_NAMES.filter((name) => !name.startsWith('sr'))

  return { from: '@sunset-reverie/ui', imports: [...imports] }
}

export default SunsetReverieResolver
