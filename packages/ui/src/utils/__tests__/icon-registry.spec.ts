import { describe, expect, it } from 'vitest'

import { srRegisterIcons } from '../icon-registry'

/** 一个最小的合法集合，用于验证注册链路不会抛错 */
const demoCollection = {
  prefix: 'demo',
  width: 24,
  height: 24,
  icons: {
    dot: { body: '<path d="M0 0h24v24H0z" />' },
  },
}

describe('srRegisterIcons', () => {
  it('接受对象形式的集合映射', () => {
    expect(() => srRegisterIcons({ demo: demoCollection })).not.toThrow()
  })

  it('接受数组形式的集合列表', () => {
    expect(() => srRegisterIcons([demoCollection])).not.toThrow()
  })

  it('空对象与非法数据静默跳过，不抛错', () => {
    expect(() => srRegisterIcons({})).not.toThrow()
    expect(() => srRegisterIcons([null, undefined, 'oops'] as unknown[])).not.toThrow()
  })

  it('重复注册同一集合保持幂等', () => {
    expect(() => {
      srRegisterIcons({ demo: demoCollection })
      srRegisterIcons({ demo: demoCollection })
    }).not.toThrow()
  })
})
