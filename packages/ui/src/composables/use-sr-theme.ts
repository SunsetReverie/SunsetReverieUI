/**
 * 主题与风格的状态内核
 *
 * 设计要点：
 * 1. 模块级单例 —— 任意组件调用 useSrTheme() 共享同一份状态，避免多处状态打架
 * 2. 所有浏览器 API 都有 SSR 判断，服务端调用不会抛错
 * 3. 写 DOM 的位置唯一：applyToDom()，便于排查与测试
 * 4. 持久化失败（隐私模式）静默降级，不影响主题生效
 */

import { computed, readonly, ref, watch } from 'vue'

import type { SrResolvedTheme, SrStyleMode, SrThemeMode } from '../types/theme'
import { srDerivePrimaryScale } from '../utils/color'

/** localStorage 键（带 sr- 前缀，避免与业务键冲突） */
export const SR_THEME_STORAGE_KEY = 'sr-theme'
export const SR_STYLE_STORAGE_KEY = 'sr-style'
export const SR_PRIMARY_STORAGE_KEY = 'sr-primary'
/** 预设主题色代号，与自定义色二选一 */
export const SR_PRESET_STORAGE_KEY = 'sr-primary-preset'

/** 系统暗色媒体查询 */
const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * `init()` 的初始化选项
 *
 * 只影响「localStorage 里还没有用户偏好」的情况。用户手动切过主题之后，
 * 存储里的值优先，这里的默认值不再生效。
 */
export interface SrThemeInitOptions {
  /** 默认明暗模式 @default 'auto' */
  defaultTheme?: SrThemeMode
  /**
   * 默认质感 @default 'flat'
   *
   * 想默认毛玻璃就在这里传 `'glass'`，同时把 `srThemeInitScript()` 的
   * `defaultStyle` 也设成一样的值，否则首帧仍是 flat → glass 闪一下。
   */
  defaultStyle?: SrStyleMode
  /** 默认预设主题色代号 */
  defaultPreset?: string
}

/** 用户意图：light / dark / auto */
const mode = ref<SrThemeMode>('auto')
/** 质感风格 */
const style = ref<SrStyleMode>('flat')
/** 自定义主色，空字符串表示使用主题默认 */
const primary = ref<string>('')
/** 预设主题色代号，空字符串表示未选 */
const preset = ref<string>('')
/** 系统当前是否暗色 */
const systemDark = ref(false)

/** 是否已完成初始化（幂等保护） */
let initialized = false
/** 媒体查询实例，供解绑使用 */
let mediaQuery: MediaQueryList | null = null
/** 媒体查询监听器引用（必须是同一个函数引用才能解绑） */
let systemChangeListener: ((event: MediaQueryListEvent) => void) | null = null
/** storage 监听器引用，供解绑使用 */
let storageListener: ((event: StorageEvent) => void) | null = null

/** 解析后的实际主题 */
const resolved = computed<SrResolvedTheme>(() =>
  mode.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : mode.value,
)

/**
 * 判断是否运行在浏览器环境
 * @returns 客户端返回 true
 */
