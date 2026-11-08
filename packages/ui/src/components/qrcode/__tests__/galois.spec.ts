import { describe, expect, it } from 'vitest'

import { gfMul, reedSolomon } from '../src/galois'

describe('gfMul', () => {
  it('任何数乘 0 都是 0', () => {
    expect(gfMul(0, 123)).toBe(0)
    expect(gfMul(123, 0)).toBe(0)
  })

  it('乘 1 保持不变', () => {
    expect(gfMul(1, 200)).toBe(200)
    expect(gfMul(200, 1)).toBe(200)
  })

  it('与公开测试向量一致', () => {
    // 来自 QR 编码规范示例：α^25 × α^50 = α^75
    expect(gfMul(0x02, 0x03)).toBe(0x06)
    // 0x80 × 0x02 会溢出，需要模本原多项式
    expect(gfMul(0x80, 0x02)).toBe(0x1d)
  })

  it('满足交换律', () => {
    for (const [a, b] of [
      [7, 91],
      [123, 45],
      [255, 3],
    ]) {
      expect(gfMul(a as number, b as number)).toBe(gfMul(b as number, a as number))
    }
  })
})

describe('reedSolomon', () => {
  it('与 Thonky 教程的已知结果一致（HELLO WORLD 的 10 位纠错码）', () => {
    const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17]
    const ecc = reedSolomon(data, 10)

    expect(ecc).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23])
  })

  it('相同数据产生相同纠错码（确定性）', () => {
    const data = [1, 2, 3, 4, 5]
    expect(reedSolomon(data, 10)).toEqual(reedSolomon(data, 10))
  })

  it('全零数据产生全零纠错码', () => {
    const ecc = reedSolomon(new Array<number>(10).fill(0), 10)
    expect(ecc.every((byte) => byte === 0)).toBe(true)
  })

  it('纠错码长度等于要求的字数', () => {
    for (const degree of [7, 10, 13, 17, 22, 30]) {
      expect(reedSolomon([1, 2, 3], degree)).toHaveLength(degree)
    }
  })
})
