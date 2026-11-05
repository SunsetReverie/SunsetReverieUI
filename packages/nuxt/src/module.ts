/**
 * @sunset-reverie/nuxt —— 夕梦 UI 的 Nuxt Module
 *
 * 做了四件事，正好覆盖接入时的全部手工步骤：
 * 1. 注入 base.css（必须排在最前，保证 CSS 变量先于组件样式生效）
 * 2. 批量注册组件（addComponent，构建期按需打包）
 * 3. 注册组合式函数到自动导入（useSrTheme / useSrBreakpoint / ...）
 * 4. 注入 SSR 防闪烁脚本（在 head 最前、CSS 之前执行）
 */

import { addComponent, addImports, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from 'nuxt/schema'

import { SR_THEME_INIT_SNIPPET, type SrStyleMode, type SrThemeMode } from '@sunset-reverie/ui'
import { SR_COMPONENT_NAMES } from './components.generated'

/** Module 配置项（nuxt.config.ts 中的 sunsetReverie 键） */
export interface ModuleOptions {
  /** 组件名前缀 @default 'Sr' */
  prefix?: string
  /**
   * 是否注入全量组件样式（`style.css`，已包含 base 变量层）@default true
   *
   * 关掉它就必须自己处理样式：要么手动引 style.css，
   * 要么用 @sunset-reverie/resolver 做按需引入 —— 但 Nuxt 侧组件是构建期自动注册的，
   * resolver 不参与，所以关掉后需要自己写 import。
   */
  injectComponentStyle?: boolean
  /** 不注入组件样式时，是否至少注入 base.css（变量 + reset） @default true */
  injectBaseStyle?: boolean
  /** 是否注入主题防闪烁内联脚本 @default true */
  injectThemeScript?: boolean
  /** 服务端输出的默认主题（auto 由脚本在客户端解析） @default 'auto' */
  defaultTheme?: SrThemeMode
  /** 服务端输出的默认质感 @default 'flat' */
  defaultStyle?: SrStyleMode
  /** 是否把组合式函数加入自动导入 @default true */
  autoImports?: boolean
}

/**
 * 夕梦 UI 的 Nuxt 模块
 *
 * 显式标注为 NuxtModule<ModuleOptions>：defineNuxtModule 的推断类型会引用
 * @nuxt/schema 的内部路径，rollup-plugin-dts 生成 .d.ts 时无法命名（TS2742）。
 */
const sunsetReverieModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@sunset-reverie/nuxt',
    configKey: 'sunsetReverie',
    compatibility: { nuxt: '^4.0.0' },
  },

  defaults: {
    prefix: 'Sr',
    injectComponentStyle: true,
    injectBaseStyle: true,
    injectThemeScript: true,
    defaultTheme: 'auto',
    defaultStyle: 'flat',
    autoImports: true,
  },

  /**
   * 模块初始化
   * @param options 合并默认值后的配置
   * @param nuxt Nuxt 实例
   */
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // ---------- 1. 样式 ----------
    {
      const css = nuxt.options.css as string[]

      /**
       * 前置插入，保证变量层先于业务样式落地
       * @param target 样式入口
       */
      const prepend = (target: string): void => {
        if (!css.includes(target)) css.unshift(target)
      }

      if (options.injectComponentStyle) {
        // 全量样式已包含 base，不要再单独插 base.css（否则变量定义重复一份）
        prepend('@sunset-reverie/ui/style.css')
      } else if (options.injectBaseStyle) {
        prepend('@sunset-reverie/ui/base.css')
      }
    }

    // ---------- 2. 组件 ----------
    const prefix = options.prefix ?? 'Sr'

    for (const name of SR_COMPONENT_NAMES) {
      addComponent({
        name: `${prefix}${name}`,
        export: `Sr${name}`,
        filePath: '@sunset-reverie/ui',
      })
    }

    // ---------- 3. 组合式函数 ----------
    if (options.autoImports) {
      addImports([
        { name: 'useSrTheme', from: '@sunset-reverie/ui' },
        { name: 'useSrBreakpoint', from: '@sunset-reverie/ui' },
        { name: 'useSrConfig', from: '@sunset-reverie/ui' },
        { name: 'srToast', from: '@sunset-reverie/ui' },
      ])
    }

    // ---------- 4. SSR 防闪烁 ----------
    if (options.injectThemeScript) {
      // 服务端先给出确定值，避免 HTML 里没有属性导致首帧按浏览器默认色绘制
      nuxt.options.app.head.htmlAttrs = {
        ...nuxt.options.app.head.htmlAttrs,
        'data-sr-theme': options.defaultTheme === 'dark' ? 'dark' : 'light',
        'data-sr-style': options.defaultStyle ?? 'flat',
      }

      nuxt.options.app.head.script ||= []
      nuxt.options.app.head.script.push({
        key: 'sr-theme-init',
        innerHTML: SR_THEME_INIT_SNIPPET,
        // critical 让它排在其它 head 节点（含样式表）之前
        tagPriority: 'critical',
      })
    }

    // 保留 resolve 供后续（如注入 runtime 插件）使用，同时避免未使用告警
    void resolve
  },
})

export default sunsetReverieModule
