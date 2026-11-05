/**
 * SSR 防闪烁脚本生成器
 *
 * 问题：SSR 返回的 HTML 里 <html> 没有 data-sr-theme，浏览器先按默认色绘制，
 * 等 JS 读到 localStorage 再切换，用户会看到一帧白闪。
 *
 * 解法：在 <head> 最靠前插一段阻塞式同步脚本，在首次绘制前决定属性值。
 *
 * 三种用法：
 * 1. Vite 项目 —— 把 SR_THEME_INIT_SNIPPET 粘到 index.html 的 <head> 第一行
 * 2. Nuxt 项目 —— 模块内部 useHead({ script: [{ innerHTML: srThemeInitScript() }] })
 * 3. 自定义 —— 传 options 覆写存储键与默认值
 */

import type { SrStyleMode, SrThemeMode } from '../types/theme'

/** 脚本配置项 */
export interface SrThemeScriptOptions {
  /** 明暗持久化键 @default 'sr-theme' */
  themeKey?: string
  /** 风格持久化键 @default 'sr-style' */
  styleKey?: string
  /** 主色持久化键 @default 'sr-primary' */
  primaryKey?: string
  /** 无持久化记录时的默认明暗 @default 'auto' */
  defaultTheme?: SrThemeMode
  /** 无持久化记录时的默认风格 @default 'flat' */
  defaultStyle?: SrStyleMode
  /** CSP nonce，传入后会写在 script 标签上 */
  nonce?: string
}

/**
 * 生成主题初始化脚本（纯 JS，不含 script 标签）
 *
 * 体积约 1.2KB 未压缩，且必须保持同步执行 —— 不要加 defer / async。
 * @param options 配置项
 * @returns 可直接内联的 JS 代码
 */
export function srThemeInitScript(options: SrThemeScriptOptions = {}): string {
  const {
    themeKey = 'sr-theme',
    styleKey = 'sr-style',
    primaryKey = 'sr-primary',
    defaultTheme = 'auto',
    defaultStyle = 'flat',
  } = options

  // 用数组拼接而非多行模板串，避免缩进被带进产物
  return [
    '(function(){',
    'try{',
    'var d=document.documentElement;',
    `var m=localStorage.getItem('${themeKey}')||'${defaultTheme}';`,
    `var s=localStorage.getItem('${styleKey}')||'${defaultStyle}';`,
    `var p=localStorage.getItem('${primaryKey}')||'';`,
    `var pp=localStorage.getItem('${primaryKey}-preset')||'';`,
    "var dark=m==='dark'||(m==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);",
    "d.setAttribute('data-sr-theme',dark?'dark':'light');",
    "d.setAttribute('data-sr-style',s==='glass'?'glass':'flat');",
    "d.style.colorScheme=dark?'dark':'light';",
    "if(pp){d.setAttribute('data-sr-primary',pp);}",
    'else if(p){',
    "d.style.setProperty('--sr-color-primary',p);",
    "if(window.CSS&&CSS.supports&&CSS.supports('color','color-mix(in oklab, red 50%, white)')){",
    "d.style.setProperty('--sr-color-primary-text','color-mix(in oklab, '+p+' 82%, black)');",
    "d.style.setProperty('--sr-color-primary-hover','color-mix(in oklab, '+p+' 88%, white)');",
    "d.style.setProperty('--sr-color-primary-active','color-mix(in oklab, '+p+' 84%, black)');",
    "d.style.setProperty('--sr-color-primary-alpha-25','color-mix(in oklab, '+p+' 25%, transparent)');",
    "d.style.setProperty('--sr-color-primary-alpha-12','color-mix(in oklab, '+p+' 12%, transparent)');",
    "d.style.setProperty('--sr-color-primary-alpha-08','color-mix(in oklab, '+p+' 8%, transparent)');",
    '}',
    '}',
    '}catch(e){',
    // localStorage 被禁用时仍要给出确定值，避免 SSR/CSR 结构不一致
    "document.documentElement.setAttribute('data-sr-theme','light');",
    "document.documentElement.setAttribute('data-sr-style','flat');",
    '}',
    '})();',
  ].join('')
}

/**
 * 生成带 <script> 标签的初始化代码
 * @param options 配置项
 * @returns 完整 script 标签字符串
 */
export function srThemeInitTag(options: SrThemeScriptOptions = {}): string {
  const nonceAttr = options.nonce ? ` nonce="${options.nonce}"` : ''
  return `<script${nonceAttr}>${srThemeInitScript(options)}</script>`
}

/**
 * 默认配置下的初始化脚本，供 Vite 项目直接粘贴进 index.html
 *
 * ⚠️ 必须放在 <head> 内所有 CSS/JS 之前
 */
export const SR_THEME_INIT_SNIPPET = srThemeInitScript()
