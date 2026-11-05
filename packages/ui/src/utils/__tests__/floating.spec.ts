import { describe, expect, it } from 'vitest'

import {
  srComputeFloating,
  srFlipPlacement,
  srGetRect,
  type SrFloatingOptions,
  type SrPlacement,
} from '../floating'

/** 视口：1000 × 800 */
const viewport = { width: 1000, height: 800 }

/**
 * 构造定位参数
 * @param overrides 覆盖项
 * @returns 完整参数
 */
function makeOptions(overrides: Partial<SrFloatingOptions> = {}): SrFloatingOptions {
  return {
    reference: { top: 400, left: 400, width: 100, height: 40 },
    floating: { width: 120, height: 60 },
    placement: 'top',
    offset: 8,
    viewport,
    padding: 8,
    ...overrides,
  }
}

describe('srFlipPlacement', () => {
  it('主轴翻到对面，保留 start / end 对齐', () => {
    expect(srFlipPlacement('top')).toBe('bottom')
    expect(srFlipPlacement('bottom-start')).toBe('top-start')
    expect(srFlipPlacement('left-end')).toBe('right-end')
    expect(srFlipPlacement('right')).toBe('left')
  })

  it('连续翻转两次回到原位', () => {
    const placements: SrPlacement[] = ['top', 'bottom-start', 'left-end', 'right']
    for (const placement of placements) {
      expect(srFlipPlacement(srFlipPlacement(placement))).toBe(placement)
    }
  })
})

describe('srComputeFloating', () => {
  it('top：浮层在触发元素正上方，水平居中', () => {
    const result = srComputeFloating(makeOptions({ placement: 'top' }))

    // 400 + 40/2 - 120/2 = 390
    expect(result.left).toBe(390)
    // 400 - 60 - 8 = 332
    expect(result.top).toBe(332)
    expect(result.placement).toBe('top')
    expect(result.flipped).toBe(false)
  })

  it('bottom：浮层在下方，间距生效', () => {
    const result = srComputeFloating(makeOptions({ placement: 'bottom' }))

    // 400 + 40 + 8 = 448
    expect(result.top).toBe(448)
  })

  it('left / right：垂直居中', () => {
    const left = srComputeFloating(makeOptions({ placement: 'left' }))
    // 400 - 120 - 8 = 272；400 + 40/2 - 60/2 = 390
    expect([left.left, left.top]).toEqual([272, 390])

    const right = srComputeFloating(makeOptions({ placement: 'right' }))
    // 400 + 100 + 8 = 508
    expect(right.left).toBe(508)
  })

  it('start / end 对齐到触发元素的两端', () => {
    const start = srComputeFloating(makeOptions({ placement: 'bottom-start' }))
    expect(start.left).toBe(400)

    const end = srComputeFloating(makeOptions({ placement: 'bottom-end' }))
    // 400 + 100 - 120 = 380
    expect(end.left).toBe(380)
  })

  it('上方空间不足时翻转到下方', () => {
    const result = srComputeFloating(
      makeOptions({
        placement: 'top',
        // 顶部只剩 20px，放不下 60px 的浮层
        reference: { top: 20, left: 400, width: 100, height: 40 },
      }),
    )

    expect(result.placement).toBe('bottom')
    expect(result.flipped).toBe(true)
  })

  it('下方也放不下时不翻转（保持原方位，交给 shift 处理）', () => {
    const result = srComputeFloating(
      makeOptions({
        placement: 'bottom',
        reference: { top: 780, left: 400, width: 100, height: 40 },
      }),
    )

    // 上方是空的，能放下，所以会翻上去
    expect(result.placement).toBe('top')
    expect(result.flipped).toBe(true)
  })

  it('flip: false 时即使放不下也不翻转', () => {
    const result = srComputeFloating(
      makeOptions({
        placement: 'top',
        flip: false,
        reference: { top: 20, left: 400, width: 100, height: 40 },
      }),
    )

    expect(result.placement).toBe('top')
    expect(result.flipped).toBe(false)
  })

  it('交叉轴超出左边界时平移到安全区', () => {
    const result = srComputeFloating(
      makeOptions({
        placement: 'bottom',
        // 触发元素贴近左边缘，居中会让浮层左溢出
        reference: { top: 200, left: 0, width: 40, height: 40 },
      }),
    )

    expect(result.left).toBe(8)
  })

  it('交叉轴超出右边界时平移到安全区', () => {
    const result = srComputeFloating(
      makeOptions({
        placement: 'bottom',
        reference: { top: 200, left: 960, width: 40, height: 40 },
      }),
    )

    // 1000 - 120 - 8 = 872
    expect(result.left).toBe(872)
  })

  it('浮层比视口还宽时不会算出负数', () => {
    const result = srComputeFloating(
      makeOptions({
        floating: { width: 1200, height: 60 },
        reference: { top: 200, left: 0, width: 40, height: 40 },
      }),
    )

    expect(result.left).toBeGreaterThanOrEqual(0)
  })

  it('十二个方位都能算出有限数值', () => {
    const placements: SrPlacement[] = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ]

    for (const placement of placements) {
      const result = srComputeFloating(makeOptions({ placement }))
      expect(Number.isFinite(result.top)).toBe(true)
      expect(Number.isFinite(result.left)).toBe(true)
    }
  })
})

describe('srGetRect', () => {
  it('无元素时返回零矩形，不抛错', () => {
    expect(srGetRect(null)).toEqual({ top: 0, left: 0, width: 0, height: 0 })
    expect(srGetRect(undefined)).toEqual({ top: 0, left: 0, width: 0, height: 0 })
  })
})
