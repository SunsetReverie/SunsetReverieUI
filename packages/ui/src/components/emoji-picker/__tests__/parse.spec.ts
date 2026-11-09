import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { SrEmojiPackage } from '../src/emoji-picker'
import { buildEmojiMap, parseEmojiText, stringifyEmoji } from '../src/parse'

/** 测试用表情包 */
const packages: SrEmojiPackage[] = [
  {
    key: 'a',
    name: 'A',
    emojis: [
      { name: '微笑', char: '🙂' },
      { name: '赞', url: '/a.png' },
    ],
  },
  {
    key: 'b',
    name: 'B',
    emojis: [{ name: '微笑', char: '😄' }],
  },
]

beforeAll(() => {
  // 重名用例会触发开发环境告警，测试里屏蔽掉，避免输出干扰
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

describe('buildEmojiMap', () => {
  it('建立名称到表情的映射', () => {
    const map = buildEmojiMap(packages)
    expect(map.size).toBe(2)
    expect(map.get('微笑')?.char).toBe('🙂')
    expect(map.get('赞')?.url).toBe('/a.png')
  })

  it('重名以先出现的为准', () => {
    const map = buildEmojiMap(packages)
    // 第二个包里的「微笑」被忽略
    expect(map.get('微笑')?.char).toBe('🙂')
  })

  it('跳过既无 char 又无 url 的项', () => {
    const map = buildEmojiMap([{ key: 'x', name: 'X', emojis: [{ name: '空项' }] }])
    expect(map.has('空项')).toBe(false)
  })

  it('空列表返回空表', () => {
    expect(buildEmojiMap([]).size).toBe(0)
  })
})

describe('parseEmojiText', () => {
  const map = buildEmojiMap(packages)

  it('无标记时整段返回文本', () => {
    const segments = parseEmojiText('一段普通文字', map)
    expect(segments).toEqual([{ type: 'text', value: '一段普通文字' }])
  })

  it('单个标记切成三段', () => {
    const segments = parseEmojiText('今天[微笑]了', map)

    expect(segments).toHaveLength(3)
    expect(segments[0]).toEqual({ type: 'text', value: '今天' })
    expect(segments[1]?.type).toBe('emoji')
    expect(segments[1]?.value).toBe('[微笑]')
    expect(segments[1]?.emoji?.char).toBe('🙂')
    expect(segments[2]).toEqual({ type: 'text', value: '了' })
  })

  it('多个标记连续出现', () => {
    const segments = parseEmojiText('[微笑][赞]', map)
    expect(segments.map((item) => item.type)).toEqual(['emoji', 'emoji'])
  })

  it('查不到的名称原样当文本', () => {
    const segments = parseEmojiText('[不存在的]', map)
    expect(segments).toEqual([{ type: 'text', value: '[不存在的]' }])
  })

  it('标记在开头和最末尾都能切对', () => {
    const head = parseEmojiText('[微笑]后面', map)
    expect(head[0]?.type).toBe('emoji')
    expect(head[1]).toEqual({ type: 'text', value: '后面' })

    const tail = parseEmojiText('前面[赞]', map)
    expect(tail[0]).toEqual({ type: 'text', value: '前面' })
    expect(tail[1]?.type).toBe('emoji')
  })

  it('空字符串返回空数组', () => {
    expect(parseEmojiText('', map)).toEqual([])
  })

  it('嵌套方括号不会被误判', () => {
    const segments = parseEmojiText('[[微笑]]', map)
    // 内层能被识别，外层方括号当普通文本
    const joined = segments.map((item) => item.value).join('')
    expect(joined).toBe('[[微笑]]')
  })

  it('多次调用结果一致（正则 lastIndex 不残留）', () => {
    const first = parseEmojiText('[微笑]a', map)
    const second = parseEmojiText('[微笑]a', map)
    expect(second).toEqual(first)
  })
})

describe('stringifyEmoji', () => {
  it('拼出标记文本', () => {
    expect(stringifyEmoji({ name: '微笑', char: '🙂' })).toBe('[微笑]')
  })
})
