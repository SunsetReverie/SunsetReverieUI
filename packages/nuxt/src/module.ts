/**
 * @sunset-reverie/nuxt —— 夕梦 UI 的 Nuxt Module
 *
 * W1 阶段仅有模块骨架与配置类型；组件注册、样式注入、
 * SSR 主题脚本在 W7 实现（对应规划文档第十二章 12.2）。
 */

import { createResolver, defineNuxtModule } from '@nuxt/kit'

/** Module 配置项（nuxt.config.ts 中的 sunsetReverie 键） */
export interface ModuleOptions {
  /** 组件名前缀，默认 'Sr' */
  prefix?: string
  /** 是否注入 base.css */
  injectBaseStyle?: boolean
  /** 是否注入主题防闪烁内联脚本 */
  injectThemeScript?: boolean
  /** 是否注册 SSR 断点组合式函数 */
  injectSsrBreakpoint?: boolean
  /** 服务端默认主题 */
  defaultTheme?: 'light' | 'dark' | 'auto'
  /** 服务端默认质感风格 */
  defaultStyle?: 'glass' | 'flat'
  /** 图标离线集合是否预注册 */
  iconifyOffline?: boolean
}

/**
 * 夕梦 UI 的 Nuxt 模块
 * 职责：注册组件、注入样式与插件、注入 SSR 主题脚本
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@sunset-reverie/nuxt',
    configKey: 'sunsetReverie',
    compatibility: { nuxt: '^4.0.0' },
  },

  defaults: {
    prefix: 'Sr',
    injectBaseStyle: true,
    injectThemeScript: true,
    injectSsrBreakpoint: false,
    defaultTheme: 'light',
    defaultStyle: 'flat',
    iconifyOffline: true,
  },

  /**
   * 模块初始化
   * @param options 合并默认值后的配置
   * @param nuxt Nuxt 实例
   */
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // W7：注入 base.css（必须排在 css 数组最前，保证 CSS 变量先于组件样式生效）
    if (options.injectBaseStyle) {
      const css = nuxt.options.css as string[]
      const base = '@sunset-reverie/ui/base.css'
      if (!css.includes(base)) css.unshift(base)
    }

    // W7：addComponent 批量注册、addImportsDir 注册组合式函数、addPlugin 注入主题脚本
    void resolve
  },
})
