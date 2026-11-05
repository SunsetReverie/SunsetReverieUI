/**
 * 颜色工具
 *
 * 用途：运行期切换主题色时，由单一主色派生 hover / active / alpha 系列。
 * 优先用 CSS 的 color-mix()（零 JS 计算），不支持时用 HSL 调整兜底。
 */

/** 派生出的主色系列变量名（不含 --sr- 前缀） */
export interface SrPrimaryScale {
  /** 主色本身 */
  base: string
  /** 文字专用主色：加深后保证正文对比度 */
  text: string
  /** 悬停态 */
  hover: string
  /** 按下态 */
  active: string
  /** 25% 透明 */
  alpha25: string
  /** 12% 透明 */
  alpha12: string
  /** 8% 透明 */
  alpha8: string
}

/**
 * 检测浏览器是否支持 color-mix()
 * @returns 支持返回 true
 */
export function srSupportsColorMix(): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false
  return CSS.supports('color', 'color-mix(in oklab, red 50%, white)')
}

/**
 * 把 #RGB / #RRGGBB 解析为 HSL 分量
 * @param hex 十六进制颜色
 * @returns HSL 分量；格式非法时返回 null
 */
export function srHexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const matched = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!matched) return null

  let value = matched[1]
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }

  const r = Number.parseInt(value.slice(0, 2), 16) / 255
  const g = Number.parseInt(value.slice(2, 4), 16) / 255
  const b = Number.parseInt(value.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s, l }
}

/**
 * 把 HSL 分量转回 hex
 * @param h 色相 0~360
 * @param s 饱和度 0~1
 * @param l 亮度 0~1
 * @returns 六位 hex 字符串
 */
export function srHslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let rgb: [number, number, number]
  if (h < 60) rgb = [c, x, 0]
  else if (h < 120) rgb = [x, c, 0]
  else if (h < 180) rgb = [0, c, x]
  else if (h < 240) rgb = [0, x, c]
  else if (h < 300) rgb = [x, 0, c]
  else rgb = [c, 0, x]

  const toHex = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v + m)) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

/**
 * 调整颜色亮度
 * @param color 任意 hex 颜色
 * @param amount 亮度增量（-1 ~ 1），正数变亮
 * @returns 调整后的 hex；解析失败时原样返回
 */
export function srAdjustLightness(color: string, amount: number): string {
  const hsl = srHexToHsl(color)
  if (!hsl) return color
  const l = Math.min(1, Math.max(0, hsl.l + amount))
  return srHslToHex(hsl.h, hsl.s, l)
}

/**
 * 由单一主色派生完整交互色阶
 *
 * 支持 color-mix 时直接交给 CSS 计算，主题色可以是任意合法 CSS 颜色（含 oklch）；
 * 不支持时退化为 hex + HSL 调整，仅对 hex 输入有效。
 * @param color 主色
 * @returns 派生出的变量值
 */
export function srDerivePrimaryScale(color: string): SrPrimaryScale {
  if (srSupportsColorMix()) {
    return {
      base: color,
      // 亮色主题下文字需要更深；暗色主题由 CSS 层的 --sr-color-primary-text 兜底
      text: `color-mix(in oklab, ${color} 82%, black)`,
      hover: `color-mix(in oklab, ${color} 88%, white)`,
      active: `color-mix(in oklab, ${color} 84%, black)`,
      alpha25: `color-mix(in oklab, ${color} 25%, transparent)`,
      alpha12: `color-mix(in oklab, ${color} 12%, transparent)`,
      alpha8: `color-mix(in oklab, ${color} 8%, transparent)`,
    }
  }

  const hover = srAdjustLightness(color, 0.06)
  const active = srAdjustLightness(color, -0.06)
  const hsl = srHexToHsl(color)

  // 无 color-mix 时用 rgba 拼透明，要求能解析出 rgb
  const rgb = hsl ? srHexToRgbTriplet(srHslToHex(hsl.h, hsl.s, hsl.l)) : null
  const alpha = (a: number) => (rgb ? `rgba(${rgb}, ${a})` : color)

  return {
    base: color,
    text: srAdjustLightness(color, -0.16),
    hover,
    active,
    alpha25: alpha(0.25),
    alpha12: alpha(0.12),
    alpha8: alpha(0.08),
  }
}

/**
 * 把 hex 转为 "r, g, b" 三元组字符串
 * @param hex 六位 hex
 * @returns 形如 "255, 122, 69"
 */
function srHexToRgbTriplet(hex: string): string | null {
  const matched = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!matched) return null
  const value = matched[1]
  return [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16)).join(', ')
}
