/**
 * 演示站的动效模式切换
 *
 * 库层只提供 `[data-sr-motion='none' | 'strong']` 两组 CSS 变量覆盖，
 * light 是默认值（不写属性）。这层负责 DOM 属性、持久化与 URL 参数。
 */

/** 三档动效模式 */
export type SrMotionMode = 'none' | 'light' | 'strong'

/** 存储键 */
export const SR_MOTION_STORAGE_KEY = 'sr-motion'

/** 菜单选项 */
export const MOTION_MODES: readonly { key: SrMotionMode; label: string; hint: string }[] = [
  { key: 'none', label: '无', hint: '关闭全部动效' },
  { key: 'light', label: '轻', hint: '克制的默认手感' },
  { key: 'strong', label: '强', hint: '更长的时长与更明显的位移' },
]

/**
 * 判断字符串是否为合法档位
 * @param value 待判断的值
 * @returns 合法返回 true
 */
function isMode(value: string | null): value is SrMotionMode {
  return value === 'none' || value === 'light' || value === 'strong'
}

/**
 * 读取当前应生效的模式：URL 参数 > localStorage > 默认 light
 * @returns 动效模式
 */
export function readMotion(): SrMotionMode {
  const fromUrl = new URLSearchParams(window.location.search).get('motion')
  if (isMode(fromUrl)) return fromUrl

  try {
    const saved = window.localStorage.getItem(SR_MOTION_STORAGE_KEY)
    if (isMode(saved)) return saved
  } catch {
    // 隐私模式下 localStorage 不可用，回落默认值
  }

  return 'light'
}

/**
 * 应用模式并持久化
 * @param mode 动效模式
 * @returns {void}
 */
export function applyMotion(mode: SrMotionMode): void {
  const root = document.documentElement

  // light 是默认值，移除属性即可 —— 避免无意义的属性常驻在 html 上
  if (mode === 'light') root.removeAttribute('data-sr-motion')
  else root.setAttribute('data-sr-motion', mode)

  try {
    window.localStorage.setItem(SR_MOTION_STORAGE_KEY, mode)
  } catch {
    // 同上，静默降级
  }
}
