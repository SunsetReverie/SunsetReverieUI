import { describe, expect, it } from 'vitest'

import {
  formatColor,
  hslToRgb,
  isSameColor,
  parseColor,
  rgbToHsl,
  toHex,
  toHslString,
  toRgbString,
} from '../src/color-utils'

describe('parseColor', () => {
  it('解析六位 hex', () => {
    expect(parseColor('#3e3edc')).toEqual({ r: 62, g: 62, b: 220, a: 1 })
  })

  it('解析三位简写', () => {
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 })
  })

  it('解析八位 hex（带 alpha）', () => {
    const color = parseColor('#3e3edc80')
    expect(color?.a).toBeCloseTo(128 / 255, 2)
  })

  it('解析 rgb()', () => {
    expect(parseColor('rgb(62, 62, 220)')).toEqual({ r: 62, g: 62, b: 220, a: 1 })
  })

  it('解析 rgba()', () => {
    expect(parseColor('rgba(62, 62, 220, 0.5)')?.a).toBe(0.5)
  })

  it('解析 hsl()', () => {
    const color = parseColor('hsl(240, 70%, 55%)')
    expect(color?.r).toBeGreaterThan(50)
    expect(color?.b).toBeGreaterThan(200)
  })

  it('解析 hsla()', () => {
    expect(parseColor('hsla(240, 70%, 55%, 0.4)')?.a).toBe(0.4)
  })

  it('无法识别时返回 null', () => {
    expect(parseColor('red')).toBeNull()
    expect(parseColor('')).toBeNull()
    expect(parseColor(undefined)).toBeNull()
    expect(parseColor('#xyz')).toBeNull()
  })

  it('超出范围的分量被夹住', () => {
    expect(parseColor('rgb(300, -20, 100)')).toEqual({ r: 255, g: 0, b: 100, a: 1 })
  })
})

describe('rgbToHsl', () => {
  it('纯红是 0°', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 100, l: 50, a: 1 })
  })

  it('纯绿是 120°', () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0, a: 1 }).h).toBe(120)
  })

  it('纯蓝是 240°', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255, a: 1 }).h).toBe(240)
  })

  it('灰色饱和度是 0', () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128, a: 1 })).toEqual({ h: 0, s: 0, l: 50, a: 1 })
  })

  it('白色亮度 100', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255, a: 1 }).l).toBe(100)
  })

  it('黑色亮度 0', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0, a: 1 }).l).toBe(0)
  })
})

describe('hslToRgb', () => {
  it('色相 0 是纯红', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50, a: 1 })).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('色相 120 是纯绿', () => {
    expect(hslToRgb({ h: 120, s: 100, l: 50, a: 1 })).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('色相 240 是纯蓝', () => {
    expect(hslToRgb({ h: 240, s: 100, l: 50, a: 1 })).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('饱和度 0 是灰阶', () => {
    const rgb = hslToRgb({ h: 200, s: 0, l: 50, a: 1 })
    expect(rgb.r).toBe(rgb.g)
    expect(rgb.g).toBe(rgb.b)
  })

  it('色相超过 360 会回绕', () => {
    expect(hslToRgb({ h: 360, s: 100, l: 50, a: 1 })).toEqual({ r: 255, g: 0, b: 0 })
    expect(hslToRgb({ h: 480, s: 100, l: 50, a: 1 })).toEqual({ r: 0, g: 255, b: 0 })
  })
})

describe('互转可逆', () => {
  it('rgb → hsl → rgb 保持一致', () => {
    const samples = [
      { r: 62, g: 62, b: 220, a: 1 },
      { r: 255, g: 122, b: 69, a: 1 },
      { r: 18, g: 140, b: 96, a: 1 },
      { r: 128, g: 128, b: 128, a: 1 },
    ]

    for (const color of samples) {
      const back = hslToRgb(rgbToHsl(color))
      // hsl 的分量取整会带来 ±2 的误差
      expect(Math.abs(back.r - color.r)).toBeLessThanOrEqual(2)
      expect(Math.abs(back.g - color.g)).toBeLessThanOrEqual(2)
      expect(Math.abs(back.b - color.b)).toBeLessThanOrEqual(2)
    }
  })
})

describe('格式化输出', () => {
  const color = { r: 62, g: 62, b: 220, a: 1 }

  it('toHex', () => {
    expect(toHex(color)).toBe('#3e3edc')
  })

  it('toHex 带 alpha', () => {
    expect(toHex({ ...color, a: 0.5 }, true)).toBe('#3e3edc80')
  })

  it('toRgbString', () => {
    expect(toRgbString(color)).toBe('rgb(62, 62, 220)')
  })

  it('toRgbString 带 alpha', () => {
    expect(toRgbString({ ...color, a: 0.5 }, true)).toBe('rgba(62, 62, 220, 0.5)')
  })

  it('toHslString', () => {
    expect(toHslString(color)).toBe('hsl(240, 69%, 55%)')
  })

  it('formatColor 按格式分发', () => {
    expect(formatColor(color, 'hex')).toBe('#3e3edc')
    expect(formatColor(color, 'rgb')).toBe('rgb(62, 62, 220)')
    expect(formatColor(color, 'hsl')).toContain('hsl(')
  })
})

describe('isSameColor', () => {
  it('不同格式的同一颜色视为相同', () => {
    expect(isSameColor('#3e3edc', 'rgb(62, 62, 220)')).toBe(true)
    expect(isSameColor('#3e3edc', 'hsl(240, 69%, 55%)')).toBe(true)
  })

  it('不同颜色返回 false', () => {
    expect(isSameColor('#3e3edc', '#000000')).toBe(false)
  })

  it('无法解析时返回 false', () => {
    expect(isSameColor('red', '#3e3edc')).toBe(false)
    expect(isSameColor(undefined, '#3e3edc')).toBe(false)
  })
})
