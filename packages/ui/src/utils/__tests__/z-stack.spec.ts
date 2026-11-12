import { describe, expect, it } from 'vitest'

import { srAllocZIndex, srFreeZIndex, srNoticeZIndex, srTopZIndex } from '../z-stack'

describe('z-stack', () => {
  it('同族依次递增，归还后层级可复用', () => {
    const first = srAllocZIndex('modal-test', 3000)
    const second = srAllocZIndex('modal-test', 3000)

    expect(first).toBe(3000)
    expect(second).toBe(3010)

    srFreeZIndex(second)
    srFreeZIndex(first)

    // 归还后重新分配回到基数，不会「开一次涨一格」
    expect(srAllocZIndex('modal-test', 3000)).toBe(3000)
    srFreeZIndex(3000)
  })

  it('栈顶取已分配的最大值', () => {
    const low = srAllocZIndex('layer-test-low', 1000)
    const high = srAllocZIndex('layer-test-high', 4000)

    expect(srTopZIndex()).toBeGreaterThanOrEqual(high)
    expect(srTopZIndex()).toBeGreaterThan(low)

    srFreeZIndex(high)
    srFreeZIndex(low)
  })

  it('全局提示始终高于当前浮层', () => {
    const modal = srAllocZIndex('notice-test', 3000)
    expect(srNoticeZIndex()).toBeGreaterThan(srTopZIndex())
    expect(srNoticeZIndex()).toBeGreaterThan(modal)

    srFreeZIndex(modal)
  })

  it('归还未分配的层级不报错', () => {
    expect(() => srFreeZIndex(999999)).not.toThrow()
  })
})
