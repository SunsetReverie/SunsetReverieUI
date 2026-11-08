import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'

import { encodeQr, getCapacity, pickVersion, type SrQrLevel } from '../src/encoder'

/**
 * 把矩阵渲染成像素并用 jsQR 解码
 *
 * 这是最硬的验证：光看结构对不对说明不了问题，
 * 能被解码器读回原文才证明编码正确。
 * @param matrix 模块矩阵
 * @param scale 每模块像素数
 * @returns 解码出的文本，失败返回 null
 */
function roundTrip(matrix: boolean[][], scale = 4): string | null {
  const quiet = 4
  const modules = matrix.length
  const size = (modules + quiet * 2) * scale
  const data = new Uint8ClampedArray(size * size * 4)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const mx = Math.floor(x / scale) - quiet
      const my = Math.floor(y / scale) - quiet
      const inRange = mx >= 0 && my >= 0 && mx < modules && my < modules
      const dark = inRange ? (matrix[my]?.[mx] ?? false) : false
      const value = dark ? 0 : 255
      const index = (y * size + x) * 4

      data[index] = value
      data[index + 1] = value
      data[index + 2] = value
      data[index + 3] = 255
    }
  }

  return jsQR(data, size, size)?.data ?? null
}

describe('encodeQr', () => {
  it('编码短文本并能被解码还原', () => {
    const result = encodeQr('HELLO', 'M')
    expect(result).not.toBeNull()
    expect(roundTrip(result!.modules)).toBe('HELLO')
  })

  it('编码 URL 并能还原', () => {
    const url = 'https://example.com/path?a=1'
    const result = encodeQr(url, 'M')

    expect(result).not.toBeNull()
    expect(roundTrip(result!.modules)).toBe(url)
  })

  it('编码中文并能还原（UTF-8 字节模式）', () => {
    const text = '夕梦 UI 组件库'
    const result = encodeQr(text, 'M')

    expect(result).not.toBeNull()
    expect(roundTrip(result!.modules)).toBe(text)
  })

  it('四个纠错等级都能被解码', () => {
    for (const level of ['L', 'M', 'Q', 'H'] as SrQrLevel[]) {
      const result = encodeQr('TEST', level)
      expect(result, `${level} 等级`).not.toBeNull()
      expect(roundTrip(result!.modules), `${level} 等级`).toBe('TEST')
    }
  })

  it('接近容量上限的内容也能编码', () => {
    // 版本 1-M 容量 14 字节，这里用 12 字节
    const text = 'https://a.cn'
    const result = encodeQr(text, 'M')

    expect(result?.version).toBe(1)
    expect(roundTrip(result!.modules)).toBe(text)
  })

  it('内容过长时返回 null', () => {
    const tooLong = 'x'.repeat(200)
    expect(encodeQr(tooLong, 'H')).toBeNull()
  })
})

describe('矩阵结构', () => {
  it('尺寸符合 version × 4 + 17', () => {
    const result = encodeQr('A', 'M')
    const size = result!.version * 4 + 17

    expect(result!.modules).toHaveLength(size)
    result!.modules.forEach((row) => expect(row).toHaveLength(size))
  })

  it('三个角有定位图案', () => {
    const { modules } = encodeQr('A', 'M')!

    // 左上角 7×7 的外框是黑的
    expect(modules[0]?.[0]).toBe(true)
    expect(modules[0]?.[6]).toBe(true)
    expect(modules[6]?.[0]).toBe(true)
    // 中心 3×3 也是黑的
    expect(modules[3]?.[3]).toBe(true)
    // 中间一圈是白的
    expect(modules[1]?.[1]).toBe(false)

    // 右上、左下同样有
    const size = modules.length
    expect(modules[0]?.[size - 1]).toBe(true)
    expect(modules[size - 1]?.[0]).toBe(true)
  })

  it('时序图案黑白相间', () => {
    const { modules } = encodeQr('A', 'M')!
    const size = modules.length

    // 第 6 行从第 8 列开始黑白交替
    for (let x = 8; x < size - 8; x += 1) {
      expect(modules[6]?.[x], `第 6 行第 ${x} 列`).toBe(x % 2 === 0)
    }
  })

  it('固定的暗模块存在', () => {
    const { modules } = encodeQr('A', 'M')!
    const size = modules.length

    expect(modules[size - 8]?.[8]).toBe(true)
  })
})

describe('容量计算', () => {
  it('版本 1 各等级容量递增', () => {
    const l = getCapacity(1, 'L')
    const m = getCapacity(1, 'M')
    const q = getCapacity(1, 'Q')
    const h = getCapacity(1, 'H')

    expect(l).toBeGreaterThan(m)
    expect(m).toBeGreaterThan(q)
    expect(q).toBeGreaterThan(h)
  })

  it('版本越高容量越大', () => {
    expect(getCapacity(2, 'M')).toBeGreaterThan(getCapacity(1, 'M'))
    expect(getCapacity(4, 'M')).toBeGreaterThan(getCapacity(2, 'M'))
  })

  it('pickVersion 按容量选最小版本', () => {
    expect(pickVersion(10, 'M')).toBe(1)
    expect(pickVersion(20, 'M')).toBe(2)
    expect(pickVersion(40, 'M')).toBe(3)
  })

  it('超出最大版本返回 0', () => {
    expect(pickVersion(999, 'L')).toBe(0)
  })
})