function isClient(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * 把主题应用到 DOM —— 这是主题生效的唯一出口
 * @param theme 解析后的主题
 * @param currentStyle 当前质感风格
 */
function applyToDom(theme: SrResolvedTheme, currentStyle: SrStyleMode): void {
  if (!isClient()) return
  const root = document.documentElement
  root.setAttribute('data-sr-theme', theme)
  root.setAttribute('data-sr-style', currentStyle)

  // 预设主题色走属性选择器（SSR 友好）；自定义色走内联变量，两者互斥
  if (preset.value) root.setAttribute('data-sr-primary', preset.value)
  else root.removeAttribute('data-sr-primary')
  // 让原生控件（滚动条、表单）跟随明暗
  root.style.colorScheme = theme
}

/**
 * 把主色及其派生色写入目标元素
 * @param target 目标元素
 * @param color 主色，任意合法 CSS 颜色
 */
function applyPrimaryColor(target: HTMLElement, color: string): void {
  const scale = srDerivePrimaryScale(color)
  target.style.setProperty('--sr-color-primary', scale.base)
  target.style.setProperty('--sr-color-primary-text', scale.text)
  target.style.setProperty('--sr-color-primary-hover', scale.hover)
  target.style.setProperty('--sr-color-primary-active', scale.active)
  target.style.setProperty('--sr-color-primary-alpha-25', scale.alpha25)
  target.style.setProperty('--sr-color-primary-alpha-12', scale.alpha12)
  target.style.setProperty('--sr-color-primary-alpha-08', scale.alpha8)
}

/** 内联设置的 6 个主色变量 */
const INLINE_PRIMARY_VARS = [
  '--sr-color-primary',
  '--sr-color-primary-text',
  '--sr-color-primary-hover',
  '--sr-color-primary-active',
  '--sr-color-primary-alpha-25',
  '--sr-color-primary-alpha-12',
  '--sr-color-primary-alpha-08',
]

/**
 * 清除内联主色，把颜色交还给预设或 token 默认值
 * @returns {void}
 */
function clearInlinePrimary(): void {
  if (!isClient()) return
  const root = document.documentElement
  for (const name of INLINE_PRIMARY_VARS) root.style.removeProperty(name)
}

/**
 * 读取持久化偏好
 * @returns 偏好对象；SSR 或读取失败时返回 null
 */
function readPreference(): {
  theme: string | null
  style: string | null
  primary: string | null
  preset: string | null
} | null {
  if (!isClient()) return null
  try {
    return {
      theme: window.localStorage.getItem(SR_THEME_STORAGE_KEY),
      style: window.localStorage.getItem(SR_STYLE_STORAGE_KEY),
      primary: window.localStorage.getItem(SR_PRIMARY_STORAGE_KEY),
      preset: window.localStorage.getItem(SR_PRESET_STORAGE_KEY),
    }
  } catch {
    // Safari 隐私模式下 localStorage 可能直接抛异常
    return null
  }
}

/**
 * 写入持久化偏好
 * @param key 键名
 * @param value 值
 */
function writePreference(key: string, value: string): void {
  if (!isClient()) return
  try {
    if (value) window.localStorage.setItem(key, value)
    else window.localStorage.removeItem(key)
  } catch {
    // 写入失败不影响当前会话的主题表现
  }
}

// 状态变化 → 同步 DOM 与持久化。
// 放在模块顶层而非 init() 内：即使调用方忘记 init()，切换主题也仍然生效。
watch(
  [resolved, style, primary, preset],
  ([theme, currentStyle, currentPrimary]) => {
    applyToDom(theme, currentStyle)
    if (currentPrimary && isClient()) {
      applyPrimaryColor(document.documentElement, currentPrimary)
    }
    writePreference(SR_THEME_STORAGE_KEY, mode.value)
    writePreference(SR_STYLE_STORAGE_KEY, currentStyle)
    writePreference(SR_PRIMARY_STORAGE_KEY, currentPrimary)

    if (currentPrimary) writePreference(SR_PRESET_STORAGE_KEY, '')
    else writePreference(SR_PRESET_STORAGE_KEY, preset.value)
  },
  { flush: 'post' },
)

/**
 * 主题与风格的统一管理
 *
 * @returns 响应式状态与切换方法
 */
export function useSrTheme() {
  /**
   * 初始化：读取持久化偏好、绑定系统主题监听与跨标签页同步
   * 幂等，重复调用不会重复绑定
   * @returns {void}
   */
  function init(options: SrThemeInitOptions = {}): void {
    if (!isClient() || initialized) return
    initialized = true

    const preference = readPreference()

    // 优先级：localStorage 里用户选过的 > 调用方给的默认值 > 模块初始值
    if (preference?.theme === 'light' || preference?.theme === 'dark' || preference?.theme === 'auto') {
      mode.value = preference.theme
    } else if (options.defaultTheme) {
      mode.value = options.defaultTheme
    }

    if (preference?.style === 'glass' || preference?.style === 'flat') {
      style.value = preference.style
    } else if (options.defaultStyle) {
      style.value = options.defaultStyle
    }

    if (preference?.preset) {
      preset.value = preference.preset
    } else if (options.defaultPreset) {
      preset.value = options.defaultPreset
    } else if (preference?.primary) {
      primary.value = preference.primary
    }

    mediaQuery = window.matchMedia(DARK_QUERY)
    systemDark.value = mediaQuery.matches

    /**
     * 系统主题变化回调（仅在 auto 模式下改变结果）
     * @param event 媒体查询事件
     */
    systemChangeListener = (event: MediaQueryListEvent): void => {
      systemDark.value = event.matches
    }
    mediaQuery.addEventListener('change', systemChangeListener)

    /**
     * 跨标签页同步：另一个标签页切换主题时本页跟随
     * @param event storage 事件
     */
    storageListener = (event: StorageEvent): void => {
      if (event.key === SR_THEME_STORAGE_KEY && event.newValue) {
        mode.value = event.newValue as SrThemeMode
      }
      if (event.key === SR_STYLE_STORAGE_KEY && event.newValue) {
        style.value = event.newValue as SrStyleMode
      }
      if (event.key === SR_PRIMARY_STORAGE_KEY) {
        primary.value = event.newValue ?? ''
      }
    }
    window.addEventListener('storage', storageListener)

    // 立即同步一次，保证 init 前手动改过的状态也落到 DOM
    applyToDom(resolved.value, style.value)
    if (primary.value) applyPrimaryColor(document.documentElement, primary.value)
  }

  /**
   * 解绑所有监听（HMR 与测试用）
   * @returns {void}
   */
  function dispose(): void {
    if (mediaQuery && systemChangeListener) {
      mediaQuery.removeEventListener('change', systemChangeListener)
      mediaQuery = null
      systemChangeListener = null
    }
    if (storageListener && isClient()) {
      window.removeEventListener('storage', storageListener)
      storageListener = null
    }
    initialized = false
  }

  /**
   * 设置明暗模式
   * @param next 目标模式，'auto' 表示跟随系统
   */
  function setTheme(next: SrThemeMode): void {
    mode.value = next
  }

  /**
   * 在 light / dark 之间切换
   * auto 状态下按当前生效值取反，避免「点了没反应」
   */
  function toggleTheme(): void {
    mode.value = resolved.value === 'dark' ? 'light' : 'dark'
  }

  /**
   * 设置质感风格
   * @param next 目标风格
   */
  function setStyle(next: SrStyleMode): void {
    style.value = next
  }

  /** 在 glass / flat 之间切换 */
  function toggleStyle(): void {
    style.value = style.value === 'glass' ? 'flat' : 'glass'
  }

  /**
   * 切换预设主题色
   *
   * 走 data-sr-primary 属性，颜色由生成好的 CSS 规则提供，因此 SSR 阶段就正确。
   * @param key 预设代号，如 'dusk'
   */
  function setPreset(key: string): void {
    preset.value = key
    // 预设与自定义色互斥：选预设即清掉内联变量
    primary.value = ''
    clearInlinePrimary()
  }

  /**
   * 设置自定义主题色
   * @param color 任意合法 CSS 颜色
   * @param scope 作用域元素；不传则作用于全局并持久化
   */
  function setPrimaryColor(color: string, scope?: HTMLElement): void {
    if (!isClient()) return
    const target = scope ?? document.documentElement
    applyPrimaryColor(target, color)

    // 只有全局主色才进入状态与持久化，局部作用域仅影响当次渲染
    if (!scope) {
      // 与预设互斥：自定义色会覆盖属性选择器的结果
      preset.value = ''
      primary.value = color
    }
  }

  /** 恢复默认主题色（交还给 tokens 定义的品牌色） */
  function resetPrimaryColor(): void {
    if (!isClient()) return
    primary.value = ''
    preset.value = ''
    clearInlinePrimary()
  }

  return {
    /** 用户意图 */
    mode: readonly(mode),
    /** 实际生效的明暗 */
    resolved,
    /** 质感风格 */
    style: readonly(style),
    /** 自定义主色（空字符串表示默认） */
    primary: readonly(primary),
    /** 当前预设主题色代号（空字符串表示未选） */
    preset: readonly(preset),
    /** 系统是否暗色 */
    systemDark: readonly(systemDark),
    init,
    dispose,
    setTheme,
    toggleTheme,
    setStyle,
    toggleStyle,
    setPrimaryColor,
    setPreset,
    resetPrimaryColor,
  }
}
