/**
 * 颜色解析与转换
 *
 * 只支持三种输入：hex、rgb()/rgba()、hsl()/hsla()。
 * 命名色（red / tomato）不认——需要的话先让浏览器算成 rgb 再传进来。
 */

/** 解析后的颜色 */
export interface SrRgba {
  /** 红 0~255 */
  r: number
  /** 绿 0~255 */
  g: number
  /** 蓝 0~255 */
  b: number
  /** 透明度 0~1 */
  a: number
}

/** HSL 形态 */
export interface SrHsla {
  /** 色相 0~360 */
  h: number
  /** 饱和度 0~100 */
  s: number
  /** 亮度 0~100 */
  l: number
  /** 透明度 0~1 */
  a: number
}

/**
 * 把数值夹到区间内
 * @param value 原值
 * @param min 下限
 * @param max 上限
 * @returns 夹住后的值
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * 补零到两位十六进制
 * @param value 0~255
 * @returns 十六进制字符串
 */
function hex2(value: number): string {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0')
}

/**
 * 解析 hex
 * @param input 形如 #abc / #aabbcc / #aabbccdd
 * @returns 颜色，格式不对返回 null
 */
function parseHex(input: string): SrRgba | null {
  const raw = input.replace('#', '').trim()

  if (!/^[0-9a-f]{3,8}$/i.test(raw)) return null

  // 三位简写：#abc → #aabbcc
  if (raw.length === 3) {
    const [r, g, b] = raw.split('')
    return {
      r: parseInt(`${r}${r}`, 16),
      g: parseInt(`${g}${g}`, 16),
      b: parseInt(`${b}${b}`, 16),
      a: 1,
    }
  }

  if (raw.length === 6 || raw.length === 8) {
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
      a: raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1,
    }
  }

  return null
}

/**
 * 解析 rgb() / rgba()
 * @param input 函数式颜色
 * @returns 颜色，格式不对返回 null
 */
function parseRgb(input: string): SrRgba | null {
  const match = input.match(
    /^rgba?\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+(-?[\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i,
  )
  if (!match) return null

  const alphaRaw = match[4]
  const alpha = alphaRaw
    ? alphaRaw.endsWith('%')
      ? Number.parseFloat(alphaRaw) / 100
      : Number.parseFloat(alphaRaw)
    : 1

  return {
    r: clamp(Number.parseFloat(match[1] ?? '0'), 0, 255),
    g: clamp(Number.parseFloat(match[2] ?? '0'), 0, 255),
    b: clamp(Number.parseFloat(match[3] ?? '0'), 0, 255),
    a: clamp(alpha, 0, 1),
  }
}

/**
 * HSL 转 RGB
 * @param hsl hsl 分量
 * @returns rgb 分量（0~255）
 */
export function hslToRgb(hsl: SrHsla): { r: number; g: number; b: number } {
  const h = ((hsl.h % 360) + 360) % 360
  const s = clamp(hsl.s, 0, 100) / 100
  const l = clamp(hsl.l, 0, 100) / 100

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

  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  }
}

/**
 * RGB 转 HSL
 * @param color rgb 颜色
 * @returns hsl 分量
 */
export function rgbToHsl(color: SrRgba): SrHsla {
  const r = clamp(color.r, 0, 255) / 255
  const g = clamp(color.g, 0, 255) / 255
  const b = clamp(color.b, 0, 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / delta + 2) * 60
    else h = ((r - g) / delta + 4) * 60
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: color.a,
  }
}

/**
 * 解析任意支持的颜色
 * @param input 颜色字符串
 * @returns 颜色，无法识别返回 null
 */
export function parseColor(input: string | undefined | null): SrRgba | null {
  if (!input) return null

  const value = input.trim()
  if (!value) return null

  if (value.startsWith('#')) return parseHex(value)
  if (/^rgba?\(/i.test(value)) return parseRgb(value)

  if (/^hsla?\(/i.test(value)) {
    const match = value.match(
      /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+%?))?\s*\)$/i,
    )
    if (!match) return null

    const alphaRaw = match[4]
    const alpha = alphaRaw
      ? alphaRaw.endsWith('%')
        ? Number.parseFloat(alphaRaw) / 100
        : Number.parseFloat(alphaRaw)
      : 1

    const rgb = hslToRgb({
      h: Number.parseFloat(match[1] ?? '0'),
      s: Number.parseFloat(match[2] ?? '0'),
      l: Number.parseFloat(match[3] ?? '0'),
      a: alpha,
    })

    return { ...rgb, a: clamp(alpha, 0, 1) }
  }

  return null
}

/**
 * 转 hex
 * @param color 颜色
 * @param withAlpha 是否带透明度（输出 8 位）
 * @returns #rrggbb 或 #rrggbbaa
 */
export function toHex(color: SrRgba, withAlpha = false): string {
  const base = `#${hex2(color.r)}${hex2(color.g)}${hex2(color.b)}`
  return withAlpha ? `${base}${hex2(color.a * 255)}` : base
}

/**
 * 转 rgb() / rgba()
 * @param color 颜色
 * @param withAlpha 是否输出 alpha
 * @returns 函数式字符串
 */
export function toRgbString(color: SrRgba, withAlpha = false): string {
  const r = Math.round(clamp(color.r, 0, 255))
  const g = Math.round(clamp(color.g, 0, 255))
  const b = Math.round(clamp(color.b, 0, 255))
  const a = Math.round(clamp(color.a, 0, 1) * 100) / 100

  return withAlpha ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
}

/**
 * 转 hsl() / hsla()
 * @param color 颜色
 * @param withAlpha 是否输出 alpha
 * @returns 函数式字符串
 */
export function toHslString(color: SrRgba, withAlpha = false): string {
  const hsl = rgbToHsl(color)
  const a = Math.round(clamp(color.a, 0, 1) * 100) / 100

  return withAlpha ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
}

/**
 * 按目标格式输出
 * @param color 颜色
 * @param format 目标格式
 * @param withAlpha 是否带透明度
 * @returns 颜色字符串
 */
export function formatColor(color: SrRgba, format: 'hex' | 'rgb' | 'hsl', withAlpha = false): string {
  if (format === 'rgb') return toRgbString(color, withAlpha)
  if (format === 'hsl') return toHslString(color, withAlpha)
  return toHex(color, withAlpha)
}

/**
 * 判断两个颜色是否相同（忽略格式差异）
 *
 * 留了 ±1 的容差：hsl 的分量是取整存的，
 * `#3e3edc` 转成 `hsl(240, 69%, 55%)` 再转回来是 `rgb(61, 61, 219)`，
 * 严格相等会判成两个颜色，导致「输出值又被当成新值」的循环更新。
 * @param a 颜色字符串
 * @param b 颜色字符串
 * @returns 是否相同
 */
export function isSameColor(a: string | undefined, b: string | undefined): boolean {
  const left = parseColor(a)
  const right = parseColor(b)
  if (!left || !right) return false

  return (
    Math.abs(left.r - right.r) <= 1 &&
    Math.abs(left.g - right.g) <= 1 &&
    Math.abs(left.b - right.b) <= 1 &&
    Math.abs(left.a - right.a) <= 0.02
  )
}
